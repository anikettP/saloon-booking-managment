import express from "express";
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBanner
} from "../controllers/bannerController.js";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// ─── MANAGE BANNERS (Admin / ContentAdmin / SuperAdmin) ───────────────────────

// Standard RESTful routes
router.post("/", protect, authorizeRoles("admin", "contentAdmin", "superAdmin"), upload.fields([
  { name: "image", maxCount: 1 },
  { name: "image_desktop", maxCount: 1 },
  { name: "image_mobile", maxCount: 1 }
]), createBanner);

router.put("/:id", protect, authorizeRoles("admin", "contentAdmin", "superAdmin"), upload.fields([
  { name: "image", maxCount: 1 },
  { name: "image_desktop", maxCount: 1 },
  { name: "image_mobile", maxCount: 1 }
]), updateBanner);

router.delete("/:id", protect, authorizeRoles("admin", "contentAdmin", "superAdmin"), deleteBanner);
router.patch("/:id/toggle", protect, authorizeRoles("admin", "contentAdmin", "superAdmin"), toggleBanner);

// Legacy Compatibility Routes (matches admin/src/pages/Banners.jsx)
// Note: router.use(protect, authorizeRoles(...)) applies to these as well if placed before
router.post("/add", protect, authorizeRoles("admin", "contentAdmin", "superAdmin"), upload.fields([
  { name: "image_desktop", maxCount: 1 },
  { name: "image_mobile", maxCount: 1 }
]), createBanner);

router.post("/update", protect, authorizeRoles("admin", "contentAdmin", "superAdmin"), upload.fields([
  { name: "image_desktop", maxCount: 1 },
  { name: "image_mobile", maxCount: 1 }
]), updateBanner);

router.get("/list", getBanners); // Public or admin
router.post("/remove", protect, authorizeRoles("admin", "contentAdmin", "superAdmin"), deleteBanner);
router.post("/toggle", protect, authorizeRoles("admin", "contentAdmin", "superAdmin"), toggleBanner);

export default router;
