import { DataTypes } from "sequelize";
import db from "../Config/database.js";
import BrandsModel from "./brands.model.js";
import CategoryModel from "./category.model.js";

const ArchivesModel = db.define(
  "archives",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        notEmpty: true,
      },
    },

    produc_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        notEmpty: false,
      },
    },
    produc_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        notEmpty: false,
      },
    },
    product_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        notEmpty: false,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        notEmpty: false,
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
  },
  {
    timestamps: true,
  }
);

ArchivesModel.belongsTo(CategoryModel, {
  as: "category",
  foreignKey: "category_id",
});
CategoryModel.hasMany(ArchivesModel, { foreignKey: "category_id" });

ArchivesModel.belongsTo(BrandsModel, { as: "brands", foreignKey: "brand_id" });
BrandsModel.hasMany(ArchivesModel, { foreignKey: "brand_id" });

export default ArchivesModel;
