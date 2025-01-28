import express from "express";
const router = express.Router();
import { verifyUser, adminOnly } from "../Middleware/authUser.js";
import {
  getAllProduct,
  getProductById,
  addProduct,
  updateProductById,
  deleteProductById,
  getTotalProductQuantity,
  getProductByQrCode
} from "../Controller/products.controller.js";

router.get("/product", verifyUser, getAllProduct);
router.get("/total_product", verifyUser, getTotalProductQuantity);
router.get("/product/:id", verifyUser, getProductById);
router.get("/product/qrcode/:qrcode", verifyUser, getProductByQrCode);
router.post("/product", verifyUser, adminOnly, addProduct);
router.put("/product/:id", verifyUser, adminOnly, updateProductById);
router.delete("/product/:id", verifyUser, deleteProductById);

export default router;
