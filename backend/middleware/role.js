/**
 * RBAC Middleware
 * Usage: authorizeRoles("admin", "contentAdmin")  -> allows admin OR contentAdmin
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.warn("Authorize Middleware: req.user is null.");
      return res.status(401).json({ success: false, msg: "Not authenticated" });
    }
    // superAdmin is a "God" role that satisfies any role requirement listed
    if (req.user.role === "superAdmin" || roles.includes(req.user.role)) {
      return next();
    }

    console.warn(`Authorize Middleware: Role mismatch. Required: [${roles}]. User Role: ${req.user.role}`);
    return res.status(403).json({
      success: false,
      msg: `Access denied. Required role(s): ${roles.join(", ")}. Your role: ${req.user.role}`
    });
    next();
  };
};