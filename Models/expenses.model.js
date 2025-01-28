import { DataTypes } from "sequelize";
import db from "../Config/database.js"; // Ensure the correct path to your database configuration

import Users from "./user.model.js";
import ProductsModel from "./products.model.js";
import CategoryModel from "./category.model.js";

const ExpensesModel = db.define(
  "expenses",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    total_purchase: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    purchase_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "expenses",
    timestamps: true, // Disable timestamps if not needed
  }
);

// Associations for Category, Product, and User (already in place)
CategoryModel.hasMany(ExpensesModel, { foreignKey: "category_id" });
ExpensesModel.belongsTo(CategoryModel, { foreignKey: "category_id" });

ProductsModel.hasOne(ExpensesModel, { foreignKey: "product_id" });
ExpensesModel.belongsTo(ProductsModel, { foreignKey: "product_id" });

Users.hasOne(ExpensesModel, { foreignKey: "user_id" });
ExpensesModel.belongsTo(Users, { foreignKey: "user_id" });

export default ExpensesModel;
