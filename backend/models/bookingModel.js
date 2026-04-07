import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
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
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
    // e.g. "10:00 AM - 11:00 AM"
  },
  // Snapshot of price at time of booking
  price: {
    type: Number,
    default: 0
  },
  // Snapshot of service name at time of booking
  serviceName: {
    type: String,
    default: ""
  },
  customerName: {
    type: String,
    default: ""
  },
  customerPhone: {
    type: String,
    default: ""
  },
  notes: {
    type: String,
    default: ""
  },
  artistMessage: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["payment_pending", "pending", "confirmed", "completed", "cancelled"],
    default: "pending"
  },
  paymentStatus: {
    type: String,
    enum: ["payment_pending", "pending", "paid", "failed", "refunded"],
    default: "pending"
  },
  paymentMethod: {
    type: String,
    enum: ["Online", "At Salon"],
    default: "At Salon"
  },
  razorpayOrderId: {
    type: String,
    default: ""
  },
  razorpayPaymentId: {
    type: String,
    default: ""
  },
  isReviewed: {
    type: Boolean,
    default: false
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  pointsRedeemed: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Index to prevent double booking: same artist, same salon, same date+slot
bookingSchema.index({ salon: 1, artist: 1, date: 1, timeSlot: 1 }, { unique: false });

export default mongoose.model("Booking", bookingSchema);