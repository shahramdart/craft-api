import CategoryModel from "../Models/category.model.js";
import ExpensesModel from "../Models/expenses.model.js";
import ProductsModel from "../Models/products.model.js";
import db from "../Config/database.js";
import BrandsModel from "../Models/brands.model.js";
import InvoiceModel from "../Models/invoice.model.js";

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
  const { qrcode } = req.params; // Get QR code from URL parameters

  try {
    // Query for the product based on the QR code
    const product = await ProductsModel.findOne({
      where: { product_qrcode: qrcode }, // Match the QR code in the database
      include: [
        { model: CategoryModel, as: "category", attributes: ["category_name"] },
        { model: BrandsModel, as: "brands", attributes: ["brand_name"] },
      ],
    });

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.status(200).json(product); // Return the found product
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error retrieving product", error: error.message });
  }
};

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
    product_price, // IQD
    product_price_dolar, // USD
    product_qty,
    product_qrcode,
    product_color, // Optional
    category_id,
    brand_id,
    exchangeRate, // Required exchange rate
  } = req.body;

  if (!product_name) {
    return res.status(400).json({ msg: "All required fields must be filled!" });
  } else if (!product_qty) {
    return res.status(400).json({ msg: "product_qty  it must be filled!" });
  } else if (!product_qrcode) {
    return res.status(400).json({ msg: "product_qrcode  it must be filled!" });
  } else if (!category_id) {
    return res.status(400).json({ msg: "category_id  it must be filled!" });
  } else if (!exchangeRate) {
    return res.status(400).json({ msg: "exchangeRate  it must be filled!" });
  }

  let priceDinarValue = 0;
  let priceDolarValue = 0;

  if (product_price && product_price.trim() !== "") {
    priceDinarValue = parseFloat(product_price.replace(/,/g, ""));
    if (isNaN(priceDinarValue)) {
      return res.status(400).json({ msg: "Invalid product_price format." });
    }

    if (!isNaN(exchangeRate)) {
      priceDolarValue = (priceDinarValue / parseFloat(exchangeRate)).toFixed(2);
    } else {
      return res.status(400).json({ msg: "Exchange rate must be valid." });
    }
  } else if (product_price_dolar && product_price_dolar.trim() !== "") {
    priceDolarValue = parseFloat(product_price_dolar.replace(/,/g, ""));
    if (isNaN(priceDolarValue)) {
      return res
        .status(400)
        .json({ msg: "Invalid product_price_dolar format." });
    }

    if (!isNaN(exchangeRate)) {
      priceDinarValue = Math.round(priceDolarValue * parseFloat(exchangeRate));
    } else {
      return res.status(400).json({ msg: "Exchange rate must be valid." });
    }
  } else {
    return res.status(400).json({
      msg: "Either product_price (IQD) or product_price_dolar (USD) must be provided.",
    });
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
      product_price: priceDinarValue,
      product_price_dolar: priceDolarValue,
      product_qty,
      product_qrcode,
      product_color: product_color || null,
      category_id,
      brand_id,
      user_id: req.userId,
    });

    // Insert into expenses
    await ExpensesModel.create({
      total_purchase: priceDinarValue * product_qty,
      total_purchase_dolar: priceDolarValue * product_qty,
      purchase_price: priceDinarValue,
      purchase_price_dolar: priceDolarValue,
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
    product_price, // IQD
    product_price_dolar, // USD
    product_qty,
    category_id,
    payment_type_id,
    listing_type_id,
    exchangeRate, // Required exchange rate
  } = req.body;

  if (
    (!product_name && null) ||
    (!product_qty && null) ||
    (!category_id && null) ||
    (!payment_type_id && null) ||
    (!listing_type_id && null) ||
    (!product_price && !product_price_dolar) || // At least one price must be provided
    !exchangeRate // Exchange rate is required
  ) {
    return res.status(400).json({ msg: "All fields are required!" });
  }

  let priceDinarValue = 0;
  let priceDolarValue = 0;

  if (product_price && product_price.trim() !== "") {
    priceDinarValue = parseFloat(product_price.replace(/,/g, ""));
    if (isNaN(priceDinarValue)) {
      return res.status(400).json({ msg: "Invalid product_price format." });
    }

    if (!isNaN(exchangeRate)) {
      priceDolarValue = (priceDinarValue / parseFloat(exchangeRate)).toFixed(2);
    } else {
      return res.status(400).json({ msg: "Exchange rate must be valid." });
    }
  } else if (product_price_dolar && product_price_dolar.trim() !== "") {
    priceDolarValue = parseFloat(product_price_dolar.replace(/,/g, ""));
    if (isNaN(priceDolarValue)) {
      return res
        .status(400)
        .json({ msg: "Invalid product_price_dolar format." });
    }

    if (!isNaN(exchangeRate)) {
      priceDinarValue = Math.round(priceDolarValue * parseFloat(exchangeRate));
    } else {
      return res.status(400).json({ msg: "Exchange rate must be valid." });
    }
  } else {
    return res.status(400).json({
      msg: "Either product_price (IQD) or product_price_dolar (USD) must be provided.",
    });
  }

  const product = await ProductsModel.findOne({ where: { id } });

  if (!product) {
    return res.status(404).json({ msg: "No product found with this ID!" });
  }

  const newTotalPurchaseDinar = priceDinarValue * product_qty;
  const newTotalPurchaseDolar = priceDolarValue * product_qty;

  try {
    // Update product in the database
    await ProductsModel.update(
      {
        product_name,
        product_price: priceDinarValue,
        product_price_dolar: priceDolarValue,
        product_qty,
        category_id,
        payment_type_id,
        listing_type_id,
        user_id: req.userId,
      },
      { where: { id } }
    );

    // Update expenses with both IQD & USD values
    await ExpensesModel.update(
      {
        total_purchase: newTotalPurchaseDinar, // Total in IQD
        total_purchase_dolar: newTotalPurchaseDolar, // Total in USD
        purchase_price: priceDinarValue, // Price per unit in IQD
        purchase_price_dolar: priceDolarValue, // Price per unit in USD
        quantity: product_qty,
        category_id,
        user_id: req.userId,
      },
      { where: { product_id: id } }
    );

    res.status(200).json({
      msg: `Product updated successfully by this ID: ${id}`,
      data: {
        product_name,
        product_price: priceDinarValue,
        product_price_dolar: priceDolarValue,
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

    // Remove the product reference from invoices by setting product_id to NULL
    await InvoiceModel.update(
      { product_id: product.id },
      { where: { product_id: id } }
    );

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
