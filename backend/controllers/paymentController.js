// backend/controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import Salon from "../models/salonModel.js";
import { sendBookingConfirmation } from "../services/emailService.js";

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Fixed fee for registering a salon (INR)
const REGISTRATION_FEE_INR = 1;

// 1. INITIATE REGISTRATION AND CREATE RAZORPAY ORDER
export const initiateSalonRegistration = async (req, res) => {
  try {
    const { name, location, categories, description } = req.body;
    const userId = req.user._id;

    console.log("Razorpay Key Status:", {
      idPresent: !!process.env.RAZORPAY_KEY_ID,
      secretPresent: !!process.env.RAZORPAY_KEY_SECRET,
      keyPrefix: process.env.RAZORPAY_KEY_ID?.substring(0, 9)
    });

    if (!name || !location || !categories) {
      return res.status(400).json({ success: false, message: "Name, Location, and Categories are strictly mandatory." });
    }

    // Always create in Pending status initially
    const newSalon = new Salon({
      name,
      location,
      categories,
      description: description || "",
      owner: userId,
      paymentStatus: "pending",
      approved: false
    });

    const savedSalon = await newSalon.save();

    // Create Razorpay order
    const options = {
      amount: REGISTRATION_FEE_INR * 100, // paise
      currency: "INR",
      receipt: `receipt_salon_${savedSalon._id}`,
      payment_capture: 1, // Auto capture
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      // Cleanup if failed
      await Salon.findByIdAndDelete(savedSalon._id);
      console.error("Razorpay Order creation returned null/undefined.");
      return res.status(500).json({ success: false, message: "Razorpay Order creation failed." });
    }

    // Attach Provider Order ID to DB securely
    savedSalon.razorpayOrderId = order.id;
    await savedSalon.save();

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      salonId: savedSalon._id
    });

  } catch (error) {
    console.error("Init Registration Error Details:", {
      status: error.statusCode,
      errorBody: error.error || error,
      stack: error.stack
    });
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. VERIFY SIGNATURE AND MARK AS PAID
export const verifySalonRegistration = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, salonId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !salonId) {
      return res.status(400).json({ success: false, message: "Missing Razorpay verification parameters." });
    }

    const payload = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(payload.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid Signature. Possible tamper attempt." });
    }

    // Signature is valid. Update Salon to Paid!
    const updatedSalon = await Salon.findByIdAndUpdate(
      salonId,
      {
        paymentStatus: "paid",
        razorpayPaymentId: razorpay_payment_id,
      },
      { new: true }
    );

    if (!updatedSalon) {
      return res.status(404).json({ success: false, message: "Salon not found after payment." });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully! Your salon is now pending admin approval.",
      salon: updatedSalon
    });

  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. VERIFY BOOKING PAYMENT
export const verifyBookingPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ success: false, message: "Missing Razorpay verification parameters." });
    }

    const payload = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(payload.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid Signature. Possible tamper attempt." });
    }

    // Signature valid. Confirmed & Paid!
    const updatedBooking = await (await import("../models/bookingModel.js")).default.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: "paid",
        status: "confirmed",
        razorpayPaymentId: razorpay_payment_id,
      },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: "Booking not found after payment." });
    }

    // 4. Real-time notification (ONLINE SUCCESS)
    const io = req.app.get("io");
    if (io) {
      const populated = await Booking.findById(updatedBooking._id)
        .populate("salon", "name location phone")
        .populate("service", "name price duration category")
        .populate("artist", "name email phone")
        .populate("user", "name email phone");

      if (populated.artist) io.emit(`artist_${populated.artist._id}_new_booking`, populated);
      io.emit(`salon_${populated.salon._id}_new_booking`, populated);
      
      // Automate Email Confirmation
      sendBookingConfirmation(populated).catch(console.error);
    }
    
    res.status(200).json({
      success: true,
      message: "Payment verified successfully! Your appointment is now confirmed.",
      booking: updatedBooking
    });

  } catch (error) {
    console.error("Verify Booking Payment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. MANUAL PAYMENT CONFIRMATION (For Owner/Artist/Admin)
export const updateBookingPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentStatus, paymentMethod } = req.body; // 'paid' or 'pending', optional method

    const Booking = (await import("../models/bookingModel.js")).default;
    
    const updateData = { paymentStatus };
    if (paymentMethod) updateData.paymentMethod = paymentMethod;

    const booking = await Booking.findByIdAndUpdate(bookingId, updateData, { new: true })
      .populate("user", "name email")
      .populate("salon", "name")
      .populate("service", "name");

    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    res.json({ success: true, message: `Payment marked as ${paymentStatus}${paymentMethod ? ` via ${paymentMethod}` : ""}`, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
