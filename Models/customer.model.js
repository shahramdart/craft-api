import { DataTypes } from "sequelize";
import db from "../Config/database.js";
import InvoiceModel from "./invoice.model.js";

const CustomerModel = db.define("customers", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
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
  invoice_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // ✅ Allow creating a customer without an invoice
    references: { model: "invoices", key: "id" },
  },
});

CustomerModel.belongsTo(InvoiceModel, {
  as: "invoice", // You can use a custom alias for the relationship
  foreignKey: "invoice_id", // The foreign key should be the field that links to InvoiceModel
});
InvoiceModel.hasMany(CustomerModel, { foreignKey: "invoice_id" });

export default CustomerModel;
