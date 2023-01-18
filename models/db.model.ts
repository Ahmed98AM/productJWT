import {Sequelize } from "sequelize"
require("dotenv").config();

const sequelize = new Sequelize(process.env.DB_NAME || 'test', process.env.DB_USER || 'root', process.env.DB_PASS || '', {
    host: process.env.DB_HOST || 'mysql',
    port: process.env.DB_PORT? Number(process.env.DB_PORT) : 3306,
    dialect: 'mysql',
    dialectOptions: {
        charset: 'utf8'
    }
});

const db: any = {};

async function dbConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    }
    catch (err) {
        console.log('Unable to connect to the database:', err);
    }
};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.products = require('./product.model')(sequelize, Sequelize);
db.users = require('./user.model')(sequelize, Sequelize);

db.users.hasMany(db.products, { as: "products" });
db.products.belongsTo(db.users, {
    foreignKey: "userId",
    as: "user"
});


export  { dbConnection };
export  { db };
