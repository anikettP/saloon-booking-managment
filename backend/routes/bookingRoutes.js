import express from "express";
import {
  createBooking,
  getMyBookings,
  getAvailableSlots,
  getSalonBookings,
  getArtistBookings,
  getAllBookings,
  updateBookingStatus,
  cancelMyBooking
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";

const router = express.Router();

// Public: check available slots
router.get("/slots", getAvailableSlots);

// Customer
router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.put("/cancel/:id", protect, cancelMyBooking);

// Artist
router.get("/artist", protect, authorizeRoles("artist", "salonOwner", "admin"), getArtistBookings);

// Salon Owner / Admin
router.get("/salon/:salonId", protect, authorizeRoles("salonOwner", "admin"), getSalonBookings);
router.put("/status/:id", protect, authorizeRoles("salonOwner", "admin"), updateBookingStatus);

// Admin
router.get("/all", protect, authorizeRoles("admin"), getAllBookings);

export default router;