import express from "express";
const router = express.Router();
import { verifyUser, adminOnly } from "../Middleware/authUser.js";
import {
  getAllSales,
  getSaleById,
  getTotalSales,
  getTotalSaleForYear,
  getTotalProfit,
  getTotalSalesMonths,
} from "../Controller/sale.controller.js";

router.get("/sale", verifyUser, getAllSales);
router.get("/sale/total", verifyUser, getTotalSalesMonths);
router.get("/total_sale", verifyUser, getTotalSales);
router.get("/total_profit", verifyUser, getTotalProfit);
router.get("/year_sale/:year", verifyUser, getTotalSaleForYear);
router.get("/sale/:id", verifyUser, adminOnly, getSaleById);

export default router;
