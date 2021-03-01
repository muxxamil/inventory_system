import { getOrdinalSuffix } from '../utils/Helper';
import { InventoryModule, Inventory } from './Inventory.module';
import { Product, ProductModule } from './Product.module';

export enum DataType {
    INVENTORY,
    PRODUCT
}

export const FILE_TYPES = {
    csv: 'inventory',
    xml: 'product'
}

export const ALLOWED_FILES = ['csv', 'xml'];

export interface ParsedData {
    dataType: DataType;
    data: Inventory[] | Product[];
}

export class FileModule {
    private dataModule: InventoryModule | ProductModule;
    private dataType: DataType;

    constructor(extension: string) {
        if (extension === 'csv') {
            this.dataModule = new InventoryModule();
            this.dataType = DataType.INVENTORY;
        } else {
            this.dataModule = new ProductModule();
            this.dataType = DataType.PRODUCT;
        }
    }

    public getParsedDataFromFile = async (filepath: string): Promise<ParsedData> => {
        return {
            dataType: this.dataType,
            data: await this.dataModule.getParsedData(filepath)
        };
    }

    public checkMissingPrerequisites = async (data: Inventory[] | Product[]): Promise<string[]> => {
        return await this.dataModule.checkMissingPrerequisites(data);
    }

    public dataVerification = (data: Inventory[] | Product[]): string[] => {
        const incompleteData: string[] = [];
        data.forEach((obj: Inventory | Product, index: number) => {
            if (this.dataModule.verifyData(obj)) {
                incompleteData.push(getOrdinalSuffix(index + 1));
            }
        });

        return incompleteData;
    }

    public insertData = (data: Inventory[] | Product[], addedBy: number): Promise<boolean> => {
        return this.dataModule.insertData(data, addedBy);
    }

}