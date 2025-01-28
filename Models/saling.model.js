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
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    salling_discount: {
      type: DataTypes.FLOAT, // Or DataTypes.DECIMAL(5, 2) for fixed precision
      allowNull: false,
    },
    salling_status: {
      type: DataTypes.ENUM("کاش", "قیست"),
      allowNull: false,
    },
    price_after_discount: {
      type: DataTypes.DECIMAL(10, 2), // Suitable for monetary values
      allowNull: false,
    },
    salling_total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
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
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
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

SallingProductModel.belongsTo(CategoryModel, {
  as: "category",
  foreignKey: "category_id",
});
CategoryModel.hasMany(SallingProductModel, { foreignKey: "category_id" });

SallingProductModel.belongsTo(ProductsModel, {
  as: "product",
  foreignKey: "product_id",
});
CategoryModel.hasMany(SallingProductModel, { foreignKey: "category_id" });

SallingProductModel.belongsTo(Users, { as: "user", foreignKey: "user_id" });
Users.hasMany(SallingProductModel, { foreignKey: "user_id" });

SallingProductModel.belongsTo(BrandsModel, {
  as: "brands",
  foreignKey: "brand_id",
});
BrandsModel.hasMany(SallingProductModel, { foreignKey: "brand_id" });

export default SallingProductModel;
