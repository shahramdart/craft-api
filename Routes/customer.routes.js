import express from "express";
const router = express.Router();
import { verifyUser, adminOnly } from "../Middleware/authUser.js";
import {
  createCustomer,
  getSalesByCustomerName,
  getSalesByCustomerId,
  getAllCustomers,
} from "../Controller/customer.controller.js";

router.get("/customer", verifyUser, getAllCustomers);
router.get("/customers/:id", verifyUser, getSalesByCustomerId);
router.get("/customer/:customerName", verifyUser, getSalesByCustomerName);
router.post("/customer", verifyUser, adminOnly, createCustomer);

export default router;
