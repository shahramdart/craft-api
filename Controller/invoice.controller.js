import InvoiceModel from "../Models/invoice.model.js";
import db from "../Config/database.js";
import SaleModel from "../Models/sales.model.js"; // Assuming a SaleModel exists
import ProductsModel from "../Models/products.model.js";
import CategoryModel from "../Models/category.model.js";
import Users from "../Models/user.model.js";
import BrandsModel from "../Models/brands.model.js";

// ? Get all Invoice
export const getAllInvoice = async (req, res) => {
  try {
    const invoices = await InvoiceModel.findAll({
      include: [
        {
          model: ProductsModel, // Include the product details
          as: "products", // Alias for the product relationship
          attributes: ["product_name"], // Specify the attributes you need from ProductsModel
        },
        {
          model: Users, // Include the user details
          as: "users", // Alias for the user relationship
          attributes: ["name"], // Specify the attributes you need from Users
        },
        {
          model: ProductsModel, // Include category from ProductModel (if relationship exists)
          as: "products",
          include: [
            {
              model: CategoryModel, // Assuming CategoryModel is associated with ProductModel
              as: "category", // Alias for category relationship
              attributes: ["category_name"], // Category name field in the CategoryModel
            },
            {
              model: BrandsModel, // Assuming CategoryModel is associated with ProductModel
              as: "brands", // Alias for category relationship
              attributes: ["brand_name"], // Category name field in the CategoryModel
            },
          ],
        },
      ],
    });

    if (invoices.length === 0) {
      return res.status(404).json({ msg: "No invoice Found!" });
    }

    res.status(200).json(invoices);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error Fetching invoice!", error: error.message });
  }
};

// ? Get invoice by id
export const getInvoiceById = async (req, res) => {
  const { id } = req.params; // Get the invoice ID from the URL params

  try {
    // Fetch the invoice by ID, including related data like products, users, categories, and brands
    const invoice = await InvoiceModel.findOne({
      where: { id }, // Ensure we fetch by the provided ID
      include: [
        {
          model: ProductsModel, // Include the product details
          as: "products", // Alias for the product relationship
          attributes: ["product_name"], // Specify the attributes you need from ProductsModel
        },
        {
          model: Users, // Include the user details
          as: "users", // Alias for the user relationship
          attributes: ["name"], // Specify the attributes you need from Users
        },
        {
          model: ProductsModel, // Include category from ProductModel (if relationship exists)
          as: "products",
          include: [
            {
              model: CategoryModel, // Assuming CategoryModel is associated with ProductModel
              as: "category", // Alias for category relationship
              attributes: ["category_name"], // Category name field in the CategoryModel
            },
            {
              model: BrandsModel, // Assuming CategoryModel is associated with ProductModel
              as: "brands", // Alias for category relationship
              attributes: ["brand_name"], // Category name field in the CategoryModel
            },
          ],
        },
      ],
    });

    // Check if the invoice was found
    if (!invoice) {
      return res.status(404).json({ msg: "Invoice not found!" });
    }

    // Return the invoice details
    res.status(200).json(invoice);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error fetching invoice!", error: error.message });
  }
};

// ? add invoice and show new invoice
export const addInvoice = async (req, res) => {
  const {
    invoice_quantity,
    invoice_pirce,
    invoice_status,
    invoice_date,
    invoice_customer,
    product_id,
  } = req.body;

  if (
    !invoice_quantity ||
    !invoice_pirce ||
    !invoice_status ||
    !invoice_date ||
    !product_id
  ) {
    return res.status(400).json({
      msg: "All fields (invoice_quantity, invoice_pirce, invoice_status, invoice_date, and product_id) are required!",
    });
  }

  const invoice_total_pirce = invoice_pirce * invoice_quantity;

  // Start a transaction
  const transaction = await db.transaction();

  try {
    // Check if the product exists
    const product = await ProductsModel.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Check if there is enough quantity in stock
    if (product.product_qty < invoice_quantity) {
      return res.status(400).json({ msg: "Not enough quantity in stock" });
    }

    // Update the product quantity (reduce by the sold amount)
    const updatedQty = product.product_qty - invoice_quantity;

    // Check if the product is out of stock after the update
    if (updatedQty === 0) {
      console.warn(`Product ID ${product_id} is now out of stock.`);
    }

    // Update product quantity
    await product.update({ product_qty: updatedQty }, { transaction });

    // Insert into the invoice table
    const invoice = await InvoiceModel.create(
      {
        invoice_quantity,
        invoice_pirce,
        invoice_total_pirce,
        invoice_status,
        invoice_date,
        invoice_customer,
        product_id,
        user_id: req.userId, // Assuming user ID is retrieved from the authenticated user
      },
      { transaction }
    );

    // Insert into the sale table
    await SaleModel.create(
      {
        product_id,
        quantity: invoice_quantity,
        price: invoice_pirce,
        total_price: invoice_total_pirce,
        category_id: product.category_id,
        sale_date: invoice_date,
        user_id: req.userId,
      },
      { transaction }
    );

    // Commit the transaction
    await transaction.commit();

    return res.status(201).json({
      msg: "Invoice and sale data added successfully",
      invoice,
      remaining_qty: updatedQty, // Return the updated quantity after sale
    });
  } catch (error) {
    // Rollback transaction in case of any errors
    await transaction.rollback();
    console.error("Error adding invoice and sale data:", error);
    return res.status(500).json({
      msg: "An error occurred while adding invoice and sale data",
    });
  }
};

// ? update invoice

// ? delete invoice
