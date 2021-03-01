import fs from 'fs';
import { keyBy, map } from 'lodash';
import ProductModel from '../models/Product.model';
import City from '../models/City.model';
import { Product, ProductModule } from './Product.module';
import InventoryModel from '../models/Inventory.model';
import { transformStringToKey } from '../utils/Helper';
import { GenericModule } from './Generic.module';

export interface Inventory {
    handle: string;
    city: string;
    amount: number;
}

export class InventoryModule {
    public getParsedData = async (filepath: string): Promise<Inventory[]> => {
        let inventoryData: Inventory[] = [];
        const fileData = await fs.readFileSync(filepath, 'utf8');

        const rowData = fileData.split(/\n/);
        rowData.shift();
        inventoryData = rowData.map((row) => {
            row = row.replace(/"/g, '');
            const inventoryObj = row.split(';');
            return {
                handle: inventoryObj[0],
                city: inventoryObj[1],
                amount: parseFloat(inventoryObj[2]),
            } as Inventory
        });

        return inventoryData;
    }

    public verifyData(record: any): boolean {
        return (!record.amount && record.amount !== 0) || !record.city || !record.handle;
    }

    public async checkMissingPrerequisites(record: any): Promise<string[]> {
        const productKeys = record.map((obj: Inventory) => obj.handle);
        return ProductModule.checkMissingProducts(productKeys);
    }

    public async insertData(record: Inventory[] | Product[], addedBy: number): Promise<boolean> {
        const inventoryData = record as Inventory[];

        const cityNames = map(inventoryData, 'city');

        const productKeys = inventoryData.map((obj) => obj.handle);
        const productsPromise = ProductModel.findAll({
            attributes: ['id', 'key'],
            where: {
                key: [...new Set(productKeys)]
            }
        })

        const [ products, cities ] = await Promise.all([productsPromise, GenericModule.BulkInsertIgnoreData<City>(cityNames, addedBy, City)]);

        const productHash = keyBy(products, 'key');
        const citiesHash = keyBy(cities, 'key');

        const bulkInventoriesData = inventoryData.map((obj) => {
            return {
                cityId: citiesHash[transformStringToKey(obj.city)].id,
                productId: productHash[obj.handle].id,
                amount: obj.amount,
                addedBy,
                updatedBy: addedBy
            }
        });

        try {
            await InventoryModel.bulkCreate(bulkInventoriesData, {
                fields:['id', 'cityId', 'productId', 'amount', 'addedBy', 'updatedBy'],
                updateOnDuplicate: ['amount', 'updatedAt', 'updatedBy']
            });

            return true;
        } catch (error) {
            return false;
        }
    }
}