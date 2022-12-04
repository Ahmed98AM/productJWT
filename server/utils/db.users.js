const db = require('../models/db.model');
const User = db.users;
const bcrypt = require('bcryptjs');

class UsersDBUtils {

    static getUserById = async (query) => await User.findOne({ where: { id: query } });

    static getUserBy = async (query) => await User.findOne({ where: { ...query } });

    static getUsers = async (query) => {
        if (query) return await User.findAndCountAll({ where: query });
        return await User.findAndCountAll();
    };
    
    static createUser = async (data) => {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return await User.create({
            username: data.username,
            email: data.email,
            hash: hashedPassword
        });
    };

    static updateUser = async (data) => {
        if (data.title && !data.title.trim()) {
            return false;
        }
        return await User.update({
            title: data.title,
        }, { where: { id: data.id } });
    };

    static deleteUser = async (id) => {
        const toBeDeletedUser = await User.findOne({ where: { id } });
        return await toBeDeletedUser.destroy();
    };

}

module.exports = UsersDBUtils;