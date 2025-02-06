import BrandsModel from "../Models/brands.model.js";
import CategoryModel from "../Models/category.model.js";
import CustomerModel from "../Models/customer.model.js";
import InvoiceModel from "../Models/invoice.model.js";
import ProductsModel from "../Models/products.model.js";
import SalesModel from "../Models/sales.model.js";

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await CustomerModel.findAll(); // Fetch all customers
    return res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};

// ? get salling customers by id
export const getSalesByCustomerId = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch customer details
    const customer = await CustomerModel.findByPk(id, {
      attributes: [
        "id",
        "customer_name",
        "customer_phoneNo",
        "customer_address",
      ],
    });

    if (!customer) {
      return res.status(404).json({ msg: "Customer not found." });
    }

    // Fetch sales related to the customer
    const salesData = await SalesModel.findAll({
      include: [
        {
          model: InvoiceModel,
          as: "invoices",
          where: { invoice_customer: customer.customer_name }, // Match by name
          attributes: [
            "invoice_quantity",
            "invoice_pirce",
            "invoice_pirce_dolar",
            "invoice_total_pirce",
            "invoice_customer",
            "invoice_total_pirce_dolar",
            "invoice_status",
            "invoice_date",
          ],
        },
        {
          model: ProductsModel,
          as: "product",
          attributes: ["product_name"],
        },
        {
          model: CategoryModel,
          as: "category",
          attributes: ["category_name"],
        },
        {
          model: BrandsModel,
          as: "brand",
          attributes: ["brand_name"],
        },
      ],
    });

    if (!salesData || salesData.length === 0) {
      return res.status(404).json({ msg: "No sales found for this customer." });
    }

    // Format the response
    const formattedSales = salesData.map((sale) => ({
      id: sale.id,
      product: sale.product?.product_name || "N/A",
      category: sale.category?.category_name || "N/A",
      brand: sale.brand?.brand_name || "N/A",
      invoices: sale.invoices.map((invoice) => ({
        invoice_quantity: invoice.invoice_quantity,
        invoice_pirce: invoice.invoice_pirce,
        invoice_pirce_dolar: invoice.invoice_pirce_dolar,
        invoice_total_pirce: invoice.invoice_total_pirce,
        invoice_total_pirce_dolar: invoice.invoice_total_pirce_dolar,
        invoice_status: invoice.invoice_status,
        invoice_customer: invoice.invoice_customer,
        invoice_date: invoice.invoice_date,
      })),
    }));

    return res.json({
      customer: {
        id: customer.id,
        name: customer.customer_name,
        phone: customer.customer_phoneNo,
        address: customer.customer_address,
      },
      total_quantity_sold: formattedSales.reduce(
        (total, sale) =>
          total +
          sale.invoices.reduce(
            (sum, invoice) => sum + invoice.invoice_quantity,
            0
          ),
        0
      ),
      sales: formattedSales,
    });
  } catch (error) {
    console.error("Error fetching customer sales data:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};

// ? get salling by customers
export const getSalesByCustomerName = async (req, res) => {
  try {
    const { customerName } = req.params;

    // Fetch sales with related data
    const salesData = await SalesModel.findAll({
      include: [
        {
          model: InvoiceModel,
          as: "invoices",
          where: { invoice_customer: customerName },
          attributes: [
            "invoice_quantity",
            "invoice_pirce",
            "invoice_customer",
            "invoice_pirce_dolar",
            "invoice_total_pirce",
            "invoice_total_pirce_dolar",
            "invoice_status",
            "invoice_date",
          ],
        },
        {
          model: ProductsModel,
          as: "product", // Ensure this alias matches your associations
          attributes: ["product_name"],
        },
        {
          model: CategoryModel,
          as: "category", // Ensure this alias matches your associations
          attributes: ["category_name"],
        },
        {
          model: BrandsModel,
          as: "brand", // Ensure this alias matches your associations
          attributes: ["brand_name"],
        },
      ],
    });

    if (!salesData || salesData.length === 0) {
      return res.status(404).json({ msg: "No sales found for this customer." });
    }

    // Format the response
    const formattedSales = salesData.map((sale) => ({
      id: sale.id,
      product: sale.product?.product_name || "N/A",
      category: sale.category?.category_name || "N/A",
      brand: sale.brand?.brand_name || "N/A",
      invoices: sale.invoices.map((invoice) => ({
        invoice_quantity: invoice.invoice_quantity,
        invoice_pirce: invoice.invoice_pirce,
        invoice_pirce_dolar: invoice.invoice_pirce_dolar,
        invoice_total_pirce: invoice.invoice_total_pirce,
        invoice_total_pirce_dolar: invoice.invoice_total_pirce_dolar,
        invoice_status: invoice.invoice_status,
        invoice_customer: invoice.invoice_customer,
        invoice_date: invoice.invoice_date,
      })),
    }));

    return res.json({
      total_quantity_sold: formattedSales.reduce(
        (total, sale) =>
          total +
          sale.invoices.reduce(
            (sum, invoice) => sum + invoice.invoice_quantity,
            0
          ),
        0
      ),
      sales: formattedSales,
    });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { customer_name, customer_phoneNo, customer_address } = req.body;

    let customer = await CustomerModel.findOne({ where: { customer_name } });

    if (!customer) {
      customer = await CustomerModel.create({
        customer_name,
        customer_phoneNo,
        customer_address,
        invoice_id: null, // ✅ No invoice yet
      });
    }

    return res
      .status(201)
      .json({ message: "Customer created successfully", customer });
  } catch (error) {
    console.error("Error creating customer:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
