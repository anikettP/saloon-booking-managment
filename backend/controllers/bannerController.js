import Banner from "../models/bannerModel.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const uploadToCld = (buffer, folder = "banners") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => { if (err) reject(err); else resolve(result.secure_url); }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

// ─── GET ALL BANNERS (Public - active only) ───────────────────────────────────
export const getBanners = async (req, res) => {
  try {
    const { type, all } = req.query;
    // 'all' means admin list. if all is false/missing, only show active.
    const query = all === "true" ? {} : { isActive: true };
    if (type) query.type = type;

    const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CREATE BANNER ────────────────────────────────────────────────────────────
export const createBanner = async (req, res) => {
  try {
    // legacy check: link maps to linkUrl
    let { title, subtitle, linkUrl, link, ctaText, type, order } = req.body;
    const finalLink = linkUrl || link || "/salons";

    const bannerData = {
      title: title || "",
      subtitle: subtitle || "",
      linkUrl: finalLink,
      ctaText: ctaText || "Book Now",
      type: type || "hero",
      order: order ? Number(order) : 0
    };

    // Handle generic upload (req.file)
    if (req.file) {
      bannerData.imageUrl = await uploadToCld(req.file.buffer);
    }

    // Handle multi-upload fields (req.files)
    if (req.files) {
      if (req.files.image?.[0]) {
        bannerData.imageUrl = await uploadToCld(req.files.image[0].buffer);
      }
      if (req.files.image_desktop?.[0]) {
        bannerData.imageDesktop = await uploadToCld(req.files.image_desktop[0].buffer);
        // also set fallback if not set
        if(!bannerData.imageUrl) bannerData.imageUrl = bannerData.imageDesktop;
      }
      if (req.files.image_mobile?.[0]) {
        bannerData.imageMobile = await uploadToCld(req.files.image_mobile[0].buffer);
      }
    }

    const banner = await Banner.create(bannerData);
    res.status(201).json({ success: true, banner, message: "Banner created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE BANNER ────────────────────────────────────────────────────────────
export const updateBanner = async (req, res) => {
  try {
    // Support both URL param and legacy body ID
    const id = req.params.id || req.body.id;
    if (!id) return res.status(400).json({ success: false, message: "ID is required" });

    const updates = { ...req.body };
    
    // Legacy mapping
    if (updates.link) updates.linkUrl = updates.link;
    if (updates.active !== undefined) updates.isActive = updates.active;

    // Handle file uploads
    if (req.file) {
      updates.imageUrl = await uploadToCld(req.file.buffer);
    }

    if (req.files) {
      if (req.files.image?.[0]) {
        updates.imageUrl = await uploadToCld(req.files.image[0].buffer);
      }
      if (req.files.image_desktop?.[0]) {
        updates.imageDesktop = await uploadToCld(req.files.image_desktop[0].buffer);
      }
      if (req.files.image_mobile?.[0]) {
        updates.imageMobile = await uploadToCld(req.files.image_mobile[0].buffer);
      }
    }

    const banner = await Banner.findByIdAndUpdate(id, updates, { new: true });
    if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });

    res.json({ success: true, banner, message: "Banner updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE BANNER ────────────────────────────────────────────────────────────
export const deleteBanner = async (req, res) => {
  try {
    const id = req.params.id || req.body.id;
    if (!id) return res.status(400).json({ success: false, message: "ID is required" });

    const deleted = await Banner.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Banner not found" });

    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── TOGGLE BANNER ACTIVE ─────────────────────────────────────────────────────
export const toggleBanner = async (req, res) => {
  try {
    const id = req.params.id || req.body.id;
    if (!id) return res.status(400).json({ success: false, message: "ID is required" });

    const banner = await Banner.findById(id);
    if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });

    banner.isActive = !banner.isActive;
    await banner.save();

    res.json({ success: true, banner, message: `Banner ${banner.isActive ? "activated" : "deactivated"}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
