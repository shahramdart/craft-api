import InvoiceModel from "../Models/invoice.model.js";
import SallingProductModel from "../Models/saling.model.js";
import db from "../Config/database.js";
import ProductsModel from "../Models/products.model.js";
import SalesModel from "../Models/sales.model.js";
import moment from "moment";

//  ? Get all saling product
export const getAllSalling = async (req, res) => {
  try {
    const salling = await SallingProductModel.findAll();
    if (salling.length === 0) {
      return res.status(404).json({ msg: "No Salling found!" });
    }
    res.status(200).json(salling);
  } catch (error) {
    return res.status(500).json({ msg: "Error Fetching Salling product!" });
  }
};

//  ? Get saling product by id
export const getSallingById = async (req, res) => {
  const { id } = req.params;

  try {
    const salling = await SallingProductModel.findOne({
      where: { id },
    });
    if (!salling) {
      return res
        .status(404)
        .json({ msg: "No saling product found with this id!" });
    }

    res.status(200).json(salling);
  } catch (error) {
    return res.status(500).json({ msg: "Error Fetching Salling product!" });
  }
};

// ? sale product and the data inserts to invoice table
export const addSalling = async (req, res) => {
  const {
    salling_date,
    salling_quantity,
    salling_price,
    salling_discount = 0, // Default to 0 if not provided
    salling_description,
    salling_status,
    product_id,
    brand_id,
    invoice_customer,
    category_id,
  } = req.body;

  if (!salling_quantity) {
    return res.status(400).json({ msg: "salling_quantity is required!" });
  } else if (!salling_price) {
    return res.status(400).json({ msg: "salling_price is required!" });
  } else if (!product_id) {
    return res.status(400).json({ msg: "product_id is required!" });
  } else if (!salling_status) {
    return res.status(400).json({ msg: "salling_status is required!" });
  }

  // Validate date format (YYYY-MM-DD)
  if (!moment(salling_date, "YYYY-MM-DD", true).isValid()) {
    return res.status(400).json({ msg: "Invalid salling_date format!" });
  }

  // Start a transaction
  const transaction = await db.transaction();

  try {
    // Check if the product exists
    const product = await ProductsModel.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ msg: "هیچ بەرهەمێک نادۆزرایەوە" });
    }

    // Check if the selling price is less than the product price
    if (salling_price < product.product_price) {
      return res.status(400).json({
        msg: "نرخی فرۆشتن ناتوانێت لە نرخی بەرهەم کەمتر بێت.",
      });
    }

    // Check if enough quantity is available
    if (product.product_qty < salling_quantity) {
      return res.status(400).json({ msg: "عددی نەماەوە" });
    }

    // Calculate price and totals
    const discountAmount = (salling_price * salling_discount) / 100;
    const price_after_discount = salling_price - discountAmount;
    const salling_total_price = price_after_discount * salling_quantity;

    const sall_date = Date.now(); // Formats the date as 'YYYY-MM-DD'

    // Calculate profit
    const profit_per_unit = price_after_discount - product.product_price;
    const profit_amount = profit_per_unit * salling_quantity;

    // Insert into the salling table
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ msg: "User is not logged in" });
    }

    const salling = await SallingProductModel.create(
      {
        salling_date: sall_date || Date.now(),
        salling_quantity,
        salling_price,
        salling_discount,
        salling_status,
        price_after_discount,
        salling_total_price,
        salling_description,
        profit_amount, // Save the profit amount
        product_id,
        category_id: product.category_id,
        brand_id: product.brand_id,
        user_id: userId, // Use session userId
      },
      { transaction }
    );

    // Update the product quantity
    const updatedQty = product.product_qty - salling_quantity;
    await product.update({ product_qty: updatedQty }, { transaction });

    // If the product quantity reaches 0, handle the case
    if (updatedQty === 0) {
      console.warn(`Product ID ${product_id} is now out of stock.`);
    }

    // Insert into the invoice table
    const invoice = await InvoiceModel.create(
      {
        invoice_quantity: salling.salling_quantity,
        invoice_pirce: salling.salling_price,
        invoice_total_pirce: salling.salling_total_price,
        invoice_status: salling.salling_status, // Example status
        invoice_date: salling.salling_date,
        invoice_customer: salling.invoice_customer || "Walk-in", // Default customer if not provided
        product_id,
        user_id: userId, // Assuming user ID is retrieved from authentication
      },
      { transaction }
    );

    // Insert into the sale table
    await SalesModel.create(
      {
        product_id: product_id,
        quantity: invoice.invoice_quantity,
        price: invoice.invoice_pirce,
        total_price: salling.price_after_discount,
        category_id: category_id,
        sale_date: invoice.invoice_date,
        discount: 0.0,
        profit_amount, // Save profit for the sale
        brand_id: product.brand_id,
        category_id: product.category_id,
        user_id: userId,
      },
      { transaction }
    );

    // Commit the transaction
    await transaction.commit();

    return res.status(201).json({
      msg: "Salling and invoice data added successfully!",
      salling,
      invoice,
      profit: profit_amount, // Return the profit for this sale
      remaining_qty: updatedQty,
    });
  } catch (error) {
    // Rollback transaction in case of any errors
    await transaction.rollback();
    console.error("Error adding salling and invoice data:", error);
    return res.status(500).json({
      msg: "An error occurred while adding salling and invoice data.",
    });
  }
};
