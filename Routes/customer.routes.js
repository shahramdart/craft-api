import express from "express";
const router = express.Router();
import { verifyUser, adminOnly } from "../Middleware/authUser.js";
import {
createCustomer
} from "../Controller/customer.controller.js";

// router.get("/brands", verifyUser, getAllBrands); 
router.post("/customer", verifyUser, adminOnly, createCustomer);

export default router;
