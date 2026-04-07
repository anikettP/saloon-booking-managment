import express from "express";
import {
  addService,
  getServicesBySalon,
  getAllServices,
  getMyServices,
  updateService,
  deleteService,
  updateServiceWaitTime
} from "../controllers/serviceController.js";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Public: get services for a salon
router.get("/salon/:salonId", getServicesBySalon);

// Salon Owner / Admin
router.post("/", protect, authorizeRoles("salonOwner", "admin"), upload.single("image"), addService);
router.get("/my", protect, authorizeRoles("salonOwner", "admin"), getMyServices);
router.put("/:id", protect, authorizeRoles("salonOwner", "admin"), upload.single("image"), updateService);
router.delete("/:id", protect, authorizeRoles("salonOwner", "admin"), deleteService);
// Artist can update wait time for their services
router.put("/:id/wait-time", protect, authorizeRoles("salonOwner", "admin", "artist"), updateServiceWaitTime);

// Admin
router.get("/all", protect, authorizeRoles("admin"), getAllServices);

export default router;
