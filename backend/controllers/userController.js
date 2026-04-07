// backend/controllers/userController.js
// Kept for backward compatibility - delegates to authController
export { login as loginUser, register as registerUser, adminLogin, getMe } from "./authController.js";
