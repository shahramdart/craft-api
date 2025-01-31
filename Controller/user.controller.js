import argon2 from "argon2";
import User from "../Models/user.model.js";
import PermissionModel from "../Models/permission.model.js";
import { Op } from "sequelize"; // Add this line at the top of your file

//? Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email"],
      include: [
        {
          model: PermissionModel,
          as: "permission",
          attributes: ["permissions"], // Adjust to your permission name column
        },
      ],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching users", error: error.message });
  }
};

export const getTotalUsersCount = async (req, res) => {
  try {
    // Count the number of users in the users table
    const totalUsers = await User.count();

    if (totalUsers === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({ totalUsers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

//? Get user by ID
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      where: { id }, // Assumes "id" is the column name as in Knex
    });

    if (!user) {
      return res.status(404).json({ msg: "No user registered with this id" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error retrieving data", error: error.message });
  }
};

//? Insert a new user
export const createUser = async (req, res) => {
  const { name, email, password, user_phone, permission } = req.body;

  // Check if all required fields are provided
  if (!name) {
    return res.status(400).json({ msg: "name is required!" });
  } else if (!email) {
    return res.status(400).json({ msg: "email is required!" });
  } else if (!password) {
    return res.status(400).json({ msg: "password is required!" });
  } else if (!permission) {
    return res.status(400).json({ msg: "permission is required!" });
  } else if (!user_phone) {
    return res.status(400).json({ msg: "user_phone is required!" });
  }

  // Check if email already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ msg: "Email already in use" });
  }

  // Lookup permission (assuming you have a Permission model)
  const permissionRecord = await PermissionModel.findOne({
    where: { permissions: permission }, // Corrected from `permission` to `permissions`
  });
  if (!permissionRecord) {
    return res.status(400).json({ msg: "Invalid permission value!" });
  }

  // Hash password
  let hashedPassword;
  try {
    hashedPassword = await argon2.hash(password); // Ensure hashing is done in a try-catch for error handling
  } catch (hashError) {
    return res
      .status(500)
      .json({ msg: "Error hashing password", error: hashError.message });
  }

  try {
    // Insert the new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      user_phone,
      permission_id: permissionRecord.id, // Assuming your User model has this foreign key
    });

    // Return the new user object excluding sensitive data like password
    res.status(201).json({
      msg: "User inserted successfully",
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        user_phone: newUser.user_phone,
        permission_id: newUser.permission_id,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Error inserting data", error: error.message });
  }
};

//? Update user by ID
export const updateUser = async (req, res) => {
  const { id } = req.params; // Get the user ID from the request params
  const { name, email, user_phone, permission, password } = req.body;

  // Ensure that at least one field is provided for update
  if (!email && !name && !user_phone && !permission && !password) {
    return res
      .status(400)
      .json({ msg: "At least one field must be provided for update!" });
  }

  // Check if the user exists
  const existingUser = await User.findOne({ where: { id } });
  if (!existingUser) {
    return res.status(404).json({ msg: "User not found!" });
  }

  // Check if email already exists (but not for the current user's email)
  if (email && email !== existingUser.email) {
    const emailCheck = await User.findOne({
      where: { email, id: { [Op.ne]: id } },
    });
    if (emailCheck) {
      return res.status(400).json({ msg: "Email already in use" });
    }
  }

  // Lookup the permission record if permission is provided
  let permissionId = existingUser.permission_id;
  if (permission) {
    const permissionRecord = await PermissionModel.findOne({
      where: { permissions: permission },
    });
    if (!permissionRecord) {
      return res.status(400).json({ msg: "Invalid permission value!" });
    }
    permissionId = permissionRecord.id;
  }

  // Hash new password if it's provided
  let hashedPassword = existingUser.password; // Keep the current password if no new one is provided
  if (password) {
    try {
      hashedPassword = await argon2.hash(password); // Hash the new password
    } catch (hashError) {
      return res
        .status(500)
        .json({ msg: "Error hashing password", error: hashError.message });
    }
  }

  try {
    // Update the user information
    await User.update(
      {
        name: name || existingUser.name, // Only update if a new name is provided
        email: email || existingUser.email, // Only update if a new email is provided
        user_phone: user_phone || existingUser.user_phone, // Only update if a new phone number is provided
        permission_id: permissionId, // Update only if a new permission is provided
        password: hashedPassword, // Update password only if a new password is provided
      },
      {
        where: { id },
      }
    );

    // Return the updated user object excluding sensitive data like password
    res.status(200).json({
      msg: "User updated successfully",
      data: {
        id,
        name: name || existingUser.name,
        email: email || existingUser.email,
        user_phone: user_phone || existingUser.user_phone,
        permission_id: permissionId,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error updating user data", error: error.message });
  }
};

//? Delete user by ID
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findOne({ where: { id } });

    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    await User.destroy({ where: { id } });
    res.status(200).json({ msg: `User with ID ${id} successfully deleted.` });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ msg: "Error deleting user", error: error.message });
  }
};
