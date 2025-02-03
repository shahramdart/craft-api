import CustomerModel from "../Models/customer.model.js";

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
