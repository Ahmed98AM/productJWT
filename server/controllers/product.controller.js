const AppError = require('../utils/appError');
const fs = require('fs')
const sharp = require("sharp");
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink)
const ProductsDBUtils = require('../utils/db.products');

const createProduct = async (req, res, next) => {
    try {

        const { title, price } = req.body;
        const userId = req.user.id;
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
        
        if (!fs.existsSync(`public/img/products/`)){
            fs.mkdirSync(`public/img/products/`);
        }
        await sharp(req.file?.buffer)
            .toFormat("png")            
            .toFile(`public/img/products/${imageNameWithId}`);
        await createdProduct.save();

        res.status(201).send({ status: 'success', data: createdProduct });

    } catch (err) {
        next(err);
    }

}

const updateProduct = async (req, res, next) => {
    try {

        const { id } = req.params;
        const currentUserId = req.user.id;
        const { title, price } = req.body;
        const img = req.file?.filename;
        if ( title && !title?.trim() || price && !price?.trim() || img && !img?.trim()) {
            return next(new AppError("Some required data is missing", 400));               
        }

        const foundProduct = await ProductsDBUtils.getProductById(id);
        if (!foundProduct) return next(new AppError("Product not found!", 404));
        
        // check if current logged user owns this product
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
            if (!fs.existsSync(`public/img/products/`)){
                fs.mkdirSync(`public/img/products/`);
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

const deleteProduct = async (req, res, next)=>{
    try {

        const { id } = req.params;
        const currentUserId = req.user.id;
        const foundProduct = await ProductsDBUtils.getProductById(id);
        if (!foundProduct) return next(new AppError("Product not found!", 404));

        // check if current logged user owns this product
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

module.exports = { createProduct, updateProduct, deleteProduct }