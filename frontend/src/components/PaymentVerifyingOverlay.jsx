// src/components/PaymentVerifyingOverlay.jsx
import React from "react";

const PaymentVerifyingOverlay = ({ message = "Verifying your payment..." }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center gap-4 max-w-sm text-center">
        {/* Spinner */}
        <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />

        <h2 className="text-pink-900 font-semibold text-lg">
          Please wait…
        </h2>
        <p className="text-xs text-gray-500">
          {message}
          <br />
          Do not refresh or close this window.
        </p>
      </div>
    </div>
  );
};

export default PaymentVerifyingOverlay;
