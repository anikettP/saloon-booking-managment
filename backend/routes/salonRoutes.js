import express from "express";
import {
  createSalon,
  getSalons,
  getSalonById,
  updateSalon,
  getMySalon,
  addArtist,
  removeArtist
} from "../controllers/salonController.js";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Public
router.get("/", getSalons);
router.get("/:id", getSalonById);

// Salon Owner / Admin
router.post("/", protect, authorizeRoles("salonOwner", "admin"), upload.array("images", 5), createSalon);
router.get("/owner/my-salon", protect, authorizeRoles("salonOwner", "admin"), getMySalon);
router.put("/:id", protect, authorizeRoles("salonOwner", "admin"), upload.array("images", 5), updateSalon);
router.post("/artist/add", protect, authorizeRoles("salonOwner", "admin"), addArtist);
router.post("/artist/remove", protect, authorizeRoles("salonOwner", "admin"), removeArtist);

export default router;