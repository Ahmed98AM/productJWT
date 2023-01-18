module.exports = (sequelize: any, DataTypes: any) => {
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