const { DataTypes} = require("sequelize");
const { sequelize } = require('../db');
const User = require('./User');
const Workspace = require('./Workspace');

const WorkspaceMember = sequelize.define('workspaceMember', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  workspaceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Workspace,
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  role: {
    type: DataTypes.ENUM('owner', 'admin', 'member'),
    allowNull: false,
    defaultValue: 'member',
  },
}, {
  tableName: 'workspaceMembers',
  timestamps: true,
});

WorkspaceMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
WorkspaceMember.belongsTo(Workspace, { foreignKey: 'workspaceId', as: 'workspace' });
module.exports = WorkspaceMember;

