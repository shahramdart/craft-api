import { DataTypes } from "sequelize";
import db from "../Config/database.js"; // Adjust the path as per your project structure
import User from "./user.model.js"; // Assuming the User model is in the same directory or adjust the path accordingly

const CategoryModel = db.define(
  "category",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        notEmpty: true,
      },
    },
    category_name: {
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
  }
);

// Establish relations
CategoryModel.belongsTo(User, {
  foreignKey: "user_id", // The foreign key column in product_categories table
  as: "user", // Alias to refer to the related User model
});

User.hasMany(CategoryModel, {
  foreignKey: "user_id", // The foreign key column in the product_categories table
  as: "categories", // Alias for the reverse relation
});

export default CategoryModel;
