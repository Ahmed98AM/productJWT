import * as express from 'express'

import * as userController from '../controllers/user.controller'
import * as productController from '../controllers/product.controller'

const auth = require('../middleware/auth.middleware')
const uploadImg = require('../middleware/uploadImg.middleware')

const router = express.Router();

export const appRouter = (app: any) => {

    router.post('/signup/', userController.signUp);
    router.post('/login', userController.logIn);
    router.post('/logout', auth.isLoggedIn, userController.logOut);

    router.post('/products/', auth.isLoggedIn, uploadImg.upload.single('img'), uploadImg.convert, productController.createProduct);
    router.put('/product/:id', auth.isLoggedIn, uploadImg.upload.single('img'), uploadImg.convert, productController.updateProduct);
    router.delete('/product/:id', auth.isLoggedIn, productController.deleteProduct);

    app.use('/', router);
};
