import { DataTypes } from "sequelize";
import db from "../Config/database.js";
import Users from "./user.model.js";
import ProductsModel from "./products.model.js";

const PaymentTypeModel = db.define(
  "payment_type",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("قەرز", "مانگانە"),
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    final_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    customer: {
      type: DataTypes.STRING(64),
      allowNull: true,
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
    timestamps: true,
  }
);

// Define relationships
PaymentTypeModel.belongsTo(Users, { as: "user", foreignKey: "user_id" });
Users.hasMany(PaymentTypeModel, { foreignKey: "user_id" });

PaymentTypeModel.belongsTo(ProductsModel, {
  as: "product",
  foreignKey: "product_id",
});
ProductsModel.hasMany(PaymentTypeModel, { foreignKey: "product_id" });

export default PaymentTypeModel;
