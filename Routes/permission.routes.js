import express from "express";
const router = express.Router();
// import { verifyUser, adminOnly } from "../Middleware/authUser.js";
import {
  getAllPermission,
  addPermission,
  getPermissionById,
} from "../Controller/permission.controller.js";

router.get("/permission", getAllPermission);
router.get("/permission/:permissions", getPermissionById);
router.post("/permission", addPermission);

export default router;
