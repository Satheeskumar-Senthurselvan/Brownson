// Backend/controllers/paymentController.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for ES Module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from correct location
dotenv.config({ path: path.join(__dirname, '../config/config.env') });

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('❌ STRIPE_SECRET_KEY is missing or not loaded from config.env');
}

const stripe = new Stripe(stripeSecretKey);

export const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, error: 'Amount is required' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('❌ PaymentIntent Error:', error);
    res.status(500).send({ error: error.message });
  }
};
