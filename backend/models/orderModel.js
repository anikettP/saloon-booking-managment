// backend/models/orderModel.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },

  status: { type: String, required: true, default: 'Order Placed' },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, required: true, default: false },
  paymentDetails: { type: Object, default: {} }, // txn id, verifiedAt, etc.
  localRef: { type: String, default: '' },       // human-friendly reference
  temp: { type: Boolean, default: false },       // true = not visible to admin yet
  date: { type: Number, required: true },

  // delivery / shipping
  deliveryType: { type: String, default: 'standard' }, // 'standard' | 'fast'
  deliveryCharge: { type: Number, default: 0 },
  isFastDelivery: { type: Boolean, default: false },

  // custom order support
  custom: { type: Boolean, default: false },
  customRequestId: { type: String, default: '' },
  customDetails: { type: Object, default: null },
});

const orderModel =
  mongoose.models.order || mongoose.model('order', orderSchema);

export default orderModel;
