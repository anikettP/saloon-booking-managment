// src/pages/PlaceOrder.jsx
import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const isValidEmail = (email) => {
  if (!email) return false;
  const trimmed = email.trim();
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(trimmed);
};

const FAST_DELIVERY_CHARGE = 250; // fixed fast-delivery amount

const PlaceOrder = () => {
  const {
    backendUrl,
    cartItems,
    getCartAmount,
    currency,
    navigate,
    token,
    setToken,
    products,
    setCartItems,
  } = useContext(ShopContext);

  const apiBase = `${backendUrl.replace(/\/$/, "")}/api`;

  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal: "",
  });

  const [deliveryType, setDeliveryType] = useState("standard"); // "standard" | "fast"

  const [otpSent, setOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getCartAmount();
  const deliveryCharge =
    deliveryType === "fast" ? FAST_DELIVERY_CHARGE : 0;
  const grandTotal = subtotal + deliveryCharge;

  const sendOtp = async () => {
    if (token) {
      toast.info("You are already verified. You can pay directly.");
      return;
    }

    if (!data.email) return toast.error("Please enter your email.");
    if (!isValidEmail(data.email)) return toast.error("Enter a valid email.");

    try {
      setLoading(true);

      const response = await axios.post(`${apiBase}/user/checkout/send-otp`, {
        email: data.email.trim(),
        name: data.name,
      });

      setLoading(false);

      if (response.data.success) {
        setOtpToken(response.data.otpToken);
        setOtpSent(true);
        toast.success("OTP sent to your email.");
      } else {
        toast.error(response.data.message || "Unable to send OTP");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Something went wrong while sending OTP");
    }
  };

  const verifyOtp = async () => {
    if (token) return toast.info("Already verified.");

    if (!otpInput) return toast.error("Please enter the OTP.");

    try {
      setLoading(true);

      const response = await axios.post(`${apiBase}/user/checkout/verify-otp`, {
        otpToken,
        otp: otpInput,
      });

      if (!response.data.success) {
        setLoading(false);
        return toast.error(response.data.message || "Invalid OTP");
      }

      const newToken = response.data.token;

      // Merge guest cart into user cart
      try {
        const updates = [];

        if (cartItems && typeof cartItems === "object") {
          for (const itemId in cartItems) {
            const sizesObj = cartItems[itemId] || {};
            for (const size in sizesObj) {
              const quantity = Number(sizesObj[size]) || 0;
              if (quantity > 0) {
                updates.push(
                  axios.post(
                    `${apiBase}/cart/update`,
                    { itemId, size, quantity },
                    { headers: { token: newToken } }
                  )
                );
              }
            }
          }
        }

        if (updates.length > 0) await Promise.all(updates);
      } catch (mergeErr) {
        // ignore merge errors silently
      }

      setToken(newToken);
      localStorage.setItem("token", newToken);

      setLoading(false);
      toast.success("Email verified successfully.");
    } catch (error) {
      setLoading(false);
      toast.error("OTP verification failed");
    }
  };

  const buildOrderData = () => {
    const orderItems = [];

    if (!cartItems || typeof cartItems !== "object") {
      return { orderItems };
    }

    for (const id in cartItems) {
      const sizesObj = cartItems[id] || {};
      for (const size in sizesObj) {
        const quantity = Number(sizesObj[size]) || 0;
        if (quantity > 0) {
          const product = Array.isArray(products)
            ? products.find((p) => p._id === id || p.id === id)
            : null;
          if (product) {
            orderItems.push({
              ...product,
              size,
              quantity,
            });
          }
        }
      }
    }

    const baseAmount = getCartAmount();
    const deliveryChargeLocal =
      deliveryType === "fast" ? FAST_DELIVERY_CHARGE : 0;
    const totalAmount = baseAmount + deliveryChargeLocal;

    const address = {
      name: data.name,
      email: data.email.trim(),
      phone: data.phone,
      street: data.address,
      city: data.city,
      zipcode: data.postal,
      country: "India",
    };

    return {
      orderItems,
      amount: totalAmount,
      address,
      deliveryType,
      deliveryCharge: deliveryChargeLocal,
      isFastDelivery: deliveryType === "fast",
      baseAmount,
    };
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!token) return toast.error("Please verify OTP before payment.");

    const {
      orderItems,
      amount,
      address,
      deliveryType: dType,
      deliveryCharge: dCharge,
      isFastDelivery,
    } = buildOrderData();

    if (!orderItems || orderItems.length === 0) {
      return toast.error("Cart is empty.");
    }

    const orderData = {
      address,
      items: orderItems,
      amount,
      deliveryType: dType,
      deliveryCharge: dCharge,
      isFastDelivery,
    };

    try {
      setIsProcessing(true);

      // create Razorpay order with TOTAL amount (including delivery)
      const createRes = await axios.post(
        `${apiBase}/payment/create-order`,
        { amount: orderData.amount },
        { headers: { token } }
      );

      if (!createRes.data.success) {
        setIsProcessing(false);
        return toast.error(
          "Explore Book.My.Glow best sellers — where every service weaves beauty into timeless art."
        );
      }

      const { order_id, amount: razorAmount, key_id } = createRes.data;

      const options = {
        key: key_id,
        amount: razorAmount,
        currency: "INR",
        name: "Book.My.Glow",
        description: "Order Payment",
        order_id,
        prefill: {
          name: data.name,
          email: data.email.trim(),
          contact: data.phone,
        },
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              `${apiBase}/payment/verify-order`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData,
              },
              { headers: { token } }
            );

            if (verifyRes.data.success) {
              setCartItems({});
              toast.success("Payment successful! Order placed.");
              navigate("/orders");
            } else {
              toast.error(
                verifyRes.data.message || "Payment verification failed"
              );
              navigate("/cart");
            }
          } catch (err) {
            toast.error("Verification failed");
            navigate("/cart");
          } finally {
            setIsProcessing(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setIsProcessing(false);
        toast.error("Payment failed");
      });
      rzp.open();
    } catch (error) {
      setIsProcessing(false);
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <div className="place-order w-full min-h-screen pt-32 sm:pt-36 mt-32 pb-16">
      <h2 className="text-3xl font-bold mb-8 text-center">Checkout</h2>

      <form
        onSubmit={onSubmitHandler}
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10"
      >
        {/* LEFT SECTION - Billing */}
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-xl font-semibold mb-6">Billing Details</h3>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full border rounded-lg py-3 px-4"
              required
            />

            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email Address"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                className="w-full border rounded-lg py-3 px-4"
                required
              />

              {!otpSent && !token && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={sendOtp}
                  className="px-5 py-3 bg-black text-white rounded-lg disabled:opacity-60"
                >
                  {loading ? "..." : "Send OTP"}
                </button>
              )}
            </div>

            {otpSent && !token && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full border rounded-lg py-3 px-4"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={verifyOtp}
                  className="px-5 py-3 bg-green-600 text-white rounded-lg disabled:opacity-60"
                >
                  {loading ? "..." : "Verify"}
                </button>
              </div>
            )}

            <input
              type="text"
              placeholder="Phone Number"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              className="w-full border rounded-lg py-3 px-4"
              required
            />

            <textarea
              placeholder="Full Address"
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              className="w-full border rounded-lg py-3 px-4 h-24 resize-none"
              required
            />

            <div className="flex gap-4">
              <input
                type="text"
                placeholder="City"
                value={data.city}
                onChange={(e) => setData({ ...data, city: e.target.value })}
                className="w-full border rounded-lg py-3 px-4"
                required
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={data.postal}
                onChange={(e) => setData({ ...data, postal: e.target.value })}
                className="w-full border rounded-lg py-3 px-4"
                required
              />
            </div>
          </div>
        </div>

        {/* RIGHT SECTION - Summary + Delivery option */}
        <div className="bg-white p-6 rounded-xl shadow-lg border h-fit md:sticky md:top-24">
          <h3 className="text-xl font-semibold mb-6">Order Summary</h3>

          {/* Delivery option selector */}
          <div className="mb-5 border rounded-lg p-3 bg-gray-50">
            <p className="text-sm font-medium mb-2">Delivery option</p>
            <div className="space-y-2 text-sm">
              <label className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="standard"
                    checked={deliveryType === "standard"}
                    onChange={() => setDeliveryType("standard")}
                  />
                  <span>Standard Delivery (4–7 days)</span>
                </span>
                <span className="font-semibold text-gray-800">Free</span>
              </label>

              <label className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="fast"
                    checked={deliveryType === "fast"}
                    onChange={() => setDeliveryType("fast")}
                  />
                  <span>Fast Delivery (1–3 days)</span>
                </span>
                <span className="font-semibold text-gray-800">
                  {currency}
                  {FAST_DELIVERY_CHARGE}
                </span>
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Fast delivery adds an extra {currency}
              {FAST_DELIVERY_CHARGE} to your total. Everything else in your
              order flow remains the same.
            </p>
          </div>

          <div className="text-gray-700 space-y-4">
            <div className="flex justify-between text-lg">
              <span>Subtotal</span>
              <span>
                {currency}
                {subtotal}
              </span>
            </div>

            <div className="flex justify-between text-lg">
              <span>
                {deliveryType === "fast"
                  ? "Fast Delivery"
                  : "Standard Delivery"}
              </span>
              <span>
                {currency}
                {deliveryCharge}
              </span>
            </div>

            <hr />

            <div className="flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>
                {currency}
                {grandTotal}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="mt-8 w-full bg-black text-white py-4 rounded-lg text-lg disabled:opacity-60"
            disabled={isProcessing}
            title="Most loved Book.My.Glow creations."
          >
            {isProcessing ? "Processing..." : "Pay Now"}
          </button>

          {!token && (
            <p className="text-sm text-red-500 mt-2">
              Verify OTP before paying.
            </p>
          )}
        </div>

        {isProcessing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 px-6 py-4 bg-white rounded-xl shadow-lg">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
              <p className="text-sm text-gray-700">
                Verifying payment, please wait…
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default PlaceOrder;
