// backend/routes/bannerRoute.js
import express from 'express'
import { addBanner, listBanners, removeBanner, updateBanner } from '../controllers/bannerController.js'
import adminAuth from '../middleware/adminAuth.js'
import upload from '../middleware/multer.js' // reuse your multer middleware

const router = express.Router()

// public list
router.get('/list', listBanners)

// admin: accept multiple file fields
// upload.fields expects an array of { name: 'fieldName', maxCount: 1 }
router.post('/add', adminAuth, upload.fields([
  { name: 'image_desktop', maxCount: 1 },
  { name: 'image_mobile', maxCount: 1 },
  { name: 'image', maxCount: 1 } // legacy single-file fallback
]), addBanner)

router.post('/remove', adminAuth, removeBanner)

router.post('/update', adminAuth, upload.fields([
  { name: 'image_desktop', maxCount: 1 },
  { name: 'image_mobile', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), updateBanner)

export default router
