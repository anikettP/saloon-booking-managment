// backend/controllers/bannerController.js
import Banner from '../models/bannerModel.js'
import cloudinary from 'cloudinary'
import fs from 'fs'

// ✅ UPDATED: Max limit set to 6
const MAX_BANNERS = 6

// Helper to upload one file if present
async function uploadFile(filePath) {
  if (!filePath) return ''
  const uploaded = await cloudinary.v2.uploader.upload(filePath, { folder: 'banners' })
  try { fs.unlinkSync(filePath) } catch (e) {}
  return uploaded.secure_url
}

// Add new banner
export const addBanner = async (req, res) => {
  try {
    const total = await Banner.countDocuments()
    if (total >= MAX_BANNERS) {
      return res.json({ success: false, message: `Maximum ${MAX_BANNERS} banners allowed` })
    }

    let imageDesktop = req.body.image_desktop || ''
    let imageMobile = req.body.image_mobile || ''
    let imageLegacy = req.body.image || ''

    // Handle files
    if (req.files) {
      if (req.files['image_desktop'] && req.files['image_desktop'][0]) {
        imageDesktop = await uploadFile(req.files['image_desktop'][0].path)
      }
      if (req.files['image_mobile'] && req.files['image_mobile'][0]) {
        imageMobile = await uploadFile(req.files['image_mobile'][0].path)
      }
      if (req.files['image'] && req.files['image'][0]) {
        imageLegacy = await uploadFile(req.files['image'][0].path)
      }
    }

    // Requirement: Must have at least one image source
    if (!imageDesktop && !imageMobile && !imageLegacy) {
      return res.json({ success: false, message: 'No banner image provided' })
    }

    const count = await Banner.countDocuments()
    
    const banner = new Banner({
      image_desktop: imageDesktop,
      image_mobile: imageMobile,
      image: imageLegacy,
      title: req.body.title || '',
      link: req.body.link || '', 
      order: parseInt(req.body.order || count),
      active: req.body.active !== undefined ? (req.body.active === 'true' || req.body.active === true) : true,
      date: Date.now()
    })

    await banner.save()
    return res.json({ success: true, message: 'Banner added', banner })

  } catch (err) {
    console.error('addBanner error', err)
    return res.json({ success: false, message: err.message || 'Server error' })
  }
}

// List banners
export const listBanners = async (req, res) => {
  try {
    const banners = await Banner.find({}).sort({ order: 1, date: -1 })
    return res.json({ success: true, banners })
  } catch (err) {
    console.error('listBanners error', err)
    return res.json({ success: false, message: err.message || 'Server error' })
  }
}

// Remove banner
export const removeBanner = async (req, res) => {
  try {
    const { id } = req.body
    if (!id) return res.json({ success: false, message: 'Banner id required' })
    
    await Banner.findByIdAndDelete(id)
    return res.json({ success: true, message: 'Banner removed' })
  } catch (err) {
    console.error('removeBanner error', err)
    return res.json({ success: false, message: err.message || 'Server error' })
  }
}

// Update banner
export const updateBanner = async (req, res) => {
  try {
    const { id, title, link, order, active } = req.body
    if (!id) return res.json({ success: false, message: 'Banner id required' })

    const update = {}
    if (title !== undefined) update.title = title
    if (link !== undefined) update.link = link
    if (order !== undefined) update.order = parseInt(order)
    if (active !== undefined) update.active = (active === 'true' || active === true)

    if (req.files) {
      if (req.files['image_desktop'] && req.files['image_desktop'][0]) {
        update.image_desktop = await uploadFile(req.files['image_desktop'][0].path)
      }
      if (req.files['image_mobile'] && req.files['image_mobile'][0]) {
        update.image_mobile = await uploadFile(req.files['image_mobile'][0].path)
      }
      if (req.files['image'] && req.files['image'][0]) {
        update.image = await uploadFile(req.files['image'][0].path)
      }
    }

    await Banner.findByIdAndUpdate(id, update)
    return res.json({ success: true, message: 'Banner updated' })
  } catch (err) {
    console.error('updateBanner error', err)
    return res.json({ success: false, message: err.message || 'Server error' })
  }
}