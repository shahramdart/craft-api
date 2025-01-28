import express from "express";
const router = express.Router();
import { verifyUser, adminOnly } from "../Middleware/authUser.js";
import {
  getAllProductCategories,
  updateProductCategories,
  getProductCategoriesById,
  deleteProductCategories,
  addProductCategories,
} from "../Controller/category.controller.js";

router.get("/categories", verifyUser, getAllProductCategories);
router.get("/categories/:id", verifyUser, getProductCategoriesById);
router.delete(
  "/categories/:id",
  verifyUser,
  adminOnly,
  deleteProductCategories
);
router.put("/categories/:id", verifyUser, adminOnly, updateProductCategories);
router.post("/categories", verifyUser, adminOnly, addProductCategories);

export default router;
