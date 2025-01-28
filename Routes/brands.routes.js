import express from "express";
const router = express.Router();
import { verifyUser, adminOnly } from "../Middleware/authUser.js";
import {
  addBrands,
  getAllBrands,
  updateBrands,
  getBrandById,
  deleteBrandById,
} from "../Controller/brands.controller.js";

router.get("/brands", verifyUser, getAllBrands);
router.get("/brands/:id", verifyUser, getBrandById);
router.delete("/brands/:id", verifyUser, adminOnly, deleteBrandById);
router.put("/brands/:id", verifyUser, adminOnly, updateBrands);
router.post("/brands", verifyUser, adminOnly, addBrands);

export default router;
