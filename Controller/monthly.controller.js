import BrandsModel from "../Models/brands.model.js";
import CategoryModel from "../Models/category.model.js";
import InstallmentSalesModel from "../Models/installment_sales.model.js";
import ProductsModel from "../Models/products.model.js";
import Users from "../Models/user.model.js";

// ? Get all Monthly products
export const getAllPaymentType = async (req, res) => {
  try {
    const installmentSales = await InstallmentSalesModel.findAll({
      include: [
        {
          model: ProductsModel, // Include the product details
          as: "products", // Alias for the product relationship
          attributes: ["product_name", "product_price"], // Specify the attributes you need from ProductsModel
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

    if (installmentSales.length === 0) {
      return res.status(404).json({ msg: "No installment sales found" });
    }

    res.status(200).json(installmentSales);
  } catch (error) {
    console.error(
      "Error fetching installment sales with product details:",
      error
    );
    res
      .status(500)
      .json({ msg: "Error retrieving data", error: error.message });
  }
};

// ? Get Monthly products by id
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const getPayment = await InstallmentSalesModel.findOne({
      where: { id },
      include: [
        {
          model: ProductsModel, // Include the product details
          as: "products", // Alias for the product relationship
          attributes: ["product_name", "product_price"], // Specify the attributes you need from ProductsModel
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

    if (!getPayment) {
      return res.status(404).json({ msg: `No data found with thid ID: ${id}` });
    }

    res.status(200).json(getPayment);
  } catch (error) {
    console.error("Error fetching payment type:", error); // Log the error for debugging
    res
      .status(500)
      .json({ msg: "Error retrieving data", error: error.message });
  }
};

// ? Sale products by monthly
export const SaleMonthlyProducts = async (req, res) => {
  const {
    product_id,
    quantity,
    peshaky_payment,
    paray_mawa,
    qty_qist,
    total_qistakan,
    qisty_mawa,
    paray_zyada,
    date,
    final_date,
    status,
    customer_name,
    customer_phoneNo,
    customer_address,
  } = req.body;

  // Validate the required fields
  if (!product_id) {
    return res.status(400).json({ msg: "product_id is required!" });
  } else if (!peshaky_payment) {
    return res.status(400).json({ msg: "salling_price is required!" });
  } else if (!quantity) {
    return res.status(400).json({ msg: "quantity is required!" });
  } else if (!qty_qist) {
    return res.status(400).json({ msg: "qty_qist is required!" });
  } else if (!total_qistakan) {
    return res.status(400).json({ msg: "total_qistakan is required!" });
  } else if (!qisty_mawa) {
    return res.status(400).json({ msg: "qisty_mawa is required!" });
  } else if (!date) {
    return res.status(400).json({ msg: "date is required!" });
  } else if (!final_date) {
    return res.status(400).json({ msg: "final_payment_date is required!" });
  } else if (!status) {
    return res.status(400).json({ msg: "status is required!" });
  } else if (!customer_name) {
    return res.status(400).json({ msg: "customer_name is required!" });
  } else if (!customer_phoneNo) {
    return res.status(400).json({ msg: "customer_phoneNo is required!" });
  }

  try {
    // Fetch the product details using the product_id
    const product = await ProductsModel.findOne({
      where: { id: product_id },
      attributes: ["product_price"], // Assuming the price field in the ProductsModel is 'price'
    });

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    const product_price = parseFloat(product.product_price); // Ensure it's a number
    const paray_zyada_num = parseFloat(paray_zyada); // Ensure it's a number
    const peshaky_payment_num = parseFloat(peshaky_payment); // Ensure it's a number

    // Log values for debugging
    console.log("Product Price:", product_price);
    console.log("Paray Zyada:", paray_zyada_num);
    console.log("Peshaky Payment:", peshaky_payment_num);

    // Calculate the total price for the installments
    const total_after_extra = product_price + paray_zyada_num;
    const total_prices = total_after_extra - peshaky_payment_num;

    // Log the calculated values
    console.log("Calculated total_after_extra:", total_after_extra);
    console.log("Calculated total_prices:", total_prices);

    // Ensure total_price is a valid number
    if (isNaN(total_prices) || total_prices <= 0) {
      return res.status(400).json({ msg: "Invalid total price calculation" });
    }

    // Create a new installment sale record with total_pricess and product_price
    const newInstallmentSale = await InstallmentSalesModel.create({
      product_id,
      quantity,
      peshaky_payment: peshaky_payment_num,
      paray_mawa: total_prices,
      qty_qist,
      total_qistakan,
      paray_zyada: paray_zyada_num,
      qisty_mawa,
      date,
      final_date,
      status,
      product_price, // Save the product price
      total_price: total_after_extra, // Pass the calculated total_price here
      customer_name,
      customer_phoneNo,
      customer_address,
      user_id: req.userId, // Assuming user_id is stored in req.userId
    });

    // Return success response with the created record
    res.status(201).json({
      msg: "Installment Sale created successfully!",
      data: newInstallmentSale,
    });
  } catch (error) {
    console.error("Error creating installment sale:", error);
    res
      .status(500)
      .json({ msg: "Error creating installment sale", error: error.message });
  }
};

// Controller to Deduct Payment and Update Installment Sale
export const MakeInstallmentPayment = async (req, res) => {
  const { sale_id, payment_amount } = req.body;

  if (!sale_id) {
    return res.status(400).json({ msg: "sale_id is required!" });
  }
  if (!payment_amount || payment_amount <= 0) {
    return res.status(400).json({ msg: "valid payment_amount is required!" });
  }

  try {
    // Find the installment sale record
    const installmentSale = await InstallmentSalesModel.findOne({
      where: { id: sale_id },
    });

    if (!installmentSale) {
      return res.status(404).json({ msg: "Installment Sale not found!" });
    }

    // Check if the payment amount is greater than the remaining balance
    if (payment_amount > installmentSale.paray_mawa) {
      return res
        .status(400)
        .json({ msg: "Payment amount exceeds remaining balance!" });
    }

    // Deduct the payment from the remaining balance
    const updatedRemainingBalance = installmentSale.paray_mawa - payment_amount;

    // Decrease the number of remaining installments by 1
    const updatedRemainingInstallments = installmentSale.qty_qist - 1;

    // Update the installment sale record
    const updatedInstallmentSale = await installmentSale.update({
      paray_mawa: updatedRemainingBalance,
      qty_qist: updatedRemainingInstallments,
    });

    // If the remaining installments are 0, set the status to "Paid"
    if (updatedRemainingInstallments === 0) {
      await updatedInstallmentSale.update({ status: "پارەی دا" });
    }

    // Return success response with the updated record
    res.status(200).json({
      msg: "Payment applied successfully!",
      data: updatedInstallmentSale,
    });
  } catch (error) {
    console.error("Error making installment payment:", error);
    res
      .status(500)
      .json({ msg: "Error making installment payment", error: error.message });
  }
};

export const deletePaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const getPayment = await InstallmentSalesModel.findOne({
      where: { id },
    });

    if (!getPayment) {
      return res.status(404).json({ msg: `No data found with thid ID: ${id}` });
    }

    await InstallmentSalesModel.destroy({ where: { id } });

    res
      .status(200)
      .json({ msg: `Installment Sales Deleted With This ID: ${id}` });
  } catch (error) {
    console.error("Error fetching Installment Sales:", error); // Log the error for debugging
    res
      .status(500)
      .json({ msg: "Error retrieving data", error: error.message });
  }
};
