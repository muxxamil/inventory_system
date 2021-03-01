import { uniq, map } from 'lodash';
import { transformStringToKey } from '../utils/Helper';

interface GenericModel {
    key: string;
    name: string;
    addedBy: number;
}

export class GenericModule {

    public static async BulkInsertIgnoreData<T>(entitynames: string[], addedBy: number, model: any): Promise<T[]> {
        const uniqueEntityNames = uniq(entitynames);

        const entitiesData: GenericModel[] = map(entitynames, (entity) => {
            return {
                key: transformStringToKey(entity),
                name: entity,
                addedBy
            }
        });

        await model.bulkCreate(entitiesData, { ignoreDuplicates: true });

        const entityKeys = map(uniqueEntityNames, (entity) => transformStringToKey(entity))

        return model.findAll({
            attributes: ['id', 'key'],
            where: {
                key: entityKeys
            }
        });
    }

}