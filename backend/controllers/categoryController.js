import categoryModel from "../models/categoryModel.js";
import { v2 as cloudinary } from "cloudinary";

// ✅ Add Category
export async function addCategory(req, res) {
  try {
    const { name, type } = req.body;
    const imageFile = req.file;

    if (!name || !imageFile) {
      return res.json({
        success: false,
        message: "Name and Image are required",
      });
    }

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    const category = new categoryModel({
      name,
      type: type || "gift",
      image: imageUpload.secure_url,
    });

    await category.save();
    res.json({ success: true, message: "Category Added" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

// ✅ List Categories
export async function listCategories(req, res) {
  try {
    const categories = await categoryModel.find({});
    res.json({ success: true, categories });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

// ✅ Remove Category
export async function removeCategory(req, res) {
  try {
    await categoryModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Category Removed" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}
