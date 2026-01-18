import banner2Model from "../models/banner2Model.js";
import { v2 as cloudinary } from "cloudinary";

// Add or Update Banner2
const addBanner2 = async (req, res) => {
    try {
        const image1 = req.files.imageDesktop && req.files.imageDesktop[0];
        const image2 = req.files.imageMobile && req.files.imageMobile[0];

        if (!image1 || !image2) {
            return res.json({ success: false, message: "Both Desktop and Mobile images are required" });
        }

        // Upload to Cloudinary
        const imageDesktop = await cloudinary.uploader.upload(image1.path, { resource_type: "image" });
        const imageMobile = await cloudinary.uploader.upload(image2.path, { resource_type: "image" });

        // Check if a banner already exists
        const existingBanner = await banner2Model.findOne({});

        if (existingBanner) {
            // Update existing
            await banner2Model.findByIdAndUpdate(existingBanner._id, {
                imageDesktop: imageDesktop.secure_url,
                imageMobile: imageMobile.secure_url
            });
        } else {
            // Create new
            const banner = new banner2Model({
                imageDesktop: imageDesktop.secure_url,
                imageMobile: imageMobile.secure_url
            });
            await banner.save();
        }

        res.json({ success: true, message: "Banner 2 Updated Successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const getBanner2 = async (req, res) => {
    try {
        const banner = await banner2Model.findOne({});
        res.json({ success: true, banner });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addBanner2, getBanner2 };