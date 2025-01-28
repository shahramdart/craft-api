import PermissionModels from "../Models/permission.model.js";

// ? get all permissions
export const getAllPermission = async (req, res) => {
  try {
    // Await the promise to get the actual data
    const getPermission = await PermissionModels.findAll();

    // Check if the result is empty
    if (getPermission.length === 0) {
      return res.status(404).json({ msg: "No data found" });
    }

    // Return the data if it's found
    res.status(200).json(getPermission);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error retrieving data", error: error.message });
  }
};

// ? get  permissions by id
export const getPermissionById = async (permissionName) => {
  try {
    const permission = await PermissionModels.findOne({
      where: { permissions: permissionName }, // Search for permission by name
    });

    if (!permission) {
      throw new Error("Invalid permission value!");
    }

    return permission;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ? Add new permissions
export const addPermission = async (req, res) => {
  const { permissions } = req.body;

  if (!permissions) {
    return res.status(400).json({ msg: "permissions is required" });
  }

  try {
    const newPermission = await PermissionModels.create({ permissions });

    res
      .status(201)
      .json({ msg: "Permission added successfully", data: newPermission });
  } catch (error) {
    res.status(500).json({ msg: "Error Adding data", error: error.message });
  }
};
