import Review from "../models/reviewModel.js";
import Booking from "../models/bookingModel.js";
import Salon from "../models/salonModel.js";

import mongoose from "mongoose";

// Helper: Recalculate average rating
const updateSalonRating = async (salonId) => {
  const stats = await Review.aggregate([
    { $match: { salon: new mongoose.Types.ObjectId(salonId) } },
    { $group: { _id: "$salon", avgRating: { $avg: "$rating" }, total: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    await Salon.findByIdAndUpdate(salonId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].total
    });
  } else {
    await Salon.findByIdAndUpdate(salonId, { averageRating: 0, totalReviews: 0 });
  }
};

// ─── CUSTOMER CREATES REVIEW ────────────────────────────────────────────────
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ success: false, message: "Valid rating (1-5) is required." });
    
    if (!comment || comment.trim() === "")
      return res.status(400).json({ success: false, message: "Comment is required." });

    // Verify the booking
    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found." });

    if (String(booking.user) !== String(req.user._id))
      return res.status(403).json({ success: false, message: "Unauthorized. This is not your booking." });

    if (booking.status !== "completed")
      return res.status(400).json({ success: false, message: "You can only review a completed service." });

    if (booking.isReviewed)
      return res.status(400).json({ success: false, message: "You have already reviewed this booking." });

    // Create the review
    const review = await Review.create({
      user: req.user._id,
      salon: booking.salon,
      artist: booking.artist || null,
      booking: booking._id,
      rating: Number(rating),
      comment: comment.trim()
    });

    // Mark booking as reviewed
    booking.isReviewed = true;
    await booking.save();

    // Recalculate Salon Rating
    await updateSalonRating(booking.salon);

    res.status(201).json({ success: true, review, message: "Review posted successfully!" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Review already exists for this booking." });
    }
    console.error("createReview error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── SALON OWNER REPLIES ────────────────────────────────────────────────────
export const replyToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerReply } = req.body;

    if (!ownerReply || ownerReply.trim() === "")
      return res.status(400).json({ success: false, message: "Reply cannot be empty." });

    const review = await Review.findById(id).populate("salon");
    if (!review)
      return res.status(404).json({ success: false, message: "Review not found." });

    // Verify ownership
    if (String(review.salon.owner) !== String(req.user._id) && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Only the Salon Owner can reply to this review." });

    review.ownerReply = ownerReply.trim();
    await review.save();

    res.json({ success: true, review, message: "Reply posted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET PUBLIC REVIEWS FOR SALON ───────────────────────────────────────────
export const getSalonReviews = async (req, res) => {
  try {
    const { salonId } = req.params;

    const reviews = await Review.find({ salon: salonId })
      .populate("user", "name avatar")
      .populate("artist", "name avatar")
      .sort({ createdAt: -1 })
      .limit(50); // Hard limit for display

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET DASHBOARD REVIEWS (Salon Owner) ────────────────────────────────────
export const getDashboardReviews = async (req, res) => {
  try {
    const salon = await Salon.findOne({ owner: req.user._id });
    if (!salon)
      return res.status(404).json({ success: false, message: "You don't have a salon yet." });

    const reviews = await Review.find({ salon: salon._id })
      .populate("user", "name email")
      .populate("artist", "name")
      .populate("booking", "serviceName date timeSlot")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
