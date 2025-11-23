const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");
const User = require("./User");
const Workspace = require("./Workspace");

const Job = sequelize.define(
  "job",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    
    workspaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Workspace,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    initiatedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },

    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("queued", "active", "completed", "failed"),
      allowNull: false,
      defaultValue: "queued",
    },

    progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0, max: 100 },
    },

    resultUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    meta: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "jobs",
    timestamps: true,
  }
);

Job.belongsTo(User, { foreignKey: "initiatedBy", as: "initiator" });
Job.belongsTo(Workspace, { foreignKey: "workspaceId", as: "workspace" });

module.exports = Job;
