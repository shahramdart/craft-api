import CategoryModel from "../Models/category.model.js";
import ExpensesModel from "../Models/expenses.model.js";
import ProductsModel from "../Models/products.model.js";
import db from "../Config/database.js";
import BrandsModel from "../Models/brands.model.js";

// ? Get All Products
export const getAllProduct = async (req, res) => {
  try {
    const products = await ProductsModel.findAll({
      include: [
        { model: CategoryModel, as: "category", attributes: ["category_name"] },
        { model: BrandsModel, as: "brands", attributes: ["brand_name"] },
      ],
    });

    if (products.length === 0) {
      return res.status(404).json({ msg: "No products found" });
    }

    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error retrieving products", error: error.message });
  }
};

// ? Get all by qrcode   
export const getProductByQrCode = async (req, res) => {
  const { qrcode } = req.params;  // Get QR code from URL parameters

  try {
    // Query for the product based on the QR code
    const product = await ProductsModel.findOne({
      where: { product_qrcode: qrcode },  // Match the QR code in the database
      include: [
        { model: CategoryModel, as: "category", attributes: ["category_name"] },
        { model: BrandsModel, as: "brands", attributes: ["brand_name"] },
      ],
    });

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.status(200).json(product);  // Return the found product
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error retrieving product", error: error.message });
  }
}

// ? Get getTotalProductQuantity
export const getTotalProductQuantity = async (req, res) => {
  try {
    // Calculate the sum of all quantity values in the products table
    const totalQuantity = await ProductsModel.sum("product_qty");

    if (totalQuantity === null) {
      return res.status(404).json({ msg: "No product data found!" });
    }

    // Return the total product quantity in the response
    res.status(200).json({ total: totalQuantity });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      msg: "Error retrieving total product quantity",
      error: error.message,
    });
  }
};

// ? Get Product By ID
export const getProductById = async (req, res) => {
  try {
    const product = await ProductsModel.findOne({
      where: { id: req.params.id },
      include: [
        { model: CategoryModel, as: "category", attributes: ["category_name"] },
      ],
    });

    if (!product) {
      return res
        .status(404)
        .json({ msg: `No product Found With This ID: ${req.params.id}` });
    }

    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error retrieving data by id", error: error.message });
  }
};

// ? add new product and show new product
export const addProduct = async (req, res) => {
  const {
    product_name,
    product_price,
    product_qty,
    product_qrcode,
    product_color, // This is optional
    category_id,
    brand_id,
  } = req.body;

  // Validate required fields
  if (
    !product_name ||
    !product_price ||
    !product_qty ||
    !product_qrcode ||
    !category_id
  ) {
    return res.status(400).json({ msg: "All required fields must be filled!" });
  }

  try {
    // Check if the product QR code is unique
    const existingProduct = await ProductsModel.findOne({
      where: { product_qrcode },
    });
    if (existingProduct) {
      return res.status(400).json({ msg: "Product QR Code already exists" });
    }

    // Create the product
    const product = await ProductsModel.create({
      product_name,
      product_price,
      product_qty,
      product_qrcode,
      product_color: product_color || null, // Save as null if not provided
      category_id,
      brand_id,
      user_id: req.userId,
    });

    // Insert into expenses
    await ExpensesModel.create({
      total_purchase: product_price * product_qty,
      purchase_price: product_price,
      quantity: product_qty,
      category_id,
      product_id: product.id,
      user_id: req.userId,
    });

    res.status(201).json({
      msg: "Product created successfully and added to expenses",
      data: { product },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ msg: "Error inserting data", error: error.message });
  }
};

// ? Update products by id
export const updateProductById = async (req, res) => {
  const { id } = req.params;
  const {
    product_name,
    product_price,
    product_qty,
    category_id,
    payment_type_id,
    listing_type_id,
  } = req.body;

  // Check for missing fields
  if (
    (!product_name && null) ||
    (!product_price && null) ||
    (!product_qty && null) ||
    (!category_id && null) ||
    (!payment_type_id && null) ||
    (!listing_type_id && null)
  ) {
    return res.status(400).json({
      msg: "All fields are required!",
    });
  }

  const product = await ProductsModel.findOne({
    where: { id },
  });

  if (!product) {
    return res.status(404).json({ msg: "No product found with this ID!" });
  }

  // Calculate total_purchase correctly based on new price and quantity
  const newTotalPurchase = product_price * product_qty;

  try {
    // Update the product in the ProductsModel
    await ProductsModel.update(
      {
        product_name,
        product_price,
        product_qty,
        category_id,
        payment_type_id,
        listing_type_id,
        user_id: req.userId,
      },
      {
        where: { id }, // Update the product with the same ID
      }
    );

    // Update the corresponding expense record in ExpensesModel
    await ExpensesModel.update(
      {
        total_purchase: newTotalPurchase, // Update total_purchase based on new values
        purchase_price: product_price, // Update purchase price
        quantity: product_qty, // Update the quantity
        category_id, // Maintain category_id
        user_id: req.userId, // Ensure correct user_id is updated
      },
      {
        where: { product_id: id }, // Ensure the same ID is updated in ExpensesModel
      }
    );

    res.status(200).json({
      msg: `Product updated successfully by this ID: ${id}`,
      data: {
        product_name,
        product_price,
        product_qty,
        category_id,
        payment_type_id,
        listing_type_id,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Error updating data", error: error.message });
  }
};

// ? Delete product by id
export const deleteProductById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: "Product ID is required" });
  }

  try {
    // Find the product details
    const product = await ProductsModel.findOne({ where: { id } });

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    const { product_price, product_qty, payment_type_id } = product;

    // Find the corresponding expenses record
    const expense = await ExpensesModel.findOne({ where: { product_id: id } });

    if (!expense) {
      // If no expense record exists, delete only the product
      await ProductsModel.destroy({ where: { id } });
      return res.status(200).json({
        msg: "Product deleted, no expenses to update.",
      });
    }

    console.log("Expense record before update:", expense);

    // Calculate new totals
    const totalSaleUpdate = expense.total_sale - product_price * product_qty;
    const totalPurchaseUpdate =
      expense.total_purchase - product_price * product_qty;
    let totalDebtUpdate = expense.total_debt;

    // Adjust debt if the payment type was a loan
    if (payment_type_id === 3) {
      totalDebtUpdate -= product_price * product_qty;
    }

    console.log("New total values:", {
      total_sale: totalSaleUpdate,
      total_purchase: totalPurchaseUpdate,
      total_debt: totalDebtUpdate,
    });

    // Update the expenses table
    const updateResult = await ExpensesModel.update(
      {
        total_sale: totalSaleUpdate,
        total_purchase: totalPurchaseUpdate,
        total_debt: totalDebtUpdate,
      },
      { where: { id: expense.id } }
    );

    console.log("Update result:", updateResult);

    // Delete the product
    await ProductsModel.destroy({ where: { id } });

    res
      .status(200)
      .json({ msg: "Product deleted and expenses updated successfully." });
  } catch (error) {
    console.error("Error during deletion:", error.message);
    res
      .status(500)
      .json({ msg: "Error deleting product", error: error.message });
  }
};
