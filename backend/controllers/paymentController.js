// backend/controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import orderModel from "../models/orderModel.js";
// ✅ REMOVED: import customRequestModel ...
import { notifyOrderPaid } from "../utils/notify.js";
import dotenv from "dotenv";
dotenv.config();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

/**
 * createRazorOrder
 */
export const createRazorOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount)
      return res
        .status(400)
        .json({ success: false, message: "Amount required" });

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    return res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: RAZORPAY_KEY_ID,
      receipt: order.receipt,
    });
  } catch (err) {
    console.error("createRazorOrder error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Unable to create order" });
  }
};

/**
 * verifyRazorPaymentAndPlaceOrder
 */
export const verifyRazorPaymentAndPlaceOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderData
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment details" });
    }

    const generated_signature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    const newOrder = new orderModel({
      userId: req.body.userId || req.user?._id || orderData.userId || "",
      items: orderData.items || [],
      amount: orderData.amount || 0,
      address: orderData.address || {},
      status: "Order Placed",
      paymentMethod: "Razorpay",
      payment: true,
      paymentDetails: {
        razorpay_order_id,
        razorpay_payment_id,
        verifiedAt: Date.now(),
      },
      localRef: `WW-${Date.now()}`,
      temp: false,
      date: Date.now(),
      // We keep these fields as strings/objects in case frontend sends them, 
      // but we NO LONGER try to update a separate customRequestModel
      custom: !!orderData.custom,
      customRequestId: orderData.customRequestId || "",
      customDetails: orderData.customDetails || null,
    });

    await newOrder.save();

    // ✅ REMOVED: The block that used to update customRequestModel

    try {
      await notifyOrderPaid(req, newOrder);
    } catch (notifyErr) {
      console.error("notifyOrderPaid error:", notifyErr);
    }

    return res.json({
      success: true,
      message: "Payment verified & order placed",
      order: newOrder,
    });
  } catch (err) {
    console.error("verifyRazorPaymentAndPlaceOrder error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Verification failed" });
  }
};

/**
 * createUpiPaymentLink
 */
export const createUpiPaymentLink = async (req, res) => {
  try {
    const {
      address,
      items,
      amount,
      customerName,
      customerEmail,
      customerPhone,
    } = req.body;

    const tempOrder = new orderModel({
      userId: req.body.userId || req.user?._id || "",
      items: items || [],
      amount: amount || 0,
      address: address || {},
      status: "Order Placed",
      paymentMethod: "UPI",
      payment: false,
      paymentDetails: {},
      localRef: `TEMP-${Date.now()}`,
      temp: true,
      date: Date.now(),
    });
    await tempOrder.save();

    let razorResp = null;
    try {
      const payload = {
        amount: Math.round(Number(amount) * 100),
        currency: "INR",
        accept_partial: false,
        reference_id: tempOrder._id.toString(),
        description: `WowWoolies order ${tempOrder.localRef}`,
        customer: {
          name:
            customerName ||
            (address && (address.firstName || address.name)) ||
            "",
          contact: customerPhone || (address && address.phone) || "",
          email: customerEmail || (address && address.email) || "",
        },
        notify: { sms: true, email: true },
      };

      razorResp = await razorpay.paymentLink.create(payload);
    } catch (rErr) {
      console.warn("Razorpay payment link creation failed:", rErr);
    }

    return res.json({
      success: true,
      message: "UPI order created",
      order: tempOrder,
      razorpay: razorResp || {},
    });
  } catch (err) {
    console.error("createUpiPaymentLink error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Unable to create UPI order" });
  }
};

/**
 * razorpayWebhook
 */
export const razorpayWebhook = async (req, res) => {
  try {
    const rawBody = req.body;
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return res.status(400).send("No signature");
    }

    const generated = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");
    if (generated !== signature) {
      return res.status(400).send("Invalid signature");
    }

    const payload = JSON.parse(rawBody.toString());
    const ev = payload.event;

    if (ev === "payment.captured" || ev === "payment.authorized") {
      const paymentEntity = payload?.payload?.payment?.entity;
      const order_id = paymentEntity?.order_id; 
      const reference_id =
        paymentEntity?.reference_id ||
        paymentEntity?.notes?.reference_id ||
        null;

      let foundOrder = null;
      if (reference_id) {
        foundOrder = await orderModel.findOne({
          $or: [{ _id: reference_id }, { localRef: reference_id }],
        });
      }
      if (!foundOrder && order_id) {
        foundOrder = await orderModel.findOne({
          "paymentDetails.razorpay_order_id": order_id,
        });
      }

      if (foundOrder && !foundOrder.payment) {
        foundOrder.payment = true;
        foundOrder.paymentMethod = "Razorpay (webhook)";
        foundOrder.paymentDetails = foundOrder.paymentDetails || {};
        foundOrder.paymentDetails.razorpay_payment_id =
          paymentEntity?.id || "";
        foundOrder.paymentDetails.verifiedAt = Date.now();
        foundOrder.status = "Order Placed";
        foundOrder.temp = false;
        await foundOrder.save();

        try {
          await notifyOrderPaid(req, foundOrder);
        } catch (nErr) {
          console.error("notifyOrderPaid failed in webhook", nErr);
        }
      }
    }

    return res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("razorpayWebhook error:", err);
    return res.status(500).json({ status: "error" });
  }
};

export default {
  createRazorOrder,
  verifyRazorPaymentAndPlaceOrder,
  createUpiPaymentLink,
  razorpayWebhook,
};