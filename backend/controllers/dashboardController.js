// backend/controllers/dashboardController.js
// Legacy controller kept for backward compat - now delegates to adminController
import { getDashboardStats } from "./adminController.js";
import adminAuth from "../middleware/adminAuth.js";

export { getDashboardStats };