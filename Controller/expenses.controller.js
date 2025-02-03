import SalesModel from "../Models/sales.model.js";
import ProductsModel from "../Models/products.model.js";
import ProductCategoriesModel from "../Models/category.model.js";
import Users from "../Models/user.model.js";
import ExpensesModel from "../Models/expenses.model.js";

// ? Get all expenses
export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await ExpensesModel.findAll({
      include: [
        {
          model: ProductsModel,
          attributes: ["product_name"], // Include product name
        },
        {
          model: ProductCategoriesModel,
          attributes: ["category_name"], // Include category name
        },
        {
          model: Users,
          attributes: ["name"], // Include user name
        },
      ],
      attributes: [
        "id",
        "quantity",
        "createdAt",
        "purchase_price",
        "purchase_price_dolar",
        "total_purchase",
        "total_purchase_dolar",
        "category_id",
        "product_id",
        "user_id",
      ],
    });

    if (expenses.length === 0) {
      return res.status(404).json({ msg: "No expenses found!" });
    }

    // Map the result to include related data (flattened structure)
    const expensesWithDetails = expenses.map((expense) => ({
      id: expense.id,
      product_name: expense.product
        ? expense.product.product_name
        : "Product not found",
      category_name: expense.category
        ? expense.category.category_name
        : "Category not found",
      quantity: expense.quantity,
      createdAt: expense.createdAt,
      purchase_price: expense.purchase_price,
      purchase_price_dolar: expense.purchase_price_dolar,
      total_purchase: expense.total_purchase,
      total_purchase_dolar: expense.total_purchase_dolar,
      user_name: expense.user ? expense.user.name : "User not found",
    }));

    res.status(200).json(expensesWithDetails);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error retrieving data!", error: error.message });
  }
};

// ? get by id
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
          model: ProductCategoriesModel, // Assuming you have a category model
          attributes: ["category_name"], // Ensure correct column name
        },
        {
          model: Users, // Assuming you have a user model
          attributes: ["name", "email"], // Select the user fields you want
        },
      ],
      attributes: [
        "id",
        "quantity",
        "price",
        "total_price",
        "createdAt",
        "category_id",
        "user_id",
      ],
    });

    if (!sale) {
      return res.status(404).json({ msg: "No sales found with this id!" });
    }

    // Flatten the result to include product_name, payment_method, category_name, and user_name
    const saleWithDetails = {
      id: sale.id,
      product_name: sale.product?.product_name || "Product not found", // Product name
      category_name:
        sale.product_category?.category_name || "Category not found",
      quantity: sale.quantity,
      price: sale.price,
      total_price: sale.total_price,
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

// ? Select all view
export const getTotalExpenses = async (req, res) => {
  try {
    // Calculate the sum of all total_price values in the sales table
    const totalExpensess = await ExpensesModel.sum("total_purchase"); // Sum total_price column
    const totalExpensesDolar = await ExpensesModel.sum("total_purchase_dolar"); // Sum total_price column

    if (!totalExpensess) {
      return res.status(404).json({ msg: "No Expenses data found!" });
    }

    const totalExpenses = {
      total_purchase: totalExpensess || 0,
      total_purchase_dolar: totalExpensesDolar || 0,
    };

    // Return the total sales sum in the response
    res.status(200).json({ totalExpenses });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ msg: "Error retrieving total sales data", error: error.message });
  }
};
