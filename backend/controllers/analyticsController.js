import Booking from "../models/bookingModel.js";
import Salon from "../models/salonModel.js";
import mongoose from "mongoose";

/**
 * Get Analytics for a Salon Owner
 */
export const getSalonAnalytics = async (req, res) => {
  try {
    const { salonId } = req.params;

    // Verify ownership
    const salon = await Salon.findById(salonId);
    if (!salon || String(salon.owner) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to see analytics for this salon." });
    }

    const allBookings = await Booking.find({ salon: salonId });

    // 1. Revenue Metrics
    const paidBookings = allBookings.filter(b => b.paymentStatus === "paid" || b.status === "completed" || (b.paymentMethod === "At Salon" && b.status === "completed"));
    const netRevenue = paidBookings.reduce((sum, b) => sum + (b.price || 0), 0);

    // 2. Booking Stats
    const totalBookings = allBookings.length;
    const completedCount = allBookings.filter(b => b.status === "completed").length;
    const cancelledCount = allBookings.filter(b => b.status === "cancelled").length;
    
    const successRate = totalBookings > 0 ? Math.round((completedCount / (totalBookings - allBookings.filter(b => b.status === "pending").length || 1)) * 100) : 0;

    // 3. Top Services
    const serviceCounts = {};
    allBookings.forEach(b => {
      serviceCounts[b.serviceName] = (serviceCounts[b.serviceName] || 0) + 1;
    });
    
    const topServices = Object.entries(serviceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 4. Monthly Trend (Last 6 Months)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      
      const monBookings = allBookings.filter(b => {
        const bDate = new Date(b.date);
        return bDate.getMonth() === d.getMonth() && bDate.getFullYear() === year;
      });
      
      monthlyStats.push({
        month,
        bookings: monBookings.length,
        revenue: monBookings.reduce((s, b) => s + (b.price || 0), 0)
      });
    }

    res.json({
      success: true,
      stats: {
        netRevenue,
        totalBookings,
        completedCount,
        cancelledCount,
        successRate,
        topServices,
        monthlyStats
      }
    });

  } catch (error) {
    console.error("getSalonAnalytics Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
