// admin/src/pages/Orders.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl, currency } from "../App";
import { assets } from "../assets/assets";

// GST / business details
const GST_DETAILS = {
  registrationNumber: "08BAPPP9482F1ZY",
  legalName: "MAHAVEER PRASAD SHARMA",
  tradeName: "WOW WOOLIES",
  principalPlace: "PLOT NO. 41, GANESH NAGAR, KALWAR ROAD, HARNATHPURA, JAIPUR, RAJASTHAN - 302012",
  email: "wowwoolies25@gmail.com",
  phone: "+91-9352424085",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  // --- 1. Helper to decode the complex "size" string ---
  const parseItemDetails = (itemSizeString) => {
    // Format: "12x12__custom__{"Name 1":"Ankit"}"
    if (!itemSizeString || !itemSizeString.includes("__custom__")) {
      return { size: itemSizeString, customData: null };
    }
    const parts = itemSizeString.split("__custom__");
    try {
      return { size: parts[0], customData: JSON.parse(parts[1]) };
    } catch (e) {
      return { size: parts[0], customData: null };
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/order/list`,
        {},
        { headers: { token } }
      );
      if (res.data.success) setOrders(res.data.orders.reverse());
      else toast.error(res.data.message || "Failed to load orders");
    } catch (err) {
      console.error("fetchOrders error:", err);
      toast.error("Error fetching orders");
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const res = await axios.post(
        `${backendUrl}/order/status`,
        { orderId, status },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Order status updated");
        fetchOrders();
      } else toast.error(res.data.message || "Failed to update status");
    } catch (err) {
      console.error("updateStatus error:", err);
      toast.error("Error updating status");
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Barcode Generator
  function generateBarcodeSVG(text, width = 380, height = 50) {
    if (!text) text = "";
    const chars = text.split("");
    const barWidth = Math.max(1, Math.floor(width / Math.max(60, chars.length * 6)));
    let x = 0;
    let bars = [];

    for (let i = 0; i < chars.length; i++) {
      const code = chars[i].charCodeAt(0);
      for (let bit = 0; bit < 6; bit++) {
        const val = (code >> bit) & 1;
        const h = height * (0.6 + (code % 5) / 10);
        if (val === 1) {
          bars.push(`<rect x="${x}" y="${height - h}" width="${barWidth}" height="${h}" fill="#111" />`);
        }
        x += barWidth;
        if (x > width) break;
      }
      if (x > width) break;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#fff"/>
      ${bars.join("\n")}
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return "";
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- PDF PRINT FUNCTION ---
  function printOrder(order) {
    if (!order) return;

    const items = order.items || [];
    const itemsHtml = items.map((it) => {
        const { size, customData } = parseItemDetails(it.size);
        
        const image = (it.image && (Array.isArray(it.image) ? it.image[0] : it.image)) || assets.placeholder;
        const qty = it.quantity || 1;
        const price = Number(it.price || 0);
        const lineTotal = (price * qty).toFixed(2);

        // Build Custom Data HTML for Invoice
        let customHtml = "";
        let photoHtml = "";

        if (customData) {
            const rows = Object.entries(customData).map(([key, val]) => {
                if (key === "__photo_url") return ""; // Skip internal key
                
                // If it's a photo, show it large
                if (key === "Uploaded Photo") {
                    photoHtml = `<div style="margin-top:8px; border:1px solid #ddd; padding:4px; display:inline-block; border-radius:4px;">
                        <div style="font-size:10px; font-weight:bold; color:#ec4899; margin-bottom:2px;">USER UPLOADED PHOTO:</div>
                        <img src="${val}" style="max-height:150px; max-width:200px; display:block;" />
                    </div>`;
                    return ""; 
                }
                if (key === "User Photo") return ""; // Skip text label

                return `<div style="font-size:11px; color:#444; margin-top:2px;">
                    <span style="font-weight:600; color:#000;">${key}:</span> ${val}
                </div>`;
            }).join("");
            
            if(rows) customHtml = `<div style="margin-top:6px; padding:6px; background:#fdf2f8; border-radius:4px; border:1px solid #fbcfe8;">${rows}</div>`;
        }

        return `
          <tr>
            <td style="padding:10px; border-bottom:1px solid #eee; vertical-align:top;">
              <div style="display:flex; gap:12px;">
                <img src="${image}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #ddd" />
                <div style="flex:1;">
                  <div style="font-weight:700; color:#222; font-size:13px;">${escapeHtml(it.name || "-")}</div>
                  <div style="font-size:12px; color:#666; margin-top:2px;">Size: <strong>${escapeHtml(size || "-")}</strong></div>
                  ${customHtml}
                  ${photoHtml}
                </div>
              </div>
            </td>
            <td style="padding:10px; border-bottom:1px solid #eee; text-align:center; vertical-align:top;">${qty}</td>
            <td style="padding:10px; border-bottom:1px solid #eee; text-align:right; vertical-align:top;">${currency}${price.toFixed(2)}</td>
            <td style="padding:10px; border-bottom:1px solid #eee; text-align:right; vertical-align:top;"><strong>${currency}${lineTotal}</strong></td>
          </tr>
        `;
      }).join("");

    const subtotal = items.reduce((s, it) => s + Number(it.price || 0) * (it.quantity || 1), 0);
    const shippingRaw = order.deliveryCharge != null ? order.deliveryCharge : order.shipping;
    const shipping = Number(shippingRaw || 0);
    const discount = Number(order.discount || 0) || 0;
    const total = Number(order.amount || subtotal + shipping - discount);
    const isFastDelivery = !!order.isFastDelivery || order.deliveryType === "fast";

    const billingName = (
      order.address?.fullName || order.address?.name ||
      `${order.address?.firstName || ""} ${order.address?.lastName || ""}`.trim() ||
      order.userName || order.user?.name || ""
    ).trim();

    const barcodeDataUri = generateBarcodeSVG(order._id || order.id || "", 380, 50);

    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice - ${escapeHtml(order._id)}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color:#333; padding: 30px; max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid #ec4899; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
          .logo { font-size: 24px; font-weight: 800; color: #ec4899; letter-spacing: 1px; }
          .company-info { font-size: 11px; color: #666; margin-top: 5px; line-height: 1.4; }
          .invoice-title { text-align: right; }
          .invoice-title h1 { margin: 0; font-size: 24px; text-transform: uppercase; color: #333; }
          .invoice-meta { font-size: 12px; margin-top: 5px; color: #555; }
          
          .address-block { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px; }
          .bill-to, .ship-to { width: 45%; }
          .label { font-weight: 700; text-transform: uppercase; font-size: 11px; color: #999; margin-bottom: 5px; }
          
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #fdf2f8; color: #ec4899; font-weight: 700; text-transform: uppercase; padding: 12px 10px; text-align: left; font-size: 11px; letter-spacing: 0.5px; border-bottom: 1px solid #fbcfe8; }
          
          .totals { margin-top: 20px; width: 300px; margin-left: auto; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
          .total-final { font-size: 16px; font-weight: 700; color: #ec4899; border-top: 2px solid #ec4899; padding-top: 10px; margin-top: 10px; }
          
          .barcode { text-align: center; margin-top: 40px; opacity: 0.8; }
          .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #999; }
          
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">${GST_DETAILS.tradeName}</div>
            <div class="company-info">
              ${GST_DETAILS.legalName}<br>
              GSTIN: ${GST_DETAILS.registrationNumber}<br>
              ${GST_DETAILS.principalPlace}<br>
              ${GST_DETAILS.email} | ${GST_DETAILS.phone}
            </div>
          </div>
          <div class="invoice-title">
            <h1>Invoice</h1>
            <div class="invoice-meta">
              Date: ${new Date(order.date).toLocaleDateString()}<br>
              Order ID: <strong>#${order._id.slice(-6).toUpperCase()}</strong>
            </div>
          </div>
        </div>

        <div class="address-block">
          <div class="bill-to">
            <div class="label">Bill To</div>
            <div style="font-weight:600; font-size:14px; margin-bottom:2px;">${escapeHtml(billingName)}</div>
            ${escapeHtml(order.address?.email || "")}<br>
            ${escapeHtml(order.address?.phone || "")}
          </div>
          <div class="ship-to">
            <div class="label">Ship To</div>
            ${escapeHtml(order.address?.street || "")}<br>
            ${escapeHtml(order.address?.city || "")}, ${escapeHtml(order.address?.state || "")} - ${escapeHtml(order.address?.zipcode || "")}<br>
            ${escapeHtml(order.address?.country || "")}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item & Details</th>
              <th style="text-align:center">Qty</th>
              <th style="text-align:right">Price</th>
              <th style="text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>${currency}${subtotal.toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span>Shipping (${isFastDelivery ? "Fast" : "Standard"})</span>
            <span>${currency}${shipping.toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span>Discount</span>
            <span>-${currency}${discount.toFixed(2)}</span>
          </div>
          <div class="totals-row total-final">
            <span>Total Amount</span>
            <span>${currency}${total.toFixed(2)}</span>
          </div>
        </div>

        <div class="barcode">
          <img src="${barcodeDataUri}" style="height:40px;" />
          <div style="font-size:10px; letter-spacing:2px; margin-top:4px;">${order._id}</div>
        </div>

        <div class="footer">
          Thank you for your order. If you have any questions, please contact us at ${GST_DETAILS.email}.
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    const w = window.open("", "_blank", "width=900,height=900");
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
    } else {
      toast.error("Popup blocked. Please allow popups to print invoice.");
    }
  }

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Order Management</h2>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No orders found.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => {
            const customerName = (
              order.address?.fullName || order.address?.name ||
              `${order.address?.firstName || ""} ${order.address?.lastName || ""}`.trim() ||
              order.userName || order.user?.name || ""
            ).trim();

            return (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                
                {/* LEFT: Order Details */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-800">{customerName}</h3>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-mono">#{order._id.slice(-6)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-pink-600">{currency}{order.amount}</p>
                      <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-4">
                    {order.items?.map((item, idx) => {
                      const { size, customData } = parseItemDetails(item.size);
                      return (
                        <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <img 
                            src={(item.image && (Array.isArray(item.image) ? item.image[0] : item.image)) || assets.placeholder} 
                            className="w-16 h-16 object-cover rounded-md border" 
                            alt={item.name}
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Size: <span className="font-medium text-gray-700">{size}</span> | Qty: {item.quantity}
                            </p>

                            {/* CUSTOM DATA DISPLAY IN ADMIN */}
                            {customData && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {Object.entries(customData).map(([key, val]) => {
                                  if (key === "__photo_url") return null;
                                  
                                  // Special Display for Photo
                                  if (key === "Uploaded Photo") {
                                    return (
                                      <div key={key} className="w-full mt-1 pt-2 border-t border-gray-200">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded">USER PHOTO</span>
                                          <a href={val} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                                            View Full Size
                                          </a>
                                        </div>
                                        <img src={val} alt="User Upload" className="mt-2 h-20 w-auto rounded border border-gray-300 shadow-sm" />
                                      </div>
                                    );
                                  }
                                  
                                  if (key === "User Photo") return null; // Skip placeholder text

                                  return (
                                    <span key={key} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 border border-blue-100 text-xs text-blue-800">
                                      <span className="font-semibold opacity-70">{key}:</span> {val}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* RIGHT: Status & Actions */}
                <div className="flex flex-col justify-between border-l border-gray-100 pl-8 space-y-6">
                  
                  {/* Address */}
                  <div className="text-sm text-gray-600">
                    <p className="font-bold text-gray-900 mb-2">Shipping Address</p>
                    <p>{order.address?.street}</p>
                    <p>{order.address?.city}, {order.address?.state} - {order.address?.zipcode}</p>
                    <p className="mt-2">📞 {order.address?.phone}</p>
                  </div>

                  {/* Controls */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Status</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-pink-500 outline-none"
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                      >
                        <option>Order Placed</option>
                        <option>Packing</option>
                        <option>Shipped</option>
                        <option>Out for Delivery</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </select>
                    </div>

                    <button
                      onClick={() => printOrder(order)}
                      className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 transition shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print Invoice (PDF)
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;