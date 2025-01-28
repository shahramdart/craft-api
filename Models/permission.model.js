import { Sequelize } from "sequelize";
import db from "../Config/database.js";

const { DataTypes } = Sequelize;

const PermissionModels = db.define(
  "permission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        notEmpty: true,
      },
    },
    permissions: {
      type: DataTypes.ENUM("Admin", "Seller"), // Allowed permission types
      allowNull: false,
      validate: {
        notEmpty: true,
        isIn: [["Admin", "Seller"]],
      },
    },
  },
  {
    freezeTableName: true,
  }
);

export default PermissionModels;
