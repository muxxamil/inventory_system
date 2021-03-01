import { uniqBy, map } from 'lodash';
import ProductImage from '../models/ProductImage.model';

interface ImageModel {
    key: string;
    width: number;
    height: number;
    src: string;
    addedBy: number;
}

export interface ImageXMLModel {
    id: {_: string};
    width: {_: string};
    height: {_: string};
    src: string;
}

export class ImageModule {

    public static async BulkInsertIgnoreImage(images: ImageXMLModel[], addedBy: number): Promise<ProductImage[]> {
        const uniqueImages = uniqBy(images, 'id._');

        const imagesData: ImageModel[] = map(uniqueImages, (image: ImageXMLModel) => {
            return {
                key: image.id._,
                width: parseInt(image.width._, 10),
                height: parseInt(image.height._, 10),
                src: image.src,
                addedBy
            }
        });

        await ProductImage.bulkCreate(imagesData, { ignoreDuplicates: true });

        const imageKeys = map(uniqueImages, (image) => image.id._)

        return ProductImage.findAll({
            attributes: ['id', 'key'],
            where: {
                key: imageKeys
            }
        });
    }

}