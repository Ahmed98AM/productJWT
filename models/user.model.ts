module.exports = (sequelize: any, DataTypes: any) => {
    const User = sequelize.define('user', {
        email: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true
        },
        username: {
            type: DataTypes.STRING,
        },
        hash: {
            type: DataTypes.STRING
        }
    });
    
    return User;
};
