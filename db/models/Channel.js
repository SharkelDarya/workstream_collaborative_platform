const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Workspace = require('./Workspace');

const Channel = sequelize.define("channel", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    workspaceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Workspace,
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isPrivate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});

Channel.belongsTo(Workspace, { foreignKey: 'workspaceId', as: 'workspace' });

module.exports = Channel;
