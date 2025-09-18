import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import Order from '../models/OrderModel.js';
import Cart from '../models/Cart.js';

const intentsPath = path.join(process.cwd(), 'backend/api/data/intents.json');
const intents = JSON.parse(fs.readFileSync(intentsPath, 'utf-8'));

export const chatbotReply = async (req, res) => {
  const { message, userId } = req.body;
  const msg = message.toLowerCase();

  if (!userId) return res.json({ reply: 'User not identified. Please log in to use this feature.' });

  try {
    if (msg.includes('have') || msg.includes('available')) {
        const keyword = msg.replace(/.*have\s+/, '').trim();

        // Try finding by product name
        let product = await Product.findOne({
        name: { $regex: keyword, $options: 'i' }
        });

        // If not found, try finding by category
        if (!product) {
        product = await Product.findOne({
            category: { $regex: keyword, $options: 'i' }
        });
        }

        if (product) {
        return res.json({
            reply: `Yes, we have ${product.name} in the "${product.category}" category for Rs. ${product.price}.`
        });
        } else {
        return res.json({ reply: `Sorry, we don't currently have that item.` });
        }
    }
    if (msg.includes('cart')) {
      const cartItems = await Cart.find({ userId: new mongoose.Types.ObjectId(userId) });

      if (!cartItems || cartItems.length === 0) {
        return res.json({ reply: 'Your cart is empty.' });
      }

      const summary = cartItems.map(i => `${i.productName} (x${i.quantity})`).join(', ');
      return res.json({ reply: `You have: ${summary} in your cart.` });
    }

    if (msg.includes('order') || msg.includes('track')) {
      const orders = await Order.find({ "user.userId": new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });
      if (!orders.length) {
        return res.json({ reply: 'You have no orders yet.' });
      }
      return res.json({ reply: `Your latest order (#${orders[0]._id}) is currently: "${orders[0].orderStatus}".` });
    }

    for (const intent of intents.intents) {
      for (const pattern of intent.patterns) {
        if (msg.includes(pattern.toLowerCase())) {
          const response = intent.responses[Math.floor(Math.random() * intent.responses.length)];
          return res.json({ reply: response });
        }
      }
    }

    const fallback = intents.intents.find((i) => i.tag === 'fallback');
    const fallbackResponse = fallback.responses[Math.floor(Math.random() * fallback.responses.length)];
    return res.json({ reply: fallbackResponse });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ reply: 'Something went wrong. Please try again later.' });
  }
};
