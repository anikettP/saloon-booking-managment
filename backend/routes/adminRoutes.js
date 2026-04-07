import express from "express";
import {
  getAllSalons,
  approveSalon,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getDashboardStats,
  deleteSalon,
  updateSalonPaymentStatus
} from "../controllers/adminController.js";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";

const router = express.Router();

// All admin routes require admin role
router.use(protect, authorizeRoles("admin"));

// Dashboard
router.get("/stats", getDashboardStats);

// Salon management
router.get("/salons", getAllSalons);
router.put("/salons/:id/approve", approveSalon);
router.put("/salons/:id/payment", updateSalonPaymentStatus);
router.delete("/salons/:id", deleteSalon);

// User management
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.patch("/users/:id/toggle", toggleUserStatus);

export default router;