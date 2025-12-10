const { Sequelize } =  require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
    database: String( process.env.DB_NAME || 'postgresql' ),
    username: String( process.env.DB_USERNAME || 'admin' ),
    password: String( process.env.DB_PASSWORD || 'admin' ),
    host: String('localhost' ),
    port: Number( process.env.DB_PORT || 5432 ),
    dialect: 'postgres',
    logging: console.log,
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