import BrandsModel from "../Models/brands.model.js";

// ? Get all brands
export const getAllBrands = async (req, res) => {
  try {
    // Await the promise to get the actual data
    const getBrands = await BrandsModel.findAll();

    // Check if the result is empty
    if (getBrands.length === 0) {
      return res.status(404).json({ msg: "No data found" });
    }

    // Return the data if it's found
    res.status(200).json(getBrands);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error retrieving data", error: error.message });
  }
};

// ? Get Brand by id
export const getBrandById = async (req, res) => {
  try {
    const brand = await BrandsModel.findOne({ where: { id: req.params.id } });
    if (!brand) {
      return res
        .status(404)
        .json({ msg: `No Brand Found With This ID: ${req.params.id}` });
    }

    res.status(200).json(brand);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error Getting Brand By Id", error: error.message });
  }
};

// ? Add new brands
export const addBrands = async (req, res) => {
  const { brand_name } = req.body;

  if (!brand_name) {
    return res.status(400).json({ msg: `${brand_name} is required!` });
  }

  try {
    const newBrands = await BrandsModel.create({
      brand_name,
      user_id: req.userId, //? Automatically id aw usera denetawa ka login bwa
    });

    res.status(201).json({
      msg: "Category created successfully",
      data: newBrands,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error inserting data", error: error.message });
  }
};

// ? update brand by id
export const updateBrands = async (req, res) => {
  const { id } = req.params;
  const { brand_name } = req.body;

  if (!brand_name) {
    return res.status(400).json({ msg: `${brand_name} is required!` });
  }
  const getBrand = await BrandsModel.findOne({ where: { id } });
  if (!getBrand) {
    return res.status(404).json({ msg: "No Brand found with this ID!" });
  }

  try {
    await BrandsModel.update({ brand_name }, { where: { id } });

    const updatedBrand = await BrandsModel.findOne({ where: { id } });

    res
      .status(200)
      .json({ msg: "Brand updated successfully", data: updatedBrand });
  } catch (error) {
    res.status(500).json({ msg: "Error updating data", error: error.message });
  }
};

// ? delete Brand by id
export const deleteBrandById = async (req, res) => {
  const { id } = req.params;
  const brand = await BrandsModel.findOne({ where: { id } });
  if (!brand) {
    return res.status(404).json({ msg: `No Brand Found With This ID: ${id}` });
  }
  try {
    await BrandsModel.destroy({ where: { id } });
    res.status(200).json({ msg: `Brand Deleted With This ID: ${id}` });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error Deleting Brand By Id", error: error.message });
  }
};
