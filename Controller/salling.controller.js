import InvoiceModel from "../Models/invoice.model.js";
import SallingProductModel from "../Models/saling.model.js";
import db from "../Config/database.js";
import ProductsModel from "../Models/products.model.js";
import SalesModel from "../Models/sales.model.js";
import moment from "moment";
import ArchivesModel from "../Models/archives.model.js";
import CustomerModel from "../Models/customer.model.js";

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
  const transaction = await db.transaction(); // Start transaction
  try {
    // Ensure Correct Data Types
    const salling_quantity = parseInt(req.body.salling_quantity, 10) || 1;
    const salling_discount = parseFloat(req.body.salling_discount) || 0;
    const salling_description = req.body.salling_description || "";
    const salling_status = req.body.salling_status || "کاش";
    const product_id = parseInt(req.body.product_id, 10) || null;
    const invoice_customer = req.body.invoice_customer || "Walk-in";
    const customer_phoneNo = req.body.customer_phoneNo || "Walk-in";
    const customer_address = req.body.customer_address || "Walk-in";
    const salling_date = req.body.salling_date
      ? new Date(req.body.salling_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    // Validate necessary fields
    if (!salling_quantity) {
      return res.status(400).json({ msg: "salling_quantity is required!" });
    } else if (!salling_status) {
      return res.status(400).json({ msg: "salling_status is required!" });
    }

    let priceDinarValue = req.body.salling_price
      ? parseFloat(req.body.salling_price.toString().replace(/,/g, ""))
      : null;
    let priceDolarValue = req.body.salling_price_dolar
      ? parseFloat(req.body.salling_price_dolar.toString().replace(/,/g, ""))
      : null;

    // If only salling_price_dolar is provided, convert to IQD
    if (priceDinarValue === null && priceDolarValue !== null) {
      const exchangeRate = parseFloat(req.body.exchangeRate) || 1500; // Default exchange rate if none is provided
      priceDinarValue = priceDolarValue * exchangeRate;
      console.log("Converted Price from Dolar to IQD:", priceDinarValue);
    }

    // If only salling_price is provided, use it for the calculation
    if (priceDinarValue !== null && priceDolarValue === null) {
      priceDolarValue =
        priceDinarValue / (parseFloat(req.body.exchangeRate) || 1500); // Convert IQD to USD
      console.log("Converted Price from IQD to Dolar:", priceDolarValue);
    }

    // If both prices are null, return an error
    if (priceDinarValue === null && priceDolarValue === null) {
      return res.status(400).json({
        msg: "Either salling_price (IQD) or salling_price_dolar (USD) must be provided.",
      });
    }

    // Validate the prices after conversion or input
    if (priceDinarValue <= 0) {
      return res
        .status(400)
        .json({ msg: "salling_price (IQD) must be greater than zero." });
    }

    if (priceDolarValue <= 0 && priceDinarValue === null) {
      return res
        .status(400)
        .json({ msg: "salling_price_dolar (USD) must be greater than zero." });
    }

    // Validate discount percentage
    if (salling_discount < 0 || salling_discount > 100) {
      return res
        .status(400)
        .json({ msg: "Discount should be between 0 and 100." });
    }

    // Fetch Product (if a single product is provided)
    let products = [];
    if (req.body.products) {
      products = req.body.products;
    } else if (product_id) {
      products = [{ product_id, quantity: salling_quantity }];
    } else {
      return res.status(400).json({ msg: "Products array is required." });
    }

    // Get Logged-in User
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ msg: "User is not logged in" });
    }

    // Try to find the customer first
    let customer = await CustomerModel.findOne({
      where: { customer_name: invoice_customer },
    });

    // If customer doesn't exist, create a new customer
    if (!customer) {
      customer = await CustomerModel.create({
        customer_name: invoice_customer,
        customer_phoneNo,
        customer_address,
        invoice_id: null, // No invoice yet
      });
    }

    let allSales = [];
    let allInvoices = [];

    // Process each product
    for (const item of products) {
      const { product_id, quantity = 1 } = item;
      const product = await ProductsModel.findByPk(parseInt(product_id, 10));
      if (!product) {
        return res
          .status(404)
          .json({ msg: `No Product Found With ID: ${product_id}` });
      }

      // Check if sufficient quantity is available
      if (product.product_qty < quantity) {
        return res.status(400).json({
          msg: `Not enough stock for product ID: ${product_id}. Only ${product.product_qty} units available.`,
        });
      }

      // Calculate Discount & Total Price
      const discountAmount = (priceDinarValue * salling_discount) / 100;
      const price_after_discount = priceDinarValue - discountAmount;
      const price_after_discount_dolar = priceDolarValue - discountAmount;

      // Log discount and price calculation
      console.log("Salling Discount:", salling_discount);
      console.log("Discount Amount:", discountAmount);
      console.log("Price After Discount:", price_after_discount);
      console.log("Price dolar After Discount:", price_after_discount_dolar);

      if (price_after_discount <= 0) {
        return res.status(400).json({
          msg: "Price after discount must be greater than zero.",
        });
      }

      // Calculate total price
      const salling_total_price = price_after_discount * salling_quantity; // Use the discounted price for the total calculation
      const salling_total_price_dolar =
        price_after_discount_dolar * salling_quantity;

      console.log("Total Price Dollar", salling_total_price_dolar);

      if (salling_total_price_dolar <= 0) {
        return res.status(400).json({
          msg: "salling_total_price_dolar (USD) must be greater than zero.",
        });
      }

      // Debugging log for total price
      console.log("Calculated Salling Total Price:", salling_total_price);
      console.log(
        "Calculated Salling Total Price Dollar:",
        salling_total_price_dolar
      );

      if (salling_total_price <= 0) {
        return res.status(400).json({
          msg: "salling_total_price must be greater than zero.",
        });
      }

      const profit_per_unit = price_after_discount - product.product_price;
      const profit_amount = profit_per_unit * quantity;

      // Insert Salling Record
      const salling = await SallingProductModel.create(
        {
          salling_date,
          salling_quantity: quantity,
          salling_price: priceDinarValue,
          salling_price_dolar: priceDolarValue,
          salling_discount,
          salling_status,
          price_after_discount,
          salling_total_price,
          salling_total_price_dolar,
          salling_description,
          profit_amount,
          product_id,
          category_id: product.category_id,
          brand_id: product.brand_id,
          user_id: userId,
        },
        { transaction }
      );
      const sale = await SalesModel.create(
        {
          product_id,
          quantity: salling_quantity,
          price: priceDinarValue,
          price_dolar: priceDolarValue,
          total_price: salling.price_after_discount,
          total_price_dolar: salling.salling_total_price_dolar,
          category_id: product.category_id,
          sale_date: salling.salling_date,
          discount: salling_discount,
          profit_amount,
          brand_id: product.brand_id,
          user_id: userId,
        },
        { transaction }
      );

      // Now you can safely use the sale ID in the invoice creation
      const invoice = await InvoiceModel.create(
        {
          invoice_quantity: salling.salling_quantity,
          invoice_pirce: salling.salling_price,
          invoice_pirce_dolar: salling.salling_price_dolar,
          invoice_total_pirce: salling.salling_total_price,
          invoice_total_pirce_dolar: salling.salling_total_price_dolar,
          invoice_status: salling.salling_status,
          invoice_date: salling.salling_date,
          invoice_customer,
          product_id,
          user_id: userId,
          customer_id: customer.id,
          sale_id: sale.id, // Associate sale_id here
        },
        { transaction }
      );

      // ✅ Update the customer's invoice_id after invoice creation
      await CustomerModel.update(
        { invoice_id: invoice.id },
        { where: { id: customer.id }, transaction }
      );

      // Update Product Quantity
      const updatedQty = product.product_qty - quantity;
      await product.update({ product_qty: updatedQty }, { transaction });

      if (updatedQty === 0) {
        // Insert into Archives table
        await ArchivesModel.create(
          {
            id: product.id,
            product_name: product.product_name,
            product_price: product.product_price,
            product_qty: quantity, // Correct quantity
            description: product.description,
            category_id: product.category_id,
            product_code: product.product_code,
            brand_id: product.brand_id,
            user_id: userId,
            date_added: new Date(),
          },
          { transaction }
        );

        // Delete the product from active stock
        // await product.destroy({ transaction });
      }

      // Add Sale and Invoice to respective arrays
      allSales.push(sale);
      allInvoices.push(invoice);
    }

    // Commit Transaction
    await transaction.commit();
    res.json({
      msg: "Sale and invoice recorded successfully!",
      sales: allSales,
      invoices: allInvoices,
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Error:", err);
    res.status(500).json({ msg: "Internal Server Error", error: err.message });
  }
};
