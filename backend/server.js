// server.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDatabase from './db/connectDB.js';
import authRoutes from './routes/authRoute.js';
import productRoutes from './routes/productRoute.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes  from './routes/orderRoutes.js'
import chatbotRoutes from './routes/chatbotRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, './config/config.env') });

const app = express();

app.use(cors({
  origin: 'https://brownson-frontend.onrender.com',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/payment', paymentRoutes);

connectDatabase();

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running successfully!');
});

// 404 handler for APIs
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API Route Not Found' });
  }
  res.status(404).send('<h1>404 Not Found</h1>');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') {
    message = `Resource not found. Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }
  if (err.code === 11000) {
    const value = Object.keys(err.keyValue)[0];
    message = `Duplicate ${value} entered`;
    statusCode = 400;
  }
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid or malformed token. Please login again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please login again.';
  }

  res.status(statusCode).json({ success: false, message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
