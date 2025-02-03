import express from "express";
const router = express.Router();
import { verifyUser, adminOnly } from "../Middleware/authUser.js";
import {
  getAllInvoice,
  getInvoiceById,
  addInvoice,
  getSalesByCustomerName,
} from "../Controller/invoice.controller.js";

router.get("/invoice", verifyUser, getAllInvoice);
router.get("/invoice/:customerName", verifyUser, getSalesByCustomerName);
router.get("/invoices/:id", verifyUser, getInvoiceById); 
router.post("/invoice", verifyUser, addInvoice);

export default router;
