import express from "express";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import {
  createReview,
  replyToReview,
  getSalonReviews,
  getDashboardReviews
} from "../controllers/reviewController.js";

const router = express.Router();

// ─── PUBLIC ───────────────────────────────────────────────────────────────────
// Get all public reviews for a salon
router.get("/salon/:salonId", getSalonReviews);

// ─── CUSTOMER ─────────────────────────────────────────────────────────────────
// Leave a review
router.post("/", protect, createReview);

// ─── SALON OWNER ──────────────────────────────────────────────────────────────
// Relpy to a review
router.put("/:id/reply", protect, authorizeRoles("salonOwner", "admin"), replyToReview);

// Get reviews for owner dashboard
router.get("/dashboard", protect, authorizeRoles("salonOwner", "admin"), getDashboardReviews);

export default router;
