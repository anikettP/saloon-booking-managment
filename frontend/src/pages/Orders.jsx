// src/pages/Orders.jsx
import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";

const STATUS_FLOW = [
  "Order Placed",
  "Packing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const Orders = () => {
  const { backendUrl, token, currency, navigate } = useContext(ShopContext);

  const [orderData, setOrderData] = useState([]);

  // Use base with /api
  const apiBase = `${backendUrl.replace(/\/$/, "")}/api`;

  const loadOrderData = async () => {
    try {
      if (!token) return null;

      const response = await axios.post(
        `${apiBase}/order/userorders`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        let allOrdersItem = [];

        response.data.orders.forEach((order) => {
          // 🔴 SKIP CUSTOM ORDERS COMPLETELY
          if (order.custom) return;

          (order.items || []).forEach((item) => {
            // extra safety: skip any custom items
            if (item.isCustom) return;

            const cloned = { ...item };
            cloned.status = order.status;
            cloned.payment = order.payment;
            cloned.paymentMethod = order.paymentMethod;
            cloned.date = order.date;
            cloned.orderId = order._id;
            allOrdersItem.push(cloned);
          });
        });

        setOrderData(allOrdersItem);
      } else {
        setOrderData([]);
      }
    } catch (error) {
      console.log(error);
      setOrderData([]);
    }
  };

  useEffect(() => {
    loadOrderData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // helper to show short description
  const short = (text, n = 120) => {
    if (!text) return "";
    return text.length > n ? text.slice(0, n).trim() + "..." : text;
  };

  const getStepIndex = (status) => {
    if (!status) return 0;
    const idx = STATUS_FLOW.findIndex(
      (s) => s.toLowerCase() === status.toLowerCase()
    );
    return idx === -1 ? 0 : idx;
  };

  return (
    // UI ONLY CHANGE: top padding + remove bg color
    <div className="min-h-[80vh] pt-[170px] pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-pink-900 tracking-wide">
            MY <span className="text-pink-600">ORDERS</span>
          </h1>
          <div className="w-16 h-1 bg-pink-600 mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Orders list */}
        <div className="grid gap-6">
          {orderData.length === 0 ? (
            <div className="py-24 text-center text-gray-600">
              <p className="text-lg font-semibold">No orders yet</p>
              <p className="mt-2 text-sm">
                Once you place a normal order, it will appear here.
              </p>
            </div>
          ) : (
            orderData.map((item, index) => {
              const isCancelled =
                (item.status || "").toLowerCase() === "cancelled";
              const stepIndex = getStepIndex(item.status);
              const progressPercent =
                STATUS_FLOW.length > 1
                  ? (stepIndex / (STATUS_FLOW.length - 1)) * 100
                  : 0;

              const subtotal =
                (Number(item.price) || 0) * (Number(item.quantity) || 1);

              return (
                <article
                  key={index}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden border border-pink-100 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* IMAGE */}
                    <div className="w-full md:w-1/3 lg:w-1/4 bg-pink-50 flex items-center justify-center p-4">
                      <img
                        src={
                          item.image && item.image.length ? item.image[0] : ""
                        }
                        alt={item.name}
                        className="w-full h-56 md:h-44 lg:h-48 object-cover rounded-lg border border-pink-100 shadow-sm"
                      />
                    </div>

                    {/* CONTENT */}
                    <div className="w-full md:w-2/3 lg:w-3/4 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-semibold text-pink-900 leading-tight">
                              {item.name || "Product"}
                            </h3>
                            <p className="text-sm text-pink-700 mt-2">
                              {short(
                                item.description ||
                                  item.longDescription ||
                                  item.meta ||
                                  "",
                                160
                              )}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-pink-800">
                              <span className="font-semibold text-pink-900">
                                {currency}
                                {item.price}
                              </span>
                              <span>
                                Quantity:{" "}
                                <span className="font-medium">
                                  {item.quantity}
                                </span>
                              </span>
                              <span>
                                Size:{" "}
                                <span className="font-medium">
                                  {item.size || "-"}
                                </span>
                              </span>
                            </div>

                            <div className="mt-3 text-sm text-pink-700">
                              <div>
                                Date:{" "}
                                <span className="font-medium text-pink-900">
                                  {new Date(item.date).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                              <div className="mt-1">
                                Payment:{" "}
                                <span className="font-medium text-pink-900">
                                  {item.paymentMethod}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status + ID (desktop) */}
                          <div className="hidden md:flex flex-col items-end justify-center ml-4 w-44">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-block w-3 h-3 rounded-full ${
                                  isCancelled
                                    ? "bg-red-500"
                                    : stepIndex === STATUS_FLOW.length - 1
                                    ? "bg-green-500"
                                    : "bg-yellow-400"
                                }`}
                              />
                              <span className="text-sm font-medium text-pink-900">
                                {item.status}
                              </span>
                            </div>
                            <div className="mt-3 text-xs text-gray-500 text-right">
                              <div>
                                Order ID:{" "}
                                <span className="text-pink-800 font-medium">
                                  #
                                  {(item.orderId &&
                                    String(item.orderId).slice(0, 8)) ||
                                    (index + 1000)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* PROGRESS BAR */}
                        {!isCancelled && (
                          <div className="mt-5">
                            <div className="relative h-1.5 bg-pink-100 rounded-full">
                              <div
                                className="absolute left-0 top-0 h-1.5 bg-pink-500 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                              />
                              {STATUS_FLOW.map((_, idx) => (
                                <span
                                  key={idx}
                                  className="absolute -top-1 w-3 h-3 rounded-full border-2 border-white"
                                  style={{
                                    left: `${
                                      (idx / (STATUS_FLOW.length - 1)) * 100
                                    }%`,
                                    transform: "translateX(-50%)",
                                    backgroundColor:
                                      idx <= stepIndex
                                        ? "#ec4899"
                                        : "#fecdd3",
                                  }}
                                />
                              ))}
                            </div>
                            <div className="mt-3 flex justify-between text-[10px] sm:text-xs font-medium text-pink-900">
                              {STATUS_FLOW.map((label, idx) => (
                                <span
                                  key={idx}
                                  className={
                                    idx === stepIndex
                                      ? "text-pink-700"
                                      : "text-pink-400"
                                  }
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {isCancelled && (
                          <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
                            <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                            <span className="font-medium">
                              This order was cancelled.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* actions + subtotal */}
                      <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              if (navigate)
                                navigate(`/product/${item._id || item.id}`);
                              else
                                window.location.href = `/product/${
                                  item._id || item.id
                                }`;
                            }}
                            className="px-4 py-2 bg-pink-900 text-white rounded-lg text-sm shadow-sm hover:bg-pink-800 transition"
                          >
                            View Product
                          </button>
                        </div>

                        {/* mobile status + subtotal */}
                        <div className="flex items-center justify-between w-full sm:w-auto">
                          <div className="md:hidden flex items-center gap-2">
                            <span
                              className={`inline-block w-3 h-3 rounded-full ${
                                isCancelled
                                  ? "bg-red-500"
                                  : stepIndex === STATUS_FLOW.length - 1
                                  ? "bg-green-500"
                                  : "bg-yellow-400"
                              }`}
                            />
                            <span className="text-sm font-medium text-pink-900">
                              {item.status}
                            </span>
                          </div>

                          <div className="text-sm text-gray-600 mt-2 md:mt-0">
                            Subtotal:{" "}
                            <span className="font-semibold text-pink-900">
                              {currency}
                              {subtotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* end content */}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
