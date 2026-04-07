import express from "express";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import { getSalonAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

// Only Salon Owners can access their analytics
router.get("/salon/:salonId", protect, authorizeRoles("salonOwner"), getSalonAnalytics);

export default router;
