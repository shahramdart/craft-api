import PaymentTypeModel from "../Models/payment_type.model.js";

// ? Get all payment
export const getAllPayment = async (req, res) => {
  try {
    // Await the promise to get the actual data
    const getPayment = await PaymentTypeModel.findAll();

    // Check if the result is empty
    if (getPayment.length === 0) {
      return res.status(404).json({ msg: "No data found" });
    }

    // Return the data if it's found
    res.status(200).json(getPayment);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error retrieving data", error: error.message });
  }
};

// ? Get payment by id
export const getPaymentById = async (req, res) => {
  try {
    const payment = await PaymentTypeModel.findOne({
      where: { id: req.params.id },
    });
    if (!payment) {
      return res
        .status(404)
        .json({ msg: `No payment Found With This ID: ${req.params.id}` });
    }

    res.status(200).json(payment);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error Getting payment By Id", error: error.message });
  }
};

// ? Add new payment
export const addPayment = async (req, res) => {
  const { payment_method } = req.body;

  if (!payment_method) {
    return res.status(400).json({ msg: `${payment_method} is required!` });
  }

  try {
    const newPayment = await PaymentTypeModel.create({
      payment_method,
      user_id: req.userId, //? Automatically id aw usera denetawa ka login bwa
    });

    res.status(201).json({
      msg: "Payment created successfully",
      data: newPayment,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error inserting data", error: error.message });
  }
};

// ? update payment by id
export const updatePayment = async (req, res) => {
  const { id } = req.params;
  const { payment_method } = req.body;

  if (!payment_method) {
    return res.status(400).json({ msg: `${payment_method} is required!` });
  }
  const getPayment = await PaymentTypeModel.findOne({ where: { id } });
  if (!getPayment) {
    return res.status(404).json({ msg: "No payment found with this ID!" });
  }

  try {
    await PaymentTypeModel.update({ payment_method }, { where: { id } });

    const updatedPayment = await PaymentTypeModel.findOne({ where: { id } });

    res
      .status(200)
      .json({ msg: "payment updated successfully", data: updatedPayment });
  } catch (error) {
    res.status(500).json({ msg: "Error updating data", error: error.message });
  }
};

// ? delete payment by id
export const deletePaymentById = async (req, res) => {
  const { id } = req.params;
  const payment = await PaymentTypeModel.findOne({ where: { id } });
  if (!payment) {
    return res
      .status(404)
      .json({ msg: `No payment Found With This ID: ${id}` });
  }
  try {
    await PaymentTypeModel.destroy({ where: { id } });
    res.status(200).json({ msg: `payment Deleted With This ID: ${id}` });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error Deleting payment By Id", error: error.message });
  }
};
