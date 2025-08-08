// models/OrderModel.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    userId: mongoose.Schema.Types.ObjectId,
    username: String,
    deliveryAddress: String,
    contactNumber: String,
  },
  products: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      productName: String,
      image: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalPrice: Number,
  paymentStatus: {
    type: String,
    enum: ['paid', 'cash_on_delivery'], // ✅ allow 'paid'
    default: 'cash_on_delivery',
  },
  orderStatus: {
    type: String,
    enum: ['packing', 'ready to ship', 'shipping', 'handed over'],
    default: 'packing',
  },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
