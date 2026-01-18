// backend/middleware/authUser.js
import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  // Accept token from:  token: <token>  OR  Authorization: Bearer <token>
  const token =
    req.headers.token ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[1]);

  if (!token) {
    return res.json({
      success: false,
      message: "Not Authorized Login Again",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // user id may be stored under different keys in your token
    const userId =
      decoded.id ||
      decoded._id ||
      decoded.userId ||
      decoded.user ||
      null;

    if (!userId) {
      return res.json({
        success: false,
        message: "Invalid token: user id missing",
      });
    }

    // old controllers still use req.body.userId
    req.body.userId = userId;

    // new style – everything else should read from req.user._id
    req.user = {
      _id: userId,
      ...(decoded.name ? { name: decoded.name } : {}),
      ...(decoded.fullName ? { fullName: decoded.fullName } : {}),
      ...(decoded.email ? { email: decoded.email } : {}),
      ...(decoded.isAdmin ? { isAdmin: decoded.isAdmin } : {}),
    };

    next();
  } catch (error) {
    console.log("Auth Middleware Error:", error);
    return res.json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};

export default authUser;
