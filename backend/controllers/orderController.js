// backend/controllers/orderController.js

import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import { notifyOrderPaid } from "../utils/notify.js";

const currency = "inr";
const defaultDeliveryCharge = 10; // used only for Stripe fallback
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * markOrderPaid – idempotent payment processor
 */
export const markOrderPaid = async (order, txnId = null, req = null) => {
  if (!order) return null;
  if (order.payment) return order;

  order.payment = true;
  order.paymentMethod = order.paymentMethod || "upi";
  order.paymentDetails = { txnId: txnId || null, verifiedAt: Date.now() };
  order.status = "Payment Received";

  if (order.temp) order.temp = false;
  await order.save();

  // clear cart in user model
  if (order.userId) {
    try {
      await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
    } catch {}
  }

  // send notifications
  try {
    if (req) await notifyOrderPaid(req, order);
  } catch {}

  return order;
};

/**
 * placeOrder (COD or prepaid – NOT Stripe)
 * Normalizes checkout form fields and now accepts delivery fields.
 */
export const placeOrder = async (req, res) => {
  try {
    const userId = req.body.userId;
    let { address, items, amount, paymentMethod, deliveryType, deliveryCharge } =
      req.body;

    if (!items || items.length === 0)
      return res.json({ success: false, message: "Cart empty" });

    // Normalize address (old form style)
    if (address && address.fullName) {
      const parts = address.fullName.trim().split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";

      address = {
        firstName,
        lastName,
        phone: address.phone || "",
        email: address.email || "",
        street: address.fullAddress || "",
        city: address.city || "",
        state: address.state || "",
        country: address.country || "India",
        zipcode: address.postalCode || "",
      };
    }

    const finalDeliveryType = deliveryType || "standard";
    const finalDeliveryCharge = Number(deliveryCharge || 0);
    const isFastDelivery = finalDeliveryType === "fast";

    const localRef = "ORDER" + Date.now();

    const order = await orderModel.create({
      userId,
      items,
      amount: Number(amount),
      address,
      paymentMethod: paymentMethod || "cod",
      payment: false,
      status: "Order Created",
      date: Date.now(),
      localRef,
      temp: false,
      deliveryType: finalDeliveryType,
      deliveryCharge: finalDeliveryCharge,
      isFastDelivery,
    });

    return res.json({ success: true, order });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

/**
 * placeOrderStripe – temp order for Stripe checkout
 * Now respects optional deliveryType / deliveryCharge from frontend.
 */
export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;

    if (!items || items.length === 0)
      return res.json({ success: false, message: "Cart empty" });

    // normalize address
    let finalAddress = address;
    if (address && address.fullName) {
      const parts = address.fullName.trim().split(" ");
      finalAddress = {
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        phone: address.phone || "",
        email: address.email || "",
        street: address.fullAddress || "",
        city: address.city || "",
        state: address.state || "",
        country: address.country || "India",
        zipcode: address.postalCode || "",
      };
    }

    const deliveryType = req.body.deliveryType || "standard";
    const deliveryCharge =
      req.body.deliveryCharge != null
        ? Number(req.body.deliveryCharge)
        : defaultDeliveryCharge;
    const isFastDelivery = deliveryType === "fast";

    const tempOrder = await orderModel.create({
      userId,
      items,
      address: finalAddress,
      amount: Number(amount),
      paymentMethod: "stripe",
      payment: false,
      date: Date.now(),
      temp: true,
      localRef: "ORDER" + Date.now(),
      deliveryType,
      deliveryCharge,
      isFastDelivery,
    });

    const line_items = [
      ...items.map((i) => ({
        price_data: {
          currency,
          product_data: { name: i.name },
          unit_amount: Math.round((i.price || 0) * 100),
        },
        quantity: i.quantity,
      })),
      {
        price_data: {
          currency,
          product_data: { name: "Delivery Charges" },
          unit_amount: Math.round(deliveryCharge * 100),
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&session_id={CHECKOUT_SESSION_ID}&tempOrderId=${tempOrder._id}`,
      cancel_url: `${origin}/verify?success=false&session_id={CHECKOUT_SESSION_ID}&tempOrderId=${tempOrder._id}`,
      line_items,
      mode: "payment",
      metadata: { tempOrderId: tempOrder._id.toString() },
    });

    return res.json({ success: true, session_url: session.url });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

/**
 * verifyStripe
 */
export const verifyStripe = async (req, res) => {
  try {
    const { session_id: sessionId, tempOrderId } = req.body;
    if (!sessionId || !tempOrderId)
      return res.json({
        success: false,
        message: "Missing session_id or tempOrderId",
      });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (!session)
      return res.json({ success: false, message: "Stripe session not found" });

    if (session.payment_status !== "paid")
      return res.json({ success: false, message: "Payment not completed" });

    const paymentIntentId = session.payment_intent?.id || null;

    const order = await orderModel.findById(tempOrderId);
    if (!order)
      return res.json({ success: false, message: "Order not found" });

    const updated = await markOrderPaid(order, paymentIntentId, req);
    return res.json({
      success: true,
      message: "Stripe payment verified",
      order: updated,
    });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

/**
 * verifyUpi – manual UPI entry
 */
export const verifyUpi = async (req, res) => {
  try {
    const { orderId, txnId } = req.body;
    let order =
      (await orderModel.findById(orderId)) ||
      (await orderModel.findOne({ localRef: orderId }));

    if (!order) return res.json({ success: false, message: "Order not found" });
    if (order.payment)
      return res.json({ success: true, message: "Already paid" });

    const updated = await markOrderPaid(order, txnId, req);
    return res.json({ success: true, order: updated });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

/**
 * checkOrderStatus
 */
export const checkOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.body;
    let order =
      (await orderModel.findById(orderId)) ||
      (await orderModel.findOne({ localRef: orderId }));

    if (!order) return res.json({ success: false, message: "Order not found" });
    return res.json({ success: true, payment: !!order.payment, order });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

/**
 * allOrders (admin)
 * FINAL FIX → EXCLUDE CUSTOM ORDERS
 */
export const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({
      temp: { $ne: true },
      custom: { $ne: true }, // exclude custom requests
    });

    return res.json({ success: true, orders });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

/**
 * userOrders
 * FINAL FIX → EXCLUDE CUSTOM ORDERS
 */
export const userOrders = async (req, res) => {
  try {
    let { userId } = req.body;
    if (!userId && req.user?._id) userId = req.user._id;

    if (!userId)
      return res.json({ success: false, message: "Missing userId" });

    const orders = await orderModel
      .find({ userId, temp: { $ne: true }, custom: { $ne: true } })
      .sort({ date: -1 });

    return res.json({ success: true, orders });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

/**
 * updateStatus (admin)
 */
export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    return res.json({ success: true, message: "Status updated" });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};
