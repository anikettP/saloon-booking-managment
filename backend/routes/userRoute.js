// backend/routes/userRoute.js
// Kept for backward compatibility with frontend user auth calls
import express from "express";
import { login, register, adminLogin, getMe, updateProfile, updateArtistProfile } from "../controllers/authController.js";
import { sendResetOtp, resetPassword } from "../controllers/passwordController.js";
import { protect } from "../middleware/auth.js";

const userRouter = express.Router();

// USER AUTH
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/admin", adminLogin);

// CURRENT USER PROFILE
userRouter.get("/me", protect, getMe);
userRouter.put("/profile", protect, updateProfile);
userRouter.put("/artist/profile", protect, updateArtistProfile);

// PASSWORD RESET
userRouter.post("/reset/send-otp", sendResetOtp);
userRouter.post("/reset/verify", resetPassword);

export default userRouter;
