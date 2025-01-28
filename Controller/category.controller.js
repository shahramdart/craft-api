import CategoryModel from "../Models/category.model.js";

// ? Get all brands
export const getAllProductCategories = async (req, res) => {
  try {
    const getProductCate = await CategoryModel.findAll({
      attributes: ["id", "category_name"], // Use 'id' instead of 'category_id'
    });

    if (getProductCate.length === 0) {
      return res.status(404).json({ msg: "No data found" });
    }

    res.status(200).json(getProductCate);
  } catch (error) {
    console.error("Error fetching product categories:", error); // Log the error for debugging
    res
      .status(500)
      .json({ msg: "Error retrieving data", error: error.message });
  }
};

// ? Get Brand by id
export const getProductCategoriesById = async (req, res) => {
  try {
    const productCate = await CategoryModel.findOne({
      attributes: ["id", "category_name", "user_id", "createdAt", "updatedAt"], // No 'category_id' here
      where: { id: req.params.id },
    });
    if (!productCate) {
      return res
        .status(404)
        .json({ msg: `No productCate Found With This ID: ${req.params.id}` });
    }

    res.status(200).json(productCate);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error Getting Category By Id", error: error.message });
  }
};

// ? Add new brands
export const addProductCategories = async (req, res) => {
  const { category_name } = req.body;

  if (!category_name) {
    return res.status(400).json({ msg: `${category_name} is required!` });
  }

  try {
    const newProductCate = await CategoryModel.create({
      category_name,
      user_id: req.userId, //? Automatically id aw usera denetawa ka login bwa
    });

    res.status(201).json({
      msg: "Category created successfully",
      data: newProductCate,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error inserting data", error: error.message });
  }
};

// ? update brand by id
export const updateProductCategories = async (req, res) => {
  const { id } = req.params;
  const { category_name } = req.body;

  if (!category_name) {
    return res.status(400).json({ msg: `${category_name} is required!` });
  }
  const getProductCate = await CategoryModel.findOne({ where: { id } });
  if (!getProductCate) {
    return res.status(404).json({ msg: "No office found with this ID!" });
  }

  try {
    await CategoryModel.update({ category_name }, { where: { id } });

    const updatedProductCate = await CategoryModel.findOne({
      where: { id },
    });

    res
      .status(200)
      .json({ msg: "Brand updated successfully", data: updatedProductCate });
  } catch (error) {
    res.status(500).json({ msg: "Error updating data", error: error.message });
  }
};

// ? delete Brand by id
export const deleteProductCategories = async (req, res) => {
  const { id } = req.params;
  const productCate = await CategoryModel.findOne({ where: { id } });
  if (!productCate) {
    return res
      .status(404)
      .json({ msg: `No product categories Found With This ID: ${id}` });
  }
  try {
    await CategoryModel.destroy({ where: { id } });
    res
      .status(200)
      .json({ msg: `Product Categories Deleted With This ID: ${id}` });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error Deleting Brand By Id", error: error.message });
  }
};
