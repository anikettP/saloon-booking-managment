// backend/routes/paymentRoute.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import { initiateSalonRegistration, verifySalonRegistration, verifyBookingPayment, updateBookingPaymentStatus } from "../controllers/paymentController.js";

const router = express.Router();

// Only Salon Owners can register a new salon and pay the fee
router.post("/salon-initiate", protect, authorizeRoles("salonOwner"), initiateSalonRegistration);
router.post("/salon-verify", protect, authorizeRoles("salonOwner"), verifySalonRegistration);
router.post("/booking-verify", protect, verifyBookingPayment);

// Owners/Admins manually confirm cash/at-salon payments
router.put("/manual-confirm/:bookingId", protect, authorizeRoles("admin", "salonOwner"), updateBookingPaymentStatus);

export default router;
