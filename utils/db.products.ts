import { db } from '../models/db.model';

const Product = db.products;

interface Product {
    id?: string| number;
    title: string;
    price: string;
    img?: string;
    userId?: string| number;
};

class ProductsDBUtils {

    static getProductById = async (query: any) => await Product.findOne({ where: { id: query } });

    static getProducts = async (query : any) => {
        if (query) return await Product.findAndCountAll({ where: query });
        return await Product.findAndCountAll();
    };
    
    static createProduct = async (data: Product) => { 
        return await Product.create({
            title: data.title,
            price: data.price,
            img: data.img,
            userId: data.userId
        });
    };

    static updateProduct = async (data: Product) => {
        return await Product.update({
            title: data.title,
            price: data.price,
            img: data.img,
            userId: data.userId
        }, { where: { id: data.id } });
    };

    static deleteProduct = async (id: string | number) => {
        const toBeDeletedProduct = await Product.findOne({ where: { id } });
        return await toBeDeletedProduct.destroy();
    };

}

export  { ProductsDBUtils };