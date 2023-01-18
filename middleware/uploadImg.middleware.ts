import {Response, Request, NextFunction } from "express"
import multer from 'multer';
import { AppError } from '../utils/appError';

interface ImgRequest extends Request {
    invalidImgType: boolean;
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req: ImgRequest, file: any, cb: any) => {

    if (file.mimetype?.split('/').includes('image')) {
        req.invalidImgType = false;
        cb(null, true);
    } else {
        req.invalidImgType = true;
        cb(null, false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

const convert = async (req: ImgRequest, res: Response, next: NextFunction) => {
    if (req.invalidImgType) return next(new AppError("Invalid image type", 415));
    if (!req.file) return next();
    const originalName = req.file.originalname.split('.');
    const imageExt = originalName[1];
    req.file.filename = `image-${Date.now()}.${imageExt}`;
    next();
};

module.exports = {upload, convert};