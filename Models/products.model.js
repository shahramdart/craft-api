import { Sequelize } from "sequelize";
import db from "../Config/database.js";
import ProductCategories from "./category.model.js";
import Users from "./user.model.js";
import BrandsModel from "./brands.model.js";

const { DataTypes } = Sequelize;

const ProductsModel = db.define("products", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  product_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  product_color: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  product_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  product_price_dolar: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  product_qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_qrcode: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
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
  user_id: {
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
});

ProductsModel.belongsTo(ProductCategories, {
  as: "category",
  foreignKey: "category_id",
});
ProductCategories.hasMany(ProductsModel, { foreignKey: "category_id" });

ProductsModel.belongsTo(Users, { as: "user", foreignKey: "user_id" });
Users.hasMany(ProductsModel, { foreignKey: "user_id" });

ProductsModel.belongsTo(BrandsModel, { as: "brands", foreignKey: "brand_id" });
BrandsModel.hasMany(ProductsModel, { foreignKey: "brand_id" });

export default ProductsModel;
