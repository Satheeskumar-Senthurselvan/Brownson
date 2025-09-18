import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDatabase from './db/connectDB.js';
import authRoutes from './Routes/authRoute.js';
import productRoutes from './Routes/productRoute.js';
import cartRoutes from './Routes/cartRoutes.js';
import orderRoutes from './Routes/orderRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import paymentRoutes from './Routes/paymentRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'https://brownson.vercel.app',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

connectDatabase();

app.get('/', (req, res) => {
  res.json({ message: "Backend is running!" });
});

app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/payment', paymentRoutes);

app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API Route Not Found' });
  }
  res.status(404).send('<!DOCTYPE html><html><head><title>Not Found</title></head><body><h1>404 Not Found</h1><p>The requested URL was not found on this server.</p></body></html>');
});

export default app;