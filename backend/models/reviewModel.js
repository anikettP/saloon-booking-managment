import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon",
    required: true
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  ownerReply: {
    type: String,
    default: "",
    trim: true,
    maxlength: 1000
  }
}, { timestamps: true });

// Ensure a user can only review a specific booking once
reviewSchema.index({ booking: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
