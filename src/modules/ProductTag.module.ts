import { difference, map, Dictionary, keyBy, union, concat } from 'lodash';
import ProductTag from '../models/ProductTag.model';
import ProductModel from '../models/Product.model';
import ProductTagMappingModel from '../models/ProductTagMapping.model';
import { Product } from './Product.module';
import { transformStringToKey } from '../utils/Helper';

interface ProductTagMapping {
    productId: number;
    tagId: number;
    addedBy?: number;
}

export class ProductTagModule {

    public static async mapProductsAndTags(products: ProductModel[], productXML: Product[], tags: Dictionary<ProductTag>, addedBy: number): Promise<number[]> {
        const existingTagsAgainstProducts = keyBy(map(products, (product) => {
            return {
                productId: product.id,
                key: product.key,
                tags: map(product.productTagMappings, 'tagId')
            };
        }), 'key');

        let addRelationData: ProductTagMapping[] = [];
        const removeRelationData: {productId: number[], tagId: number[]} = {productId: [], tagId: []};

        productXML.forEach((data: Product) => {
            const expectedTags = map(data.tags.split(', '), (tagKey: string) => tags[transformStringToKey(tagKey)].id);
            let tagMappingToRemove: number[] = [];
            let tagMappingToAdd = expectedTags;
            if (existingTagsAgainstProducts[data.handle]) {
                tagMappingToRemove = difference(existingTagsAgainstProducts[data.handle].tags, expectedTags);
                tagMappingToAdd = difference(expectedTags, existingTagsAgainstProducts[data.handle].tags);
            }

            addRelationData = union(addRelationData, map(tagMappingToAdd, (tagId) => {
                return {
                    productId: existingTagsAgainstProducts[data.handle].productId,
                    tagId,
                    addedBy
                }
            }));

            if (tagMappingToRemove.length) {
                removeRelationData.productId = concat(removeRelationData.productId, existingTagsAgainstProducts[data.handle].productId);
                removeRelationData.tagId = concat(removeRelationData.tagId, tagMappingToRemove);
            }
        });

        await Promise.all([ProductTagMappingModel.destroy({
            where: { productId: removeRelationData.productId, tagId: removeRelationData.tagId }
        }), ProductTagMappingModel.bulkCreate(addRelationData)]);

        return union(removeRelationData.productId, map(addRelationData, 'productId'));

    }

}