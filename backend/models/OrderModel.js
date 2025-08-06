// models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    contactNumber: { type: String, required: true }
  },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      productName: { type: String, required: true },
      image: { type: String },
      quantity: { type: Number, required: true }
    }
  ],
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['payed', 'cash_on_delivery'], required: true },
  orderStatus: {
    type: String,
    enum: ['packing', 'ready to ship', 'shipping', 'handed over'],
    default: 'packing'
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
