import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { sendMail } from "../utils/mail.js";



// Generate 4-digit OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

// SEND OTP
export const sendCheckoutOtp = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.json({ success: false, message: "Email is required." });
    }

    const otp = generateOTP();

    // Send email
    await sendMail({
      to: email,
      subject: "Your WowWoolies Checkout OTP",
      html: `<p>Your OTP for checkout is <b>${otp}</b></p>`
    });

    // store otp inside jwt token – EXPIRES IN 10 MIN
    const otpToken = jwt.sign(
      { email, name, otp },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res.json({
      success: true,
      message: "OTP sent successfully",
      otpToken
    });

  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Something went wrong" });
  }
};


// VERIFY OTP
export const verifyCheckoutOtp = async (req, res) => {
  try {
    const { otpToken, otp } = req.body;

    if (!otpToken || !otp) {
      return res.json({ success: false, message: "OTP is required" });
    }

    const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);

    if (decoded.otp != otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // create/find user
    let user = await User.findOne({ email: decoded.email });

    if (!user) {
      // create guest user with random password
      user = await User.create({
        name: decoded.name || "Guest User",
        email: decoded.email,
        password: "TEMP" + Date.now()
      });
    }

    // give real login token for checkout
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    return res.json({
      success: true,
      message: "OTP verified successfully",
      token
    });

  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "OTP expired or invalid" });
  }
};
