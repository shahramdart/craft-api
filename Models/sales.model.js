import { DataTypes } from "sequelize";
import db from "../Config/database.js";
import ProductsModel from "./products.model.js";
import Users from "./user.model.js";
import ProductCategoriesModel from "./category.model.js";
import BrandsModel from "./brands.model.js";
import InvoiceModel from "./invoice.model.js";

// Define the SalesModel
const SalesModel = db.define(
  "sales",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products", // The table this references
        key: "id",
      },
      onDelete: "CASCADE", // If product is deleted, related sales will be deleted
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1, // Quantity must be at least 1
      },
    },
    sale_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01, // Price must be at least 0.01
      },
    },
    price_dolar: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01, // Total price must be at least 0.01
      },
    },
    total_price_dolar: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0.01, // Total price must be at least 0.01
      },
    },
    profit_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "product_categories", // The table this references
        key: "id",
      },
      onDelete: "SET NULL", // If category is deleted, set category_id to NULL
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "brands", // The table this references
        key: "id",
      },
      onDelete: "SET NULL", // If category is deleted, set category_id to NULL
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // The table this references
        key: "id",
      },
      onDelete: "CASCADE", // If user is deleted, related sales will be deleted
    },
  },
  {
    tableName: "sales",
    timestamps: true, // Enable timestamps
  }
);

// Add a hook to calculate the total_price before the sale is created
SalesModel.beforeCreate((sale, options) => {
  sale.total_price = sale.quantity * sale.price; // Calculate total price
});

// Associations
ProductsModel.hasMany(SalesModel, { foreignKey: "product_id" });
SalesModel.belongsTo(ProductsModel, {
  foreignKey: "product_id",
  as: "product",
});

ProductCategoriesModel.hasMany(SalesModel, { foreignKey: "category_id" });
SalesModel.belongsTo(ProductCategoriesModel, {
  foreignKey: "category_id",
  as: "category",
});

SalesModel.belongsTo(BrandsModel, { foreignKey: "brand_id", as: "brand" });
BrandsModel.hasMany(SalesModel, { foreignKey: "brand_id" });

Users.hasMany(SalesModel, { foreignKey: "user_id" });
SalesModel.belongsTo(Users, { foreignKey: "user_id", as: "users" });

SalesModel.hasMany(InvoiceModel, { foreignKey: "sale_id", as: "invoices" }); // A sale can have many invoices
InvoiceModel.belongsTo(SalesModel, { foreignKey: "sale_id", as: "sale" }); // An invoice belongs to one sale

// Export the SalesModel
export default SalesModel;
