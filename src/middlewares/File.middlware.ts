import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { map } from 'lodash';
import { promisify } from 'util';
import { ALLOWED_FILES, FileModule } from '../modules/File.module';
const unlinkAsync = promisify(fs.unlink);

export default class FileMiddleware {
    private static fileModule: FileModule;
    public static extension: 'csv' | 'xml';

    public static uploadedFileCheck = async (req: Request, res: Response, next: NextFunction) => {
        const errorMessages = [];
        const file = req.file;

        if (!file) {
            errorMessages.push('Missing File!');
            return res.status(400).send({ error: errorMessages });
        }

        const fileExtension = req.file.filename.split('.').pop();

        if (file.size > 4194304) {
            errorMessages.push('File size should not exceed 4 MB');
        }

        if (!ALLOWED_FILES.includes(fileExtension)) {
            errorMessages.push('File should only be .csv or .xml');
        }

        if (errorMessages.length) {
            unlinkAsync(req.file.path);
            return res.status(400).send({ error: errorMessages });
        }

        if (FileMiddleware.extension !== fileExtension) {
            FileMiddleware.fileModule = null;
        }

        FileMiddleware.extension = fileExtension === 'csv' ? 'csv' : 'xml';

        next();
    }

    public static fileDataVerification = async (req: Request, res: Response, next: NextFunction) => {
        const errorMessages = [];

        const fileModule = FileMiddleware.getFileModuleInstance(FileMiddleware.extension);

        const parsedData = await fileModule.getParsedDataFromFile(req.file.path);

        if (!parsedData.data || !parsedData.data.length) {
            errorMessages.push('No relevant data found! Please check file template');
            return res.status(400).send({ error: errorMessages });
        }

        const missingProducts = await fileModule.checkMissingPrerequisites(parsedData.data);

        if (missingProducts.length) {
            errorMessages.push('Please make sure to enter product(s) against following key(s)');
            errorMessages.push(...map(missingProducts, (missingKey) => {
                return `Missing Product Key: '${missingKey}'`;
            }));
            return res.status(400).send({ error: errorMessages });
        }

        const incompleteData: string[] = fileModule.dataVerification(parsedData.data);

        if (incompleteData.length) {
            errorMessages.push('Following entries from file have incomplete data');
            errorMessages.push(...incompleteData);
            return res.status(400).send({ error: errorMessages });
        }

        req.body.parsedData = parsedData;

        next();
    }

    private static getFileModuleInstance(extension: string): FileModule {
        if (!FileMiddleware.fileModule) {
            FileMiddleware.fileModule = new FileModule(extension);
        }

        return FileMiddleware.fileModule;
    }
}