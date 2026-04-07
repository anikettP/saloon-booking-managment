import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "SECRET";
console.log("Auth Controller: Using JWT_SECRET:", JWT_SECRET === "SECRET" ? "DEFAULT (SECRET)" : "FROM ENV");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ─── REGISTER ────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, location } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Name, email and password are required" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(400).json({ success: false, message: "Email already registered" });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    // Only allow safe roles on public registration
    const allowedPublicRoles = ["customer", "salonOwner"];
    const assignedRole = allowedPublicRoles.includes(role) ? role : "customer";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: assignedRole,
      phone: phone || "",
      location: location || ""
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(404).json({ success: false, message: "No account found with this email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Account is deactivated. Contact admin." });

    // Logical addition: Strict Artist Guard
    if (user.role === "artist") {
      const Salon = (await import("../models/salonModel.js")).default;
      const activeSalon = await Salon.findOne({ artists: user._id, approved: true });
      if (!activeSalon) {
        return res.status(403).json({
          success: false,
          message: "Access Denied: You have not been registered to an approved Salon. Please ask your Salon Owner to add your email."
        });
      }
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN LOGIN (Legacy for admin panel) ────────────────────────────────────
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check against .env hardcoded credentials
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Find or Create this Admin in DB to ensure 'protect' middleware works
      let admin = await User.findOne({ email: email.toLowerCase() });
      
      if (!admin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        admin = await User.create({
          name: "System Admin",
          email: email.toLowerCase(),
          password: hashedPassword,
          role: "superAdmin"
        });
      } else if (admin.role !== "superAdmin") {
        // Upgrade existing user if they match admin email but have wrong role
        admin.role = "superAdmin";
        await admin.save();
      }

      const token = generateToken(admin);
      return res.json({ success: true, token, role: "superAdmin" });
    }

    // 2. Also allow other DB users with explicit admin role
    const user = await User.findOne({ email: email.toLowerCase(), role: { $in: ["admin", "superAdmin"] } });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = generateToken(user);
        return res.json({ success: true, token, role: user.role });
      }
    }

    return res.json({ success: false, message: "Invalid admin credentials" });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ME (Current user profile) ───────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findById(userId).select("-password");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phone, location } = req.body;

    const updated = await User.findByIdAndUpdate(
      userId,
      { name, phone, location },
      { new: true }
    ).select("-password");

    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ARTIST UPDATES OWN PROFILE ──────────────────────────────────────────────
export const updateArtistProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phone, specialization, portfolio, avatar } = req.body;
    
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (specialization) updateFields.specialization = specialization;
    if (portfolio) updateFields.portfolio = portfolio;
    if (avatar) updateFields.avatar = avatar;

    const updated = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true }
    ).select("-password");

    res.json({ success: true, user: updated, message: "Professional profile updated!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Legacy named exports for backward compatibility with userController consumers
export const loginUser = login;
export const registerUser = register;
