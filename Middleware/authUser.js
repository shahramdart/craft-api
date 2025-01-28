import User from "../Models/user.model.js"; // Correct path
import PermissionModel from "../Models/permission.model.js"; // Correct path
export const verifyUser = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    const user = await User.findOne({
      where: { id: req.session.userId },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    req.userId = user.id;
    req.permission_id = user.permission_id; // Attach permission ID to request

    next(); // Proceed to the next middleware
  } catch (error) {
    console.error("Error in verifyUser middleware:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

export const adminOnly = async (req, res, next) => {
  try {
    const permissionRecord = await PermissionModel.findOne({
      where: { id: req.permission_id },
    });

    if (!permissionRecord || permissionRecord.permissions !== "Admin") {
      return res.status(403).json({
        msg: "Access denied: Only admins are authorized to delete users!",
      });
    }

    next(); // Proceed to the deleteUser controller
  } catch (error) {
    console.error("Error in adminOnly middleware:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
