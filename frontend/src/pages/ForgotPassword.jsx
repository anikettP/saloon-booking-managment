import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import { useContext } from "react";

const ForgotPassword = () => {
  const { backendUrl, navigate } = useContext(ShopContext);

  const [step, setStep] = useState(1); // 1 = email, 2 = otp, 3 = new password
  const [email, setEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const sendOtp = async () => {
    try {
      const res = await axios.post(`${backendUrl}/user/reset/send-otp`, { email });
      if (res.data.success) {
        setOtpToken(res.data.otpToken);
        setStep(2);
        toast.success("OTP Sent to your email.");
      } else toast.error(res.data.message);
    } catch (error) {
      toast.error("Error sending OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post(`${backendUrl}/user/reset/verify`, {
        otpToken,
        otp,
        newPassword,
      });
      if (res.data.success) {
        toast.success("Password Reset Successful!");
        navigate("/login");
      } else toast.error(res.data.message);
    } catch {
      toast.error("Password reset failed");
    }
  };

  return (
    <div className="pt-20 max-w-md mx-auto px-4">
      <h1 className="text-2xl font-bold mb-5">Forgot Password</h1>

      {step === 1 && (
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Enter Email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={sendOtp}
            className="w-full bg-black text-white py-2 rounded"
          >
            Send OTP
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full border px-3 py-2 rounded"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <input
            type="password"
            placeholder="New Password"
            className="w-full border px-3 py-2 rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button
            onClick={verifyOtp}
            className="w-full bg-black text-white py-2 rounded"
          >
            Reset Password
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
