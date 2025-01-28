import express from "express";
const router = express.Router();
import { verifyUser, adminOnly } from "../Middleware/authUser.js";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getTotalUsersCount,
} from "../Controller/user.controller.js";

router.get("/users", verifyUser, adminOnly, getUsers);
router.get("/all_users", verifyUser, adminOnly, getTotalUsersCount);
router.get("/users/:id", verifyUser, adminOnly, getUserById);
router.post("/users", verifyUser, adminOnly, createUser);
router.put("/users/:id", verifyUser, adminOnly, updateUser);
router.delete("/users/:id", verifyUser, adminOnly, deleteUser);

export default router;
