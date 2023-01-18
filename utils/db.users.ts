import { db } from '../models/db.model';
import bcrypt from 'bcryptjs';

const User = db.users;

interface User {
    id?: string| number;
    username: string;
    email: string;
    password: string;
    hash?: string;
    title?: string;
}

class UsersDBUtils {

    static getUserById = async (query: any) => await User.findOne({ where: { id: query } });

    static getUserBy = async (query: any) => await User.findOne({ where: { ...query } });

    static getUsers = async (query: any) => {
        if (query) return await User.findAndCountAll({ where: query });
        return await User.findAndCountAll();
    };
    
    static createUser = async (data: User) => {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return await User.create({
            username: data.username,
            email: data.email,
            hash: hashedPassword
        });
    };

    static updateUser = async (data: User) => {
        if (data.title && !data.title.trim()) {
            return false;
        }
        return await User.update({
            title: data.title,
        }, { where: { id: data.id } });
    };

    static deleteUser = async (id: string | number) => {
        const toBeDeletedUser = await User.findOne({ where: { id } });
        return await toBeDeletedUser.destroy();
    };

}

export { UsersDBUtils };