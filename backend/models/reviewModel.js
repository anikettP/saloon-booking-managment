// backend/models/reviewModel.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },

    // logged-in user who wrote the review
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      default: "",
      trim: true,
    },

    // cached user info for easy display (optional)
    userName: {
      type: String,
      default: "",
      trim: true,
    },
    userEmail: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// each user can review each product only once
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const reviewModel =
  mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel;
