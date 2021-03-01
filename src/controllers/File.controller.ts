import { Router } from 'express';
const router = Router();
import fs from 'fs';
import * as multer from 'multer';
import File from '../models/File.model';
import FileMiddleware from '../middlewares/File.middlware';
import { FileModule, FILE_TYPES } from '../modules/File.module';

import { promisify } from 'util';
const unlinkAsync = promisify(fs.unlink);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/upload');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
});
const upload = multer.default({ storage })

const PAGE_LIMIT = 5;
router.get('/', async (req, res, next) => {
    try {
        const fileHistory = await File.findAll();
        res.render('index', { title: 'Hey', message: 'Hello there!', files: fileHistory });
    } catch (err) {
        next(err);
    }
});

router.get('/fileHistory', async (req, res, next) => {
    try {
        const currentPage = parseInt(req.query.page as string, 10);
        const fileHistory = await File.findAndCountAll({
            where: {
                addedBy: req.user
            },
            limit: PAGE_LIMIT,
            offset: (currentPage || 0) * PAGE_LIMIT,
        });
        res.render('tpl/fileHistory', { files: fileHistory.rows, total: Math.ceil(fileHistory.count / PAGE_LIMIT), currentPage });
    } catch (err) {
        next(err);
    }
});

router.post('/fileUpload', upload.single('dataFile'), FileMiddleware.uploadedFileCheck, FileMiddleware.fileDataVerification, async (req, res, next) => {
    try {
        const fileModule = new FileModule(FileMiddleware.extension);
        const [dataInserted] = await Promise.all([
            fileModule.insertData(req.body.parsedData.data, 1),
            File.create({ name: req.file.filename, type: FILE_TYPES[FileMiddleware.extension], extension: FileMiddleware.extension, addedBy: req.user })
        ]);
        if (dataInserted) {
            return res.status(200).send(dataInserted);
        }
        unlinkAsync(req.file.path);
        res.status(500).send(dataInserted);
    } catch (err) {
        unlinkAsync(req.file.path);
        next(err);
    }
});

module.exports = router;