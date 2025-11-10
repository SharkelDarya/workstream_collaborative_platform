const { Sequelize } =  require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
    database: String(process.env.DB_NAME),
    username: String(process.env.DB_USERNAME),
    password: String(process.env.DB_PASSWORD),
    host: String(process.env.DB_HOST),
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',
    logging: false,
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync().then(result=>{ console.log(result); })
        console.log('db connected and synchronized!');
    } catch (error) {
        console.log('db not connected((( ', error);
    }
}

module.exports = { sequelize, connectDB };