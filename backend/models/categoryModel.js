import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, // Cloudinary URL
  type: { type: String, default: "gift" }, // 'gift', 'festive', 'category'
  date: { type: Number, default: Date.now },
});

const categoryModel =
  mongoose.models.category || mongoose.model("category", categorySchema);

export default categoryModel;
