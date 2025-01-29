import { DataTypes } from "sequelize";
import db from "../Config/database.js";
import Users from "./user.model.js";
import CategoryModel from "./category.model.js";
import BrandsModel from "./brands.model.js";
import ProductsModel from "./products.model.js";

const SallingProductModel = db.define(
  "salling",
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
    salling_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    salling_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    salling_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notEmpty: true,
        min: 1, // Ensure price is greater than 0
      },
    },
    salling_discount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    salling_status: {
      type: DataTypes.ENUM("کاش", "قیست"),
      allowNull: false,
    },
    price_after_discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notEmpty: true,
        min: 0,
        isLessThanSallingPrice(value) {
          if (value > this.salling_price) {
            throw new Error(
              "Discounted price cannot exceed the original price"
            );
          }
        },
      },
    },
    salling_total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notEmpty: true,
        min: 1, // Ensure total price is greater than 0
      },
    },
    salling_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        notEmpty: false,
      },
    },
    brand_id: {
      type: DataTypes.INTEGER,
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
  },
  {
    timestamps: true,
  }
);

// Relationships

// SallingProductModel belongs to CategoryModel
SallingProductModel.belongsTo(CategoryModel, {
  as: "category",
  foreignKey: "category_id",
});
CategoryModel.hasMany(SallingProductModel, { foreignKey: "category_id" });

// SallingProductModel belongs to ProductsModel
SallingProductModel.belongsTo(ProductsModel, {
  as: "product",
  foreignKey: "product_id",
});
ProductsModel.hasMany(SallingProductModel, { foreignKey: "product_id" }); // Corrected this line

// SallingProductModel belongs to Users
SallingProductModel.belongsTo(Users, { as: "user", foreignKey: "user_id" });
Users.hasMany(SallingProductModel, { foreignKey: "user_id" });

// SallingProductModel belongs to BrandsModel
SallingProductModel.belongsTo(BrandsModel, {
  as: "brands",
  foreignKey: "brand_id",
});
BrandsModel.hasMany(SallingProductModel, { foreignKey: "brand_id" });

export default SallingProductModel;
