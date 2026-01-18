// backend/routes/paymentRoute.js
import express from "express";
import authUser from "../middleware/auth.js";
import {
  createRazorOrder,
  verifyRazorPaymentAndPlaceOrder,
  createUpiPaymentLink,
  razorpayWebhook
} from "../controllers/paymentController.js";

const router = express.Router();

// Razorpay order create (called by frontend to get order_id)
router.post("/create-order", authUser, createRazorOrder);

// After checkout success, verify signature and place order
router.post("/verify-order", authUser, verifyRazorPaymentAndPlaceOrder);

// UPI / payment link flow (already used by your frontend)
router.post("/create-upi-link", authUser, createUpiPaymentLink);

// Webhook - note: server.js mounts the raw parser version for webhook.
// Keep this here as additional safety if someone calls /api/payment/razorpay-webhook with raw body.
router.post("/razorpay-webhook", express.raw({ type: "application/json" }), razorpayWebhook);

export default router;
