// backend/routes/userRoute.js
import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  getMe,
} from "../controllers/userController.js";
import { sendCheckoutOtp, verifyCheckoutOtp } from "../controllers/checkoutOtpController.js";
import { sendResetOtp, resetPassword } from "../controllers/passwordController.js";
import authUser from "../middleware/auth.js";

const userRouter = express.Router();

// USER AUTH
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// CURRENT USER PROFILE
userRouter.get("/me", authUser, getMe);

// ADMIN LOGIN
userRouter.post("/admin", adminLogin);

// GUEST CHECKOUT OTP
userRouter.post("/checkout/send-otp", sendCheckoutOtp);
userRouter.post("/checkout/verify-otp", verifyCheckoutOtp);

// PASSWORD RESET
userRouter.post("/reset/send-otp", sendResetOtp);
userRouter.post("/reset/verify", resetPassword);

export default userRouter;
