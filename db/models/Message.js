const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Channel = require('./Channel');
const User = require('./User')

const Messange = sequelize.define("messange", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    channelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Channel,
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: false
    }
}, {
    timestamps: true
});

Messange.belongsTo(Channel, { foreignKey: 'channelId', as: 'channel' });
Messange.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Messange;
