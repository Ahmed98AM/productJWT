"use strict";
const express = require('express');
const userController = require('../controllers/user.controller');
const productController = require('../controllers/product.controller');
const uploadImg = require('../middleware/uploadImg.middleware');
const router = express.Router();
const auth = require('../middleware/auth.middleware');

const appRouter = (app) => {

    router.post('/signup/', userController.signUp);
    router.post('/login', userController.logIn);
    router.post('/logout', auth.isLoggedIn, userController.logOut);

    router.post('/products/', auth.isLoggedIn, uploadImg.upload.single("img"), uploadImg.convert, productController.createProduct);
    router.put('/product/:id', auth.isLoggedIn, uploadImg.upload.single("img"), uploadImg.convert, productController.updateProduct);
    router.delete('/product/:id', auth.isLoggedIn, productController.deleteProduct);

    app.use('/', router);
};
module.exports = appRouter;
