const { DataTypes} = require("sequelize");
const { sequelize } = require('../db');

const User = sequelize.define("user", {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey:true },
    email: {type: DataTypes.STRING, allowNull:false, unique:true },
    passwordHash: { type: DataTypes.STRING, allowNull: false},
    name: {type: DataTypes.STRING, allowNull: false }
});

module.exports = User;
