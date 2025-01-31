import InvoiceModel from "../Models/invoice.model.js";
import SallingProductModel from "../Models/saling.model.js";
import db from "../Config/database.js";
import ProductsModel from "../Models/products.model.js";
import SalesModel from "../Models/sales.model.js";
import moment from "moment";
import ArchivesModel from "../Models/archives.model.js";

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
  const transaction = await db.transaction(); // Declare transaction at the beginning
  try {
    // ✅ Ensure Correct Data Types
    const salling_quantity = parseInt(req.body.salling_quantity, 10) || 1;
    const salling_price = parseFloat(req.body.salling_price) || 0;
    const salling_discount = parseFloat(req.body.salling_discount) || 0;
    const salling_description = req.body.salling_description || "";
    const salling_status = req.body.salling_status || "کاش";
    const product_id = parseInt(req.body.product_id, 10) || null;
    const category_id = parseInt(req.body.category_id, 10) || null;
    const brand_id = parseInt(req.body.brand_id, 10) || null;
    const invoice_customer = req.body.invoice_customer || "Walk-in";
    const salling_date = req.body.salling_date
      ? new Date(req.body.salling_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]; // Default to today if not provided

    if (!salling_quantity) {
      return res.status(400).json({ msg: "salling_quantity is required!" });
    } else if (!salling_status) {
      return res.status(400).json({ msg: "salling_status is required!" });
    }

    // ✅ Validate Date Format
    const sallingDate = req.body.salling_date || moment().format("YYYY-MM-DD");

    // Validate the salling_date format
    if (!moment(sallingDate, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).json({ msg: "Invalid salling_date format!" });
    }

    console.log("Request body:", req.body);

    // ✅ Fetch Product
    console.log("Searching for product with ID:", product_id);
    const product = await ProductsModel.findByPk(product_id);
    // findByPk = find by primary key واتە بەپێی ئادیە سەرەکیەکە داتایەکە دەهێنێتەوە
    if (!product) {
      return res
        .status(404)
        .json({ msg: `No Product Found With ID: ${product_id}` });
    }

    // ✅ Validate Price & Quantity
    if (salling_price < product.product_price) {
      return res
        .status(400)
        .json({ msg: "نرخی فرۆشتن ناتوانێت لە نرخی بەرهەم کەمتر بێت." });
    }
    if (product.product_qty < salling_quantity) {
      return res.status(400).json({ msg: "عددی نەماەوە" });
    }

    // ✅ Calculate Discount & Total Price
    const discountAmount = (salling_price * salling_discount) / 100;
    const price_after_discount = salling_price - discountAmount;
    const salling_total_price = price_after_discount * salling_quantity;
    const profit_per_unit = price_after_discount - product.product_price;
    const profit_amount = profit_per_unit * salling_quantity;

    // ✅ Get Logged-in User
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ msg: "User is not logged in" });
    }

    // ✅ Insert Salling Record
    const salling = await SallingProductModel.create(
      {
        salling_date, // Format the date
        salling_quantity,
        salling_price,
        salling_discount,
        salling_status,
        price_after_discount,
        salling_total_price,
        salling_description,
        profit_amount,
        product_id,
        category_id: product.category_id,
        brand_id: product.brand_id,
        user_id: userId,
      },
      { transaction }
    );

    // ✅ Insert Invoice Record
    const invoice = await InvoiceModel.create(
      {
        invoice_quantity: salling.salling_quantity,
        invoice_pirce: salling.salling_price,
        invoice_total_pirce: salling.salling_total_price,
        invoice_status: salling.salling_status,
        invoice_date: salling.salling_date,
        invoice_customer,
        product_id,
        user_id: userId,
      },
      { transaction }
    );

    // ✅ Insert Sales Record
    await SalesModel.create(
      {
        product_id,
        quantity: invoice.invoice_quantity,
        price: invoice.invoice_pirce,
        total_price: salling.price_after_discount,
        category_id,
        sale_date: invoice.invoice_date,
        discount: 0.0,
        profit_amount,
        brand_id: product.brand_id,
        category_id: product.category_id,
        user_id: userId,
      },
      { transaction }
    );

    // ✅ Check Product Quantity and Archive if Necessary
    const updatedQty = product.product_qty - salling_quantity;
    await product.update({ product_qty: updatedQty }, { transaction });

    if (updatedQty === 0) {
      // Insert into Archives table
      await ArchivesModel.create(
        {
          id: product.id,
          product_name: product.product_name,
          product_price: product.product_price,
          product_qty: salling_quantity, // Correct quantity
          description: product.description,
          category_id: product.category_id,
          brand_id: product.brand_id,
        },
        { transaction }
      );

      // Delete from Products table
      // await product.destroy({ transaction });
    }

    // ✅ Commit Transaction
    await transaction.commit();

    return res.status(201).json({
      msg: "Salling and invoice data added successfully!",
      salling,
      invoice,
      profit: profit_amount,
      remaining_qty: updatedQty,
    });
  } catch (error) {
    // ✅ Rollback Transaction on Error
    await transaction.rollback();
    console.error("Error adding salling and invoice data:", error);
    return res.status(500).json({
      msg: "An error occurred while adding salling and invoice data.",
    });
  }
};
