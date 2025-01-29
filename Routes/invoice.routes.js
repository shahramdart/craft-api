import express from "express";
const router = express.Router();
import { verifyUser, adminOnly } from "../Middleware/authUser.js";
import {
  getAllInvoice,
  getInvoiceById,
  addInvoice,
} from "../Controller/invoice.controller.js";

router.get("/invoice", getAllInvoice);
router.get("/invoice/:id", verifyUser, getInvoiceById);
router.post("/invoice", verifyUser, addInvoice);

export default router;
