import fs from 'fs';
import https from 'https';
import { parseString } from 'xml2js';
import { difference, map, flatten, keyBy, get, pick, groupBy } from 'lodash';
import { config } from 'dotenv';

import { Inventory } from './Inventory.module';
import { GenericModule } from './Generic.module';
import { ImageModule, ImageXMLModel } from './image.module';
import { transformStringToKey } from '../utils/Helper';
import { ProductTagModule } from './ProductTag.module';

import ProductModel from '../models/Product.model';
import ProductTagMapping from '../models/ProductTagMapping.model';
import Vendor from '../models/Vendor.model';
import ProductType from '../models/ProductType.model';
import PublishedScope from '../models/PublishedScope.model';
import ProductTag from '../models/ProductTag.model';


export interface Product {
    title: string;
    'body-html'?: string;
    vendor: string;
    'product-type': string;
    handle: string;
    'published-scope': string;
    tags: string;
    image?: object;
}

interface ProductAttributes {
    title: string;
    html: string;
    vendorId: number;
    scopeId: number;
    imageId: number;
    typeId: number;
}

export class ProductModule {
    public static checkMissingProducts = async (productKeys: string[]): Promise<string[]> => {
        const uniqueKeys = [...new Set(productKeys)];
        const products = await ProductModel.findAll({
            attributes: ['key'],
            where: {
                key: uniqueKeys
            }
        });

        return difference(uniqueKeys, map(products, 'key'));
    }

    public getParsedData = async (filepath: string): Promise<Product[]> => {
        let productData: Product[] = [];
        const fileData = await fs.readFileSync(filepath, 'utf8');

        parseString(fileData, { explicitArray: false }, (error, result: {products: {product: Product[]}}) => {
            productData = result.products.product;
        });

        return productData;
    }

    public verifyData(record: any): boolean {
        return !record.handle || !record['product-type'] || !record['published-scope'] || !record.tags || !record.title || !record.vendor;
    }

    public checkMissingPrerequisites(record: any): Promise<string[]> {
        return Promise.resolve([]);
    }

    public async insertData(record: Inventory[] | Product[], addedBy: number): Promise<boolean> {
        const productData = record as Product[];

        const productKeys = [...new Set(map(productData, 'handle'))];
        const vendorNames = map(productData, 'vendor');
        const productTypeNames = map(productData, 'product-type');
        const publishedScopeNames = map(productData, 'published-scope');
        const productTagNames = flatten(map(productData, (data: Product) => data.tags.split(', ')));
        const productImagesArr: ImageXMLModel[] = map(productData, 'image') as ImageXMLModel[];

        const attributes = ['id', 'key', 'title', 'html', 'vendorId', 'scopeId', 'typeId', 'imageId', 'addedBy', 'updatedBy'];
        const queryObj = {
            attributes,
            where: { key: productKeys }
        };

        const [vendors, productTypes, publishedScopes, productTags, images, existingProducts] = await Promise.all([
            GenericModule.BulkInsertIgnoreData<Vendor>(vendorNames, addedBy, Vendor),
            GenericModule.BulkInsertIgnoreData<ProductType>(productTypeNames, addedBy, ProductType),
            GenericModule.BulkInsertIgnoreData<PublishedScope>(publishedScopeNames, addedBy, PublishedScope),
            GenericModule.BulkInsertIgnoreData<ProductTag>(productTagNames, addedBy, ProductTag),
            ImageModule.BulkInsertIgnoreImage(productImagesArr, addedBy),
            ProductModel.findAll(queryObj)
        ]);

        const vendorsHash = keyBy(vendors, 'key');
        const productTypesHash = keyBy(productTypes, 'key');
        const publishedScopesHash = keyBy(publishedScopes, 'key');
        const productTagsHash = keyBy(productTags, 'key');
        const imagesHash = keyBy(images, 'key');

        const bulkProductsData = productData.map((product) => {
            return {
                key: product.handle,
                title: product.title,
                html: product['body-html'],
                vendorId: vendorsHash[transformStringToKey(product.vendor)].id,
                scopeId: publishedScopesHash[transformStringToKey(product['published-scope'])].id,
                typeId: productTypesHash[transformStringToKey(product['product-type'])].id,
                imageId: imagesHash[get(product, 'image.id._')].id,
                addedBy,
                updatedBy: addedBy
            }
        });

        try {
            await ProductModel.bulkCreate(bulkProductsData, {
                fields: attributes,
                updateOnDuplicate: ['title', 'html', 'vendorId', 'scopeId', 'typeId', 'imageId', 'updatedAt', 'updatedBy'],
                returning: true
            });

            let allAffectedProducts = existingProducts;
            if (existingProducts.length !== productData.length) {
                allAffectedProducts = await ProductModel.findAll(queryObj);
            }

            const productsAndTagMappingData = groupBy(await ProductTagMapping.findAll({
                attributes: ['productId', 'tagId'],
                where: { productId: map(allAffectedProducts, 'id') }
            }), 'productId');

            allAffectedProducts.forEach((product) => {
                product.productTagMappings = productsAndTagMappingData[product.id] || [];
            });

            const changedMappings = await ProductTagModule.mapProductsAndTags(allAffectedProducts, productData, productTagsHash, addedBy);

            this.invokeWebHookAgainstUpdatedRecords(existingProducts, bulkProductsData, changedMappings);
            return true;
        } catch (error) {
            return false;
        }

    }

    private invokeWebHookAgainstUpdatedRecords(existingProducts: ProductModel[], allAffectedProducts: ProductAttributes[], changedMappings: number[]) {
        const keyBasedNewProducts = keyBy(allAffectedProducts, 'key');
        existingProducts.forEach((oldState: ProductModel) => {
            if (this.productChanged(oldState, keyBasedNewProducts[oldState.key]) || changedMappings.includes(oldState.id)) {
                https.get(`${process.env.WEBHOOK_URL}?handle=${oldState.key}`)
            }
        });
    }

    private productChanged(oldState: ProductModel, newState: ProductAttributes) {
        const fieldsToCompare = ['title', 'html', 'vendorId', 'scopeId', 'imageId', 'typeId'];
        return JSON.stringify(pick(oldState, fieldsToCompare)) !== JSON.stringify(pick(newState, fieldsToCompare));
    }
}