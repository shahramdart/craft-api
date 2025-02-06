import SalesModel from "../Models/sales.model.js";
import ProductsModel from "../Models/products.model.js";
import ProductCategoriesModel from "../Models/category.model.js";
import Users from "../Models/user.model.js";
import { Op } from "sequelize";
import BrandsModel from "../Models/brands.model.js";

// ? Get all sales
export const getAllSales = async (req, res) => {
  try {
    const sales = await SalesModel.findAll({
      include: [
        {
          model: ProductsModel,
          as: "product",
          attributes: ["product_name"], // Ensure correct column name
        },
        {
          model: ProductCategoriesModel,
          as: "category",
          attributes: ["category_name"], // Ensure correct column name
        },
        {
          model: BrandsModel,
          as: "brand", // Ensure alias matches the one used in the association
          attributes: ["brand_name"],
        },
        {
          model: Users, // Include the user details
          as: "users", // Alias for the user relationship
          attributes: ["name"], // Specify the attributes you need from Users
        },
      ],
      attributes: [
        "id",
        "quantity",
        "price",
        "total_price",
        "total_price_dolar",
        "price_dolar",
        "profit_amount",
        "createdAt",
        "category_id",
        "user_id",
      ], // Select sales fields
    });

    if (sales.length === 0) {
      return res.status(404).json({ msg: "No sales found!" });
    }

    // Flatten the result to include product_name, category_name, and user_name
    const salesWithDetails = sales.map((sale) => ({
      id: sale.id,
      product_name: sale.product?.product_name || "Product not found", // Product name
      category_name: sale.category?.category_name || "Category not found",
      brand_name: sale.brand?.brand_name || "Category not found",
      quantity: sale.quantity,
      price: sale.price,
      price_dolar: sale.price_dolar,
      total_price: sale.total_price,
      total_price_dolar: sale.total_price_dolar,
      profit_amount: sale.profit_amount,
      user_name: sale.users?.name || "User not found", // User name
      createdAt: sale.createdAt,
    }));

    res.status(200).json(salesWithDetails);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error retrieving data!", error: error.message });
  }
};

// ? Get sale by id
export const getSaleById = async (req, res) => {
  const { id } = req.params;

  try {
    const sale = await SalesModel.findOne({
      where: { id },
      include: [
        {
          model: ProductsModel,
          attributes: ["product_name"], // Ensure correct column name
        },
        {
          model: ProductCategoriesModel,
          attributes: ["category_name"], // Ensure correct column name
        },
        {
          model: Users,
          attributes: ["name", "email"], // Select the user fields you want
        },
      ],
      attributes: [
        "id",
        "quantity",
        "price",
        "total_price",
        "total_price_dolar",
        "createdAt",
        "category_id",
        "user_id",
      ],
    });

    if (!sale) {
      return res.status(404).json({ msg: "No sales found with this id!" });
    }

    // Flatten the result to include product_name, category_name, and user_name
    const saleWithDetails = {
      id: sale.id,
      product_name: sale.product?.product_name || "Product not found", // Product name
      category_name:
        sale.product_category?.category_name || "Category not found",
      quantity: sale.quantity,
      price: sale.price,
      total_price: sale.total_price,
      total_price_dolar: sale.total_price_dolar,
      user_name: sale.user?.name || "User not found", // User name
      createdAt: sale.createdAt,
    };

    res.status(200).json({ data: saleWithDetails });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error retrieving data!", error: error.message });
  }
};

// ? Get total sales
export const getTotalSales = async (req, res) => {
  try {
    const { userId } = req; // Assuming userId is obtained from authentication middleware

    // Fetch the user's permission level from PermissionModels
    const user = await Users.findOne({
      where: { id: req.userId }, // Assuming permission table has user_id column
    });

    if (!user) {
      return res.status(404).json({ msg: "user not found for this request!" });
    }

    // Check if the user is an Admin
    if (user && user.permission_id === 1) {
      // Admin sees total sales across all users
      const totalSalesInDinars = await SalesModel.sum("total_price"); // Sum total price in IQD
      const totalSalesInDollars = await SalesModel.sum("total_price_dolar"); // Sum total price in USD
      const totalSales = {
        total_price: totalSalesInDinars || 0,
        total_price_dolar: totalSalesInDollars || 0,
      };
      return res.status(200).json({ totalSales });
    }

    // If the user is a Seller
    if (user.permission_id !== 1) {
      // Fetch total sales specific to the logged-in user
      const totalSalesInDinars = await SalesModel.sum("price", {
        where: { user_id: req.userId }, // Only the user's sales
      });
      const totalSalesInDollars = await SalesModel.sum("price_dolar", {
        where: { user_id: req.userId },
      });
      const totalSales = {
        price: totalSalesInDinars || 0,
        price_dolar: totalSalesInDollars || 0,
      };
      return res.status(200).json({ totalSales });
    }

    return res.status(403).json({ msg: "Access denied!" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      msg: "Error retrieving sales data",
      error: error.message,
    });
  }
};

// ? get total profit
export const getTotalProfit = async (req, res) => {
  try {
    // Calculate the sum of all total_price values in the sales table
    const totalSales = await SalesModel.sum("profit_amount"); // Sum total_price column

    if (!totalSales) {
      return res.status(404).json({ msg: "No sales data found!" });
    }

    // Return the total sales sum in the response
    res.status(200).json({ total: `${totalSales}` });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ msg: "Error retrieving total sales data", error: error.message });
  }
};

// ? Get total sales for the year
export const getTotalSaleForYear = async (req, res) => {
  try {
    // Get the year from the route parameters (e.g., /sales/:year)
    const year = req.params.year;

    // Validate the year
    const parsedYear = parseInt(year, 10);
    if (!year || isNaN(parsedYear) || parsedYear < 1000 || parsedYear > 9999) {
      return res.status(400).json({ message: "Invalid year provided" });
    }

    // Define the start and end date for the year
    const startOfYear = `${parsedYear}-01-01`;
    const endOfYear = `${parsedYear}-12-31`;

    // Get total sales for the year from the 'SalesModel'
    const totalSales = await SalesModel.sum("total_price", {
      where: {
        createdAt: {
          [Op.between]: [startOfYear, endOfYear],
        },
      },
    });

    if (totalSales === null) {
      return res
        .status(404)
        .json({ message: `No sales found for year ${parsedYear}` });
    }

    res.status(200).json({ totalSales });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
