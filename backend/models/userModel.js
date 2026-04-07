import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["customer", "salonOwner", "admin", "superAdmin", "contentAdmin", "artist"],
    default: "customer"
  },
  phone: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: ""
  },
  avatar: {
    type: String,
    default: ""
  },
  // For artists: which salon they belong to
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon",
    default: null
  },
  specialization: {
    type: String,
    default: "Beauty Expert"
  },
  portfolio: {
    type: [String],
    default: []
  },
  totalWorkDone: {
    type: Number,
    default: 0
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  totalPointsEarned: {
    type: Number,
    default: 0
  },
  loyaltyTier: {
    type: String,
    enum: ["Bronze", "Silver", "Gold"],
    default: "Bronze"
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);