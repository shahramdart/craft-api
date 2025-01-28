import { Sequelize } from "sequelize";
import db from "../Config/database.js";
import Users from "./user.model.js";

const { DataTypes } = Sequelize;

const BrandsModel = db.define(
  "brands",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        notEmpty: true,
      },
    },
    brand_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 100],
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
    freezeTableName: true,
    timestamps: true,
  }
);

BrandsModel.belongsTo(Users, { as: "users", foreignKey: "user_id" });
Users.hasMany(BrandsModel, { foreignKey: "user_id" });

export default BrandsModel;
