import salonModel from "../models/salonModel.js";

const getCommunityGallery = async (req, res) => {
  try {
    // Fetch all approved salons with images
    const salons = await salonModel.find({ approved: true, images: { $exists: true, $not: { $size: 0 } } })
      .select("name location images _id");

    const galleryItems = [];

    salons.forEach(salon => {
      salon.images.forEach(img => {
        galleryItems.push({
          img,
          salonId: salon._id,
          salonName: salon.name,
          location: salon.location
        });
      });
    });

    // Randomize for fresh community feel
    const shuffledGallery = galleryItems.sort(() => 0.5 - Math.random());

    res.json({
      success: true,
      gallery: shuffledGallery.slice(0, 50) // Return top 50 shuffled looks
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { getCommunityGallery };
