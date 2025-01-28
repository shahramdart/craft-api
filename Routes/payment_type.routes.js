import express from "express";
const router = express.Router();
import { verifyUser, adminOnly } from "../Middleware/authUser.js";
import {
  getAllPaymentType,
  SaleMonthlyProducts,
  MakeInstallmentPayment,
  getPaymentById,
  deletePaymentById,
} from "../Controller/monthly.controller.js";

router.get("/payment", verifyUser, adminOnly, getAllPaymentType);
router.get("/payment/:id", verifyUser, adminOnly, getPaymentById);
router.put("/payment/:id", verifyUser, adminOnly, MakeInstallmentPayment);
router.post("/payment", verifyUser, adminOnly, SaleMonthlyProducts);
router.delete("/payment/:id", verifyUser, adminOnly, deletePaymentById);

export default router;
