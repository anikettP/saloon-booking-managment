import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    default: "General",
    // e.g. Hair, Spa, Nails, Makeup, Beard, Skincare
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    default: 60 // in minutes
  },
  image: {
    type: String,
    default: ""
  },
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon",
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  currentWaitTime: {
    type: Number,
    default: 0 // In minutes. Indicates live walk-in queue delay for this specific service.
  }
}, { timestamps: true });

export default mongoose.model("Service", serviceSchema);