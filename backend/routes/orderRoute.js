// backend/routes/orderRouter.js
import express from 'express'
import {
  placeOrder,
  placeOrderStripe,
  allOrders,
  userOrders,
  updateStatus,
  verifyStripe,
  verifyUpi,
  checkOrderStatus   // <-- polling/status-check controller
} from '../controllers/orderController.js'
import adminAuth  from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin Features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)

// Payment Features
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)

// User Feature 
orderRouter.post('/userorders', authUser, userOrders)

// verify payment
orderRouter.post('/verifyStripe', authUser, verifyStripe)

// ----- UPI verification (called by frontend after user pays via UPI) -----
orderRouter.post('/verifyUpi', authUser, verifyUpi)

// ----- NEW: status-check for frontend polling (returns { success, payment, order }) -----
orderRouter.post('/status-check', authUser, checkOrderStatus)

export default orderRouter
