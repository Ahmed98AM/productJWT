module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('product', {
        title: {
            type: DataTypes.STRING
        },   
        img: {
            type: DataTypes.STRING
        },   
        price: {
            type: DataTypes.INTEGER
        }
    });
    return Product;
};