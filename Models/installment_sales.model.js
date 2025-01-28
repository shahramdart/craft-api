import { DataTypes } from "sequelize";
import db from "../Config/database.js";
import ProductsModel from "./products.model.js";
import Users from "./user.model.js";

const InstallmentSalesModel = db.define(
  "installment_sales",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    advance_payment: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    remaining_balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    installment_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total_installments: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    remaining_installments: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    installment_due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    final_payment_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("هەڵپەسێردراو", "پارەی دا", "دواکەوتووە"),
      defaultValue: "هەڵپەسێردراو",
    },
    customer_name: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    customer_phoneNo: {
      type: DataTypes.STRING(24),
      allowNull: false,
    },
    customer_address: {
      type: DataTypes.STRING(128), // Increase length
      allowNull: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Define Relationships
InstallmentSalesModel.belongsTo(ProductsModel, {
  as: "products",
  foreignKey: "product_id",
});
ProductsModel.hasMany(InstallmentSalesModel, { foreignKey: "product_id" });

InstallmentSalesModel.belongsTo(Users, { as: "users", foreignKey: "user_id" });
Users.hasMany(InstallmentSalesModel, { foreignKey: "user_id" });

export default InstallmentSalesModel;
