// backend/routes/cartRoute.js
import express from 'express';
import {
  addToCart,
  getUserCart,
  updateCart,
  getGuestCart,
  clearCart
} from '../controllers/cartController.js';
import authUser from '../middleware/auth.js';

const cartRouter = express.Router();

// Guest cart (no login required)
cartRouter.post('/get', getGuestCart);

// Authenticated user cart
cartRouter.post('/get-auth', authUser, getUserCart);

// Add to cart (login required)
cartRouter.post('/add', authUser, addToCart);

// Update cart (login required)
cartRouter.post('/update', authUser, updateCart);

// NEW — Clear cart (login required)
cartRouter.post('/clear', authUser, clearCart);

export default cartRouter;
