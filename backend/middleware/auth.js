import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Protect: verifies JWT and attaches req.user
export const protect = async (req, res, next) => {
  let token;

  // Support both "Bearer <token>" header and legacy plain "token" header
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.headers.token) {
    token = req.headers.token;
  }

  if (!token) {
    console.warn("Auth Middleware: Token missing in request headers.");
    return res.status(401).json({ success: false, msg: "Not authorized. Token missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET");
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      console.warn(`Auth Middleware: User not found in DB for ID: ${decoded.id}`);
      return res.status(401).json({ success: false, msg: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware: JWT Verification failed:", error.message);
    return res.status(401).json({ success: false, msg: "Invalid or expired token" });
  }
};

// Optional protect: doesn't fail if no token, just attaches null
export const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.headers.token) {
    token = req.headers.token;
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET");
    req.user = await User.findById(decoded.id).select("-password");
  } catch {
    req.user = null;
  }
  next();
};

// Legacy default export for backward compatibility
export default protect;