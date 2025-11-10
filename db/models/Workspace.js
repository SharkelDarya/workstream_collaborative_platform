const { DataTypes} = require("sequelize");
const { sequelize } = require('../db');
const User = require('./User')

const Workspace = sequelize.define('workspace', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
}, {
  tableName: 'workspaces',
  timestamps: true,
});

Workspace.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

module.exports = Workspace;
