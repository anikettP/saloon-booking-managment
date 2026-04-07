import Salon from "../models/salonModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const uploadToCloudinary = (buffer, folder = "saloons") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ─── CREATE SALON (Salon Owner) ───────────────────────────────────────────────
export const createSalon = async (req, res) => {
  try {
    const {
      name, description, location, address, city, state, pincode,
      phone, email, categories, workingHours, slotDuration, workingDays, mapLink
    } = req.body;

    if (!name || !location || !city || !mapLink)
      return res.status(400).json({ success: false, message: "Name, Location, City, and Map Link are required for precise mapping." });

    // Check if owner already has a salon
    const existing = await Salon.findOne({ owner: req.user._id });
    if (existing)
      return res.status(400).json({ success: false, message: "You already have a registered salon" });

    let images = [];
    if (req.files?.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, "salon_images");
        images.push(url);
      }
    }

    const salon = await Salon.create({
      name,
      description: description || "",
      location,
      address: address || "",
      city: city || "",
      mapLink: mapLink || "",
      state: state || "",
      pincode: pincode || "",
      phone: phone || "",
      email: email || "",
      owner: req.user._id,
      categories: categories ? (Array.isArray(categories) ? categories : JSON.parse(categories)) : [],
      images,
      workingHours: workingHours ? JSON.parse(workingHours) : { start: "09:00", end: "20:00" },
      slotDuration: slotDuration ? Number(slotDuration) : 60,
      workingDays: workingDays ? (Array.isArray(workingDays) ? workingDays : JSON.parse(workingDays)) : ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      approved: false
    });

    res.status(201).json({ success: true, salon, message: "Salon registered! Awaiting admin approval." });
  } catch (error) {
    console.error("createSalon error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ALL APPROVED SALONS (Public) ────────────────────────────────────────
export const getSalons = async (req, res) => {
  try {
    const { location, category, search, featured } = req.query;
    const query = { approved: true, isActive: true };

    if (location) query.location = { $regex: location, $options: "i" };
    if (category) query.categories = { $in: [category] };
    if (featured === "true") query.featured = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ];
    }

    const salons = await Salon.find(query)
      .populate("owner", "name email phone")
      .sort({ featured: -1, rating: -1, createdAt: -1 });

    res.json({ success: true, salons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SINGLE SALON ─────────────────────────────────────────────────────────
export const getSalonById = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id)
      .populate("owner", "name email phone")
      .populate("artists", "name email phone avatar");

    if (!salon)
      return res.status(404).json({ success: false, message: "Salon not found" });

    // Include services
    const Service = (await import("../models/serviceModel.js")).default;
    const services = await Service.find({ salon: salon._id, isAvailable: true });

    res.json({ success: true, salon, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE SALON (Owner or Admin) ───────────────────────────────────────────
export const updateSalon = async (req, res) => {
  try {
    const { id } = req.params;
    const salon = await Salon.findById(id);

    if (!salon)
      return res.status(404).json({ success: false, message: "Salon not found" });

    if (req.user.role !== "admin" && String(salon.owner) !== String(req.user._id))
      return res.status(403).json({ success: false, message: "Not authorized" });

    const updates = { ...req.body };
    if (updates.categories && typeof updates.categories === "string")
      updates.categories = JSON.parse(updates.categories);
    if (updates.workingHours && typeof updates.workingHours === "string")
      updates.workingHours = JSON.parse(updates.workingHours);
    if (updates.workingDays && typeof updates.workingDays === "string")
      updates.workingDays = JSON.parse(updates.workingDays);

    // Upload new images if provided
    if (req.files?.length > 0) {
      const newUrls = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, "salon_images");
        newUrls.push(url);
      }
      updates.images = [...(salon.images || []), ...newUrls];
    }

    const updated = await Salon.findByIdAndUpdate(id, updates, { new: true });
    res.json({ success: true, salon: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET MY SALON (Salon Owner) ───────────────────────────────────────────────
export const getMySalon = async (req, res) => {
  try {
    const salon = await Salon.findOne({ owner: req.user._id })
      .populate("artists", "name email phone");

    if (!salon)
      return res.status(404).json({ success: false, message: "You don't have a salon yet" });

    const Service = (await import("../models/serviceModel.js")).default;
    const services = await Service.find({ salon: salon._id });

    res.json({ success: true, salon, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADD ARTIST TO SALON ─────────────────────────────────────────────────────
export const addArtist = async (req, res) => {
  try {
    const { salonId, artistEmail } = req.body;

    const salon = await Salon.findById(salonId);
    if (!salon)
      return res.status(404).json({ success: false, message: "Salon not found" });

    const isOwner = String(salon.owner) === String(req.user._id);
    const isAdmin = req.user.role === "admin" || req.user.role === "superAdmin";

    if (!isOwner && !isAdmin)
      return res.status(403).json({ success: false, message: "Not authorized" });

    const artist = await User.findOne({ email: artistEmail });
    if (!artist)
      return res.status(404).json({ success: false, message: "User not found with this email" });

    // Update user's role to artist and link to salon
    artist.role = "artist";
    artist.salon = salon._id;
    await artist.save();

    if (!salon.artists.includes(artist._id)) {
      salon.artists.push(artist._id);
      await salon.save();
    }

    res.json({ success: true, message: "Artist added to salon", artist: { _id: artist._id, name: artist.name, email: artist.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SALONS BY LOCATION (legacy) ─────────────────────────────────────────
export const getSalonsByLocation = getSalons;