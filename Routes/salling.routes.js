import express from "express";
const router = express.Router();
import { verifyUser, adminOnly } from "../Middleware/authUser.js";
import {
  getAllSalling,
  getSallingById,
  addSalling,
  
} from "../Controller/salling.controller.js";

router.get("/salling", verifyUser, getAllSalling);
router.get("/salling/:id", verifyUser, getSallingById);
router.post("/salling", addSalling);

export default router;
