import {Response, Request, NextFunction } from "express"
import { AppError } from '../utils/appError';
import fs from 'fs';
import sharp from 'sharp';
import { promisify } from 'util';
import { ProductsDBUtils } from '../utils/db.products';

const unlinkAsync = promisify(fs.unlink);


const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { title, price } = req.body;
        const userId = (<any>req).user.id;
        const img = req.file?.filename;

        if (!title?.trim() || !price?.trim() || !img?.trim()) {
            return next(new AppError("Some required data is missing", 400));               
        }

        const createdProduct = await ProductsDBUtils.createProduct({
            title,
            price,
            img,
            userId
        });
        if (!createdProduct) return next(new AppError("Something wrong happened", 500));

        const imageNameWithId = `product-${createdProduct.id}.png`;
        createdProduct.img = imageNameWithId;
        
        if (!fs.existsSync(`public/img/products`)){
            fs.mkdirSync("public/img/products", { recursive: true });

        }
        await sharp(req.file?.buffer)
            .toFormat("png")            
            .toFile(`public/img/products/${imageNameWithId}`);
        await createdProduct.save();

        res.status(201).send({ status: 'success', data: "Created a product" });

    } catch (err) {
        next(err);
    }

}

const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params;
        const currentUserId = (<any>req).user.id;
        const { title, price } = req.body;
        const img = req.file?.filename;

        if ( title && !title?.trim() || price && !price?.trim() || img && !img?.trim()) {
            return next(new AppError("Some required data is missing", 400));               
        }

        const foundProduct = await ProductsDBUtils.getProductById(id);
        if (!foundProduct) return next(new AppError("Product not found!", 404));
        
        if (foundProduct.userId !== currentUserId) return next(new AppError("You are not authorized to edit this product!", 500));  

        const updatedProduct = await ProductsDBUtils.updateProduct({
            id,
            title,
            price,
            img,
        });
        if (!updatedProduct) return next(new AppError("Something wrong happened", 500));

        if (img) {

            const imageNameWithId = `product-${foundProduct.id}.png`
            foundProduct.img = imageNameWithId;
            await foundProduct.save();

            if (!fs.existsSync(`public/img/products`)){
                fs.mkdirSync("public/img/products", { recursive: true });
            }

            await sharp(req.file?.buffer)
                .toFormat("png")                
                .toFile(`public/img/products/${imageNameWithId}`);
        }

        const foundUpdatedProduct = await ProductsDBUtils.getProductById(id);

        res.status(201).send({ status: 'success', data: foundUpdatedProduct })
        
    } catch (err) {
        next(err);
    }

}

const deleteProduct = async (req: Request, res: Response, next: NextFunction)=>{
    try {

        const { id } = req.params;
        const currentUserId = (<any>req).user.id;

        const foundProduct = await ProductsDBUtils.getProductById(id);
        if (!foundProduct) return next(new AppError("Product not found!", 404));

        if (foundProduct.userId !== currentUserId) return next(new AppError("You are not authorized to delete this product!", 500));  

        const deleteProduct = await ProductsDBUtils.deleteProduct(id);
        if (!deleteProduct) return next(new AppError("Something wrong happened", 500));

        if (fs.existsSync(`public/img/products/product-${foundProduct.id}.png`)) {
            await unlinkAsync(`public/img/products/product-${foundProduct.id}.png`);
        }
        
        res.status(200).send({ status: 'success', data: foundProduct });

    } catch (err) {
        next(err);
    }
}

export { createProduct, updateProduct, deleteProduct }