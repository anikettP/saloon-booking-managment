// backend/models/bannerModel.js
import mongoose from 'mongoose'

const bannerSchema = new mongoose.Schema({
  // new fields for desktop & mobile
  image_desktop: { type: String, default: '' }, // public URL for desktop
  image_mobile: { type: String, default: '' },  // public URL for mobile
  // keep legacy image (optional)
  image: { type: String, default: '' },

  title: { type: String, default: '' },
  link: { type: String, default: '' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  date: { type: Number, required: true }
})

const bannerModel = mongoose.models.banner || mongoose.model('banner', bannerSchema)
export default bannerModel
