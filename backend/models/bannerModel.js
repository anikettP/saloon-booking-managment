import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    default: ""
  },
  subtitle: {
    type: String,
    default: ""
  },
  imageUrl: { type: String }, // General/Fallback
  imageDesktop: { type: String }, // Premium Desktop High-Res
  imageMobile: { type: String },  // Optimized Mobile Portrait
  linkUrl: {
    type: String,
    default: "/salons"
  },
  ctaText: {
    type: String,
    default: "Book Now"
  },
  type: {
    type: String,
    enum: ["hero", "promo", "poster", "marquee"],
    default: "hero"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model("Banner", bannerSchema);
