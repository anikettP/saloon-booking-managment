import User from "../models/userModel.js";
import { sendMail } from "../utils/mail.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// 1) SEND PASSWORD RESET OTP
export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.json({ success: false, message: "Email required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "No user found with this email" });

    const otp = Math.floor(100000 + Math.random() * 900000);

    const otpToken = jwt.sign({ email, otp }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    await sendMail({
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP for resetting password is:</p>
             <h2>${otp}</h2>
             <p>Valid for 10 minutes.</p>`,
    });

    return res.json({ success: true, otpToken });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Server Error" });
  }
};

// 2) VERIFY OTP + RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { otpToken, otp, newPassword } = req.body;

    if (!otpToken || !otp || !newPassword)
      return res.json({ success: false, message: "Missing data" });

    const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);

    if (decoded.otp != otp)
      return res.json({ success: false, message: "Invalid OTP" });

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate(
      { email: decoded.email },
      { password: hashed }
    );

    return res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "OTP expired or invalid" });
  }
};
