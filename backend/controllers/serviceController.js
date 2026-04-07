import Service from "../models/serviceModel.js";
import Salon from "../models/salonModel.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const uploadImage = (buffer, folder = "services") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => { if (err) reject(err); else resolve(result.secure_url); }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

// ─── ADD SERVICE (Salon Owner / Admin) ───────────────────────────────────────
export const addService = async (req, res) => {
  try {
    const { name, description, category, price, duration, salonId } = req.body;

    if (!name || !price || !duration)
      return res.status(400).json({ success: false, message: "Name, price and duration are required" });

    // Determine salon
    let targetSalonId = salonId;
    const isAdmin = req.user.role === "admin" || req.user.role === "superAdmin";

    if (req.user.role === "salonOwner") {
      const salon = await Salon.findOne({ owner: req.user._id });
      if (!salon) return res.status(404).json({ success: false, message: "Register your salon first" });
      targetSalonId = salon._id;
    } else if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to add services" });
    }

    if (!targetSalonId)
      return res.status(400).json({ success: false, message: "salonId is required" });

    let image = "";
    if (req.file) {
      image = await uploadImage(req.file.buffer, "service_images");
    }

    const service = await Service.create({
      name,
      description: description || "",
      category: category || "General",
      price: Number(price),
      duration: Number(duration),
      salon: targetSalonId,
      image
    });

    res.status(201).json({ success: true, service });
  } catch (error) {
    console.error("addService error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SERVICES FOR A SALON ─────────────────────────────────────────────────
export const getServicesBySalon = async (req, res) => {
  try {
    const { salonId } = req.params;
    const services = await Service.find({ salon: salonId, isAvailable: true })
      .sort({ category: 1, name: 1 });
    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ALL SERVICES (Admin) ─────────────────────────────────────────────────
export const getAllServices = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) {
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: sanitizedSearch, $options: "i" };
    }

    const services = await Service.find(query)
      .populate("salon", "name location")
      .sort({ createdAt: -1 });
    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET MY SALON SERVICES (Salon Owner) ─────────────────────────────────────
export const getMyServices = async (req, res) => {
  try {
    const salon = await Salon.findOne({ owner: req.user._id });
    if (!salon) return res.status(404).json({ success: false, message: "No salon found" });

    const services = await Service.find({ salon: salon._id }).sort({ category: 1 });
    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE SERVICE ───────────────────────────────────────────────────────────
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id).populate("salon");
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    // Authorization
    const isAdmin = req.user.role === "admin" || req.user.role === "superAdmin";
    const isOwner = String(service.salon.owner) === String(req.user._id);

    if (!isAdmin && !isOwner)
      return res.status(403).json({ success: false, message: "Not authorized" });

    const updates = { ...req.body };
    if (req.file) {
      updates.image = await uploadImage(req.file.buffer, "service_images");
    }

    const updated = await Service.findByIdAndUpdate(id, updates, { new: true });
    res.json({ success: true, service: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE SERVICE ───────────────────────────────────────────────────────────
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id).populate("salon");
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    const isAdmin = req.user.role === "admin" || req.user.role === "superAdmin";
    const isOwner = String(service.salon.owner) === String(req.user._id);

    if (!isAdmin && !isOwner)
      return res.status(403).json({ success: false, message: "Not authorized" });

    await service.deleteOne();
    res.json({ success: true, message: "Service deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE SERVICE WAIT TIME (Artist / Salon Owner) ──────────────────────────
export const updateServiceWaitTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentWaitTime } = req.body;

    if (currentWaitTime === undefined || isNaN(Number(currentWaitTime))) {
      return res.status(400).json({ success: false, message: "Valid currentWaitTime in minutes is required" });
    }

    const service = await Service.findById(id).populate("salon");
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    // Authorization: Must be the Salon Owner or an Assigned Artist
    const isOwner = String(service.salon.owner) === String(req.user._id);
    const isArtist = service.salon.artists && service.salon.artists.some(artistId => String(artistId) === String(req.user._id));

    if (req.user.role !== "admin" && !isOwner && !isArtist) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this service wait time." });
    }

    service.currentWaitTime = Number(currentWaitTime);
    await service.save();

    res.json({ success: true, service, message: `Wait time updated to ${currentWaitTime} mins` });
  } catch (error) {
    console.error("updateWaitTime error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
