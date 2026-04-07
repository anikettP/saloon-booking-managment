// backend/middleware/adminAuth.js
// Legacy middleware - now supports both old string-signed token and new JWT tokens
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.json({ success: false, message: "Not Authorized. Login Again" });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    // Legacy: token was signed as email+password string
    if (typeof token_decode === "string") {
      if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
        return res.json({ success: false, message: "Not Authorized. Login Again" });
      }
      return next();
    }

    // New: token has id+role payload
    if (token_decode?.id) {
      const user = await User.findById(token_decode.id);
      if (user && (user.role === "admin" || user.role === "superAdmin" || user.role === "contentAdmin")) {
        req.user = user;
        return next();
      }
    }

    return res.json({ success: false, message: "Not Authorized. Login Again" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default adminAuth;
