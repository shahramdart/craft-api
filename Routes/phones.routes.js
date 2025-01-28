import express from "express";
const router = express.Router();
import { verifyUser, adminOnly } from "../Middleware/authUser.js";
import {
  addPhones,
  getAllPhones,
  updatePhones,
  getPhonesById,
  deleteBrandById,
} from "../Controller/phones_controller.js";

router.get("/phone", verifyUser, getAllPhones);
router.get("/phone/:id", verifyUser, getPhonesById);
router.delete("/phone/:id", verifyUser, deleteBrandById);
router.put("/phone/:id", verifyUser, updatePhones);
router.post("/phone", verifyUser, addPhones);

export default router;
