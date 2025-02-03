import { DataTypes } from "sequelize";
import db from "../Config/database.js";
import Users from "./user.model.js";
import ProductsModel from "./products.model.js";

const InvoiceModel = db.define(
  "invoice",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    invoice_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    invoice_pirce: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    invoice_pirce_dolar: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    invoice_total_pirce: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    invoice_total_pirce_dolar: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    invoice_status: {
      type: DataTypes.ENUM("کاش", "مانگانە"),
      allowNull: false,
    },
    invoice_date: {
      type: DataTypes.DATE(),
      allowNull: false,
    },
    invoice_customer: {
      type: DataTypes.STRING(64),
      allowNull: true,
      validate: {
        notEmpty: false,
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    sale_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "sales", // The table this references
        key: "id",
      },
      onDelete: "CASCADE", // If sale is deleted, related invoices will be deleted
    },
  },
  {
    timestamps: true,
  }
);

InvoiceModel.belongsTo(Users, { as: "users", foreignKey: "user_id" });
Users.hasMany(InvoiceModel, { foreignKey: "user_id" });

InvoiceModel.belongsTo(ProductsModel, {
  as: "products",
  foreignKey: "product_id",
});
ProductsModel.hasMany(InvoiceModel, { foreignKey: "product_id" });

export default InvoiceModel;
