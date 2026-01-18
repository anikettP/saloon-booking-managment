import express from 'express';
import { addBanner2, getBanner2 } from '../controllers/banner2Controller.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const banner2Router = express.Router();

// Route to add/update banner (Protected by adminAuth)
banner2Router.post('/add', adminAuth, upload.fields([{ name: 'imageDesktop', maxCount: 1 }, { name: 'imageMobile', maxCount: 1 }]), addBanner2);

// Route to get banner (Public)
banner2Router.get('/get', getBanner2);

export default banner2Router;