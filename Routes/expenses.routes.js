import express from "express";
const router = express.Router();
import { verifyUser, adminOnly } from "../Middleware/authUser.js";
import {
  getTotalExpenses,
  getAllExpenses,
  getTotalExpensesMonths,
} from "../Controller/expenses.controller.js";

router.get("/expenses", verifyUser, adminOnly, getAllExpenses);
router.get("/expenses/total", verifyUser, adminOnly, getTotalExpensesMonths);
router.get("/total_expenses/", verifyUser, adminOnly, getTotalExpenses);

export default router;
