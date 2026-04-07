import Booking from "../models/bookingModel.js";
import Salon from "../models/salonModel.js";
import Service from "../models/serviceModel.js";
import { sendBookingConfirmation, sendCancellationNotice } from "../services/emailService.js";

// ─── Helper: generate time slots for a day ────────────────────────────────────
const generateTimeSlots = (startHour = 9, endHour = 20, durationMinutes = 60) => {
  const slots = [];
  let current = startHour * 60; // convert to minutes
  const end = endHour * 60;

  while (current + durationMinutes <= end) {
    const startH = Math.floor(current / 60);
    const startM = current % 60;
    const endTime = current + durationMinutes;
    const endH = Math.floor(endTime / 60);
    const endM = endTime % 60;

    const fmt = (h, m) => {
      const period = h < 12 ? "AM" : "PM";
      const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
    };

    slots.push(`${fmt(startH, startM)} - ${fmt(endH, endM)}`);
    current += durationMinutes;
  }
  return slots;
};

// ─── GET AVAILABLE SLOTS ─────────────────────────────────────────────────────
// GET /api/bookings/slots?salonId=xxx&date=2024-01-15&artistId=yyy
export const getAvailableSlots = async (req, res) => {
  try {
    const { salonId, date, artistId } = req.query;

    if (!salonId || !date)
      return res.status(400).json({ success: false, message: "salonId and date are required" });

    const salon = await Salon.findById(salonId);
    if (!salon)
      return res.status(404).json({ success: false, message: "Salon not found" });

    // Generate all possible slots for the salon
    const [startH, startM] = (salon.workingHours?.start || "09:00").split(":").map(Number);
    const [endH, endM] = (salon.workingHours?.end || "20:00").split(":").map(Number);
    const duration = salon.slotDuration || 60;

    const allSlots = generateTimeSlots(startH, endH, duration);

    // Find already booked slots for that date + salon (+ optional artist filter)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      salon: salonId,
      date: { $gte: startOfDay, $lte: endOfDay },
      $or: [
        { status: { $nin: ["cancelled", "payment_pending"] } },
        { 
          status: "payment_pending", 
          createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) } 
        }
      ]
    };
    if (artistId) query.artist = artistId;

    const bookedBookings = await Booking.find(query).select("timeSlot");
    const bookedSlots = bookedBookings.map(b => b.timeSlot);

    const availableSlots = allSlots.map(slot => ({
      slot,
      available: !bookedSlots.includes(slot)
    }));

    res.json({ success: true, slots: availableSlots, bookedSlots });
  } catch (error) {
    console.error("getAvailableSlots error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CREATE BOOKING ───────────────────────────────────────────────────────────
export const createBooking = async (req, res) => {
  try {
    const { salonId, serviceId, artistId, date, timeSlot, notes, customerPhone } = req.body;

    if (!salonId || !serviceId || !date || !timeSlot)
      return res.status(400).json({ success: false, message: "salonId, serviceId, date and timeSlot are required" });

    // 1. Verify salon is approved
    const salon = await Salon.findById(salonId);
    if (!salon || !salon.approved)
      return res.status(404).json({ success: false, message: "Salon not found or not approved" });

    // 2. Verify service exists
    const service = await Service.findById(serviceId);
    if (!service)
      return res.status(404).json({ success: false, message: "Service not found" });

    // 3. Check for double booking
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const conflictQuery = {
      salon: salonId,
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      $or: [
        { status: { $nin: ["cancelled", "payment_pending"] } },
        { 
          status: "payment_pending", 
          createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) } 
        }
      ]
    };
    if (artistId) conflictQuery.artist = artistId;

    const conflict = await Booking.findOne(conflictQuery);
    if (conflict)
      return res.status(409).json({ success: false, message: "This time slot is already booked. Please choose another slot." });

    // 4. Create booking
    const isOnline = req.body.paymentMethod === "Online";
    const paymentMethod = req.body.paymentMethod || "At Salon";
    const pointsToRedeem = parseInt(req.body.pointsToRedeem) || 0;

    let finalPrice = service.price;
    let redemptionDiscount = 0;

    // ─── Phase 8: Point Redemption Logic ──────────────────────────────────────
    if (pointsToRedeem > 0) {
      const User = (await import("../models/userModel.js")).default;
      const user = await User.findById(req.user._id);
      
      if (user && user.loyaltyPoints >= pointsToRedeem) {
        redemptionDiscount = Math.floor(pointsToRedeem / 10); // 10 points = 1 INR
        // Cap discount at 50% of original price
        if (redemptionDiscount > (service.price * 0.5)) {
          redemptionDiscount = Math.floor(service.price * 0.5);
        }
        
        finalPrice -= redemptionDiscount;
        user.loyaltyPoints -= (redemptionDiscount * 10); // Deduct actual points used after capping
        await user.save();
      }
    }

    let razorpayOrderId = "";
    let razorpayOrder = null;

    if (isOnline) {
      const Razorpay = (await import("razorpay")).default;
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: finalPrice * 100, // paise
        currency: "INR",
        receipt: `receipt_booking_${Date.now()}`,
        payment_capture: 1,
      };
      
      razorpayOrder = await razorpay.orders.create(options);
      razorpayOrderId = razorpayOrder.id;
    }

    const booking = await Booking.create({
      user: req.user._id,
      salon: salonId,
      service: serviceId,
      artist: artistId || null,
      date: new Date(date),
      timeSlot,
      paymentMethod,
      paymentStatus: isOnline ? "payment_pending" : "pending", 
      razorpayOrderId,
      price: finalPrice,
      serviceName: service.name,
      customerName: req.user.name,
      customerPhone: customerPhone || req.user.phone || "",
      notes: notes || "",
      status: isOnline ? "payment_pending" : "pending",
      pointsRedeemed: redemptionDiscount * 10
    });

    const populated = await Booking.findById(booking._id)
      .populate("salon", "name location phone")
      .populate("service", "name price duration category")
      .populate("artist", "name email phone");

    // Real-time notification (Only for 'At Salon' bookings. Online bookings notify after payment)
    const io = req.app.get("io");
    if (io && !isOnline) { 
      if (artistId) io.emit(`artist_${artistId}_new_booking`, populated);
      io.emit(`salon_${salonId}_new_booking`, populated);
    }

    // Automate Email Confirmation for 'At Salon' bookings (Online bookings are handled after payment verification)
    if (!isOnline && populated.user?.email) {
      sendBookingConfirmation(populated).catch(console.error);
    }

    res.status(201).json({ 
      success: true, 
      booking: populated,
      razorpayOrder: isOnline ? razorpayOrder : null 
    });
  } catch (error) {
    console.error("createBooking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET MY BOOKINGS (Customer) ───────────────────────────────────────────────
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("salon", "name location phone bannerImage")
      .populate("service", "name price duration category image")
      .populate("artist", "name email phone")
      .sort({ date: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SALON BOOKINGS (Salon Owner / Admin) ─────────────────────────────────
export const getSalonBookings = async (req, res) => {
  try {
    const { salonId } = req.params;

    // If salonOwner, ensure they own this salon
    if (req.user.role === "salonOwner") {
      const Salon = (await import("../models/salonModel.js")).default;
      const salon = await Salon.findById(salonId);
      if (!salon || String(salon.owner) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: "Not authorized for this salon" });
      }
    }

    const bookings = await Booking.find({ salon: salonId })
      .populate("user", "name email phone loyaltyTier totalPointsEarned")
      .populate("service", "name price duration")
      .populate("artist", "name email phone")
      .sort({ date: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ARTIST BOOKINGS ──────────────────────────────────────────────────────
export const getArtistBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ artist: req.user._id })
      .populate("user", "name email phone")
      .populate("salon", "name location")
      .populate("service", "name price duration")
      .sort({ date: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ALL BOOKINGS (Admin) ─────────────────────────────────────────────────
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email phone")
      .populate("salon", "name location")
      .populate("service", "name price duration")
      .populate("artist", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE BOOKING STATUS ────────────────────────────────────────────────────
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, artistMessage } = req.body;

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status" });

    const originalBooking = await Booking.findById(id);
    if (!originalBooking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    const wasCompleted = originalBooking.status === "completed";
    const isCompleting = status === "completed";

    const updateData = { status };
    if (artistMessage !== undefined) updateData.artistMessage = artistMessage;

    // ─── Phase 8: Loyalty Points Awarding ──────────────────────────────────────
    if (isCompleting && !wasCompleted) {
      const pointsToEarn = Math.floor(originalBooking.price * 0.1); // 10% points
      updateData.pointsEarned = pointsToEarn;

      // Update User Loyalty Account
      const User = (await import("../models/userModel.js")).default;
      const user = await User.findById(originalBooking.user);
      if (user) {
        user.loyaltyPoints += pointsToEarn;
        user.totalPointsEarned += pointsToEarn;
        
        // Recalculate Tier
        if (user.totalPointsEarned >= 5000) user.loyaltyTier = "Gold";
        else if (user.totalPointsEarned >= 2000) user.loyaltyTier = "Silver";
        
        await user.save();
      }
    }

    const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true })
      .populate("salon", "name")
      .populate("service", "name")
      .populate("user", "name email loyaltyTier loyaltyPoints");

    // Real-time notification: let the user know
    const io = req.app.get("io");
    if (io && booking.user) {
      io.emit(`user_${booking.user._id}_booking_update`, booking);
      if (isCompleting && !wasCompleted) {
        io.emit(`user_${booking.user._id}_loyalty_update`, {
          pointsEarned: updateData.pointsEarned,
          totalPoints: booking.user.loyaltyPoints,
          tier: booking.user.loyaltyTier
        });
      }
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error("updateBookingStatus error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CANCEL BOOKING (Customer can cancel their own) ──────────────────────────
export const cancelMyBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, user: req.user._id })
      .populate("salon", "name location cancellationWindow")
      .populate("user", "name email");

    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.status === "completed")
      return res.status(400).json({ success: false, message: "Cannot cancel a completed booking" });

    // --- CANCELLATION WINDOW CHECK ---
    const appointmentDate = new Date(booking.date);
    const [startH, startM] = booking.timeSlot.split(" - ")[0].split(":").map(s => s.trim());
    let hour = parseInt(startH);
    if (booking.timeSlot.includes("PM") && hour !== 12) hour += 12;
    if (booking.timeSlot.includes("AM") && hour === 12) hour = 0;
    
    appointmentDate.setHours(hour, parseInt(startM), 0, 0);

    const windowHours = booking.salon?.cancellationWindow || 2;
    const limitDate = new Date(appointmentDate.getTime() - windowHours * 60 * 60 * 1000);

    if (Date.now() > limitDate.getTime()) {
      return res.status(400).json({ 
        success: false, 
        message: `Cancellation failed. Bookings must be cancelled at least ${windowHours} hours in advance.` 
      });
    }

    booking.status = "cancelled";
    await booking.save();

    // Automate Cancellation Email
    if (booking.user?.email) {
      sendCancellationNotice(booking).catch(console.error);
    }

    res.json({ success: true, message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Legacy named export for backward compatibility ────────────────────────────
export const getUserBookings = getMyBookings;