import mongoose from "mongoose";

const salonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: ""
  },
  city: {
    type: String,
    default: ""
  },
  mapLink: {
    type: String,
    default: "" // Google/Apple Maps Precise Link
  },
  state: {
    type: String,
    default: ""
  },
  pincode: {
    type: String,
    default: ""
  },
  phone: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    default: ""
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  artists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  categories: [
    {
      type: String // e.g. "Hair", "Spa", "Nails", "Makeup"
    }
  ],

  images: [
    {
      type: String // Cloudinary URLs
    }
  ],
  bannerImage: {
    type: String,
    default: ""
  },

  // Time slots offered by this salon
  workingHours: {
    start: { type: String, default: "09:00" }, // "09:00"
    end: { type: String, default: "20:00" }    // "20:00"
  },
  slotDuration: {
    type: Number,
    default: 60 // minutes
  },
  workingDays: {
    type: [String],
    default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  },

  approved: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Registration Payment Tracking
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  razorpayOrderId: {
    type: String,
    default: ""
  },
  razorpayPaymentId: {
    type: String,
    default: ""
  },
  cancellationWindow: {
    type: Number,
    default: 2 // hours before appointment
  }
}, { timestamps: true });

export default mongoose.model("Salon", salonSchema);