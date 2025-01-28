import express from "express";
const router = express.Router();
import { verifyUser, adminOnly } from "../Middleware/authUser.js";
import {
  getTotalExpenses,
  getAllExpenses,
} from "../Controller/expenses.controller.js";

router.get("/expenses", verifyUser, adminOnly, getAllExpenses);
// router.get("/total_sale", verifyUser, adminOnly, getTotalSales);
router.get("/total_expenses/", verifyUser, adminOnly, getTotalExpenses);

export default router;
