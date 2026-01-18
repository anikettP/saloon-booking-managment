import mongoose from "mongoose";

const manualReviewSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userImage: { type: String, required: true },    // Customer's profile pic
  productImage: { type: String, required: true }, // Photo of what they received
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Number, default: Date.now }
});

const manualReviewModel = mongoose.models.manualReview || mongoose.model("manualReview", manualReviewSchema);

export default manualReviewModel;