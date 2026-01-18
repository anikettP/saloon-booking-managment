import manualReviewModel from "../models/manualReviewModel.js";
import { v2 as cloudinary } from "cloudinary";

// Add Review (Admin Only)
export const addManualReview = async (req, res) => {
  try {
    const { userName, rating, comment } = req.body;
    
    // We expect two files: 'userImage' and 'productImage'
    const userImageFile = req.files['userImage'] ? req.files['userImage'][0] : null;
    const productImageFile = req.files['productImage'] ? req.files['productImage'][0] : null;

    if (!userImageFile || !productImageFile) {
      return res.json({ success: false, message: "Both User Image and Product Image are required" });
    }

    // Upload to Cloudinary
    const userImgUpload = await cloudinary.uploader.upload(userImageFile.path, { resource_type: "image" });
    const productImgUpload = await cloudinary.uploader.upload(productImageFile.path, { resource_type: "image" });

    const review = new manualReviewModel({
      userName,
      rating: Number(rating),
      comment,
      userImage: userImgUpload.secure_url,
      productImage: productImgUpload.secure_url,
    });

    await review.save();
    res.json({ success: true, message: "Testimonial Added" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// List Reviews (Public)
export const listManualReviews = async (req, res) => {
  try {
    const reviews = await manualReviewModel.find({}).sort({ date: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Delete Review (Admin Only)
export const removeManualReview = async (req, res) => {
  try {
    await manualReviewModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Testimonial Removed" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};