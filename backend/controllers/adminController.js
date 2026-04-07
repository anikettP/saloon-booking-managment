import Salon from "../models/salonModel.js";
import User from "../models/userModel.js";
import Booking from "../models/bookingModel.js";
import Service from "../models/serviceModel.js";

// ─── GET ALL SALONS (Admin) ──────────────────────────────────────────────────
export const getAllSalons = async (req, res) => {
  try {
    const { approved } = req.query;
    const query = {};
    if (approved === "true") query.approved = true;
    if (approved === "false") query.approved = false;

    const salons = await Salon.find(query)
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, salons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── APPROVE / REJECT SALON ──────────────────────────────────────────────────
export const approveSalon = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const salon = await Salon.findByIdAndUpdate(
      id,
      { approved: approved !== false }, // default true
      { new: true }
    ).populate("owner", "name email");

    if (!salon) return res.status(404).json({ success: false, message: "Salon not found" });

    res.json({ success: true, salon, message: `Salon ${salon.approved ? "approved" : "rejected"}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ALL USERS ───────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, users, totalUsers: users.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE USER ROLE ────────────────────────────────────────────────────────
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["customer", "salonOwner", "admin", "superAdmin", "contentAdmin", "artist"];
    if (!validRoles.includes(role))
      return res.status(400).json({ success: false, message: "Invalid role" });

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── TOGGLE USER ACTIVE STATUS ────────────────────────────────────────────────
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `User ${user.isActive ? "activated" : "deactivated"}`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalSalons, pendingSalons, totalBookings] = await Promise.all([
      User.countDocuments(),
      Salon.countDocuments({ approved: true }),
      Salon.countDocuments({ approved: false }),
      Booking.countDocuments()
    ]);

    const bookingStats = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const statusMap = {};
    bookingStats.forEach(s => { statusMap[s._id] = s.count; });

    const recentBookings = await Booking.find()
      .populate("user", "name email")
      .populate("salon", "name")
      .populate("service", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalSalons,
        pendingSalons,
        totalBookings,
        bookingsByStatus: statusMap
      },
      recentBookings,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE SALON PAYMENT STATUS (Admin) ──────────────────────────────────────
export const updateSalonPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!['paid', 'failed', 'pending'].includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: "Invalid payment status" });
    }

    const salon = await Salon.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    );

    if (!salon) return res.status(404).json({ success: false, message: "Salon not found" });

    res.json({ success: true, salon, message: `Payment status updated to ${paymentStatus}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE SALON ─────────────────────────────────────────────────────────────
export const deleteSalon = async (req, res) => {
  try {
    const { id } = req.params;
    await Salon.findByIdAndDelete(id);
    res.json({ success: true, message: "Salon deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};