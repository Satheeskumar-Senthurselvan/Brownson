// ✅ Backend: app.js (Corrected Middleware Order for Vercel Deployment)
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDatabase from './db/connectDB.js';
import authRoutes from './Routes/authRoute.js';
import productRoutes from './Routes/productRoute.js';
import cartRoutes from './Routes/cartRoutes.js';
import orderRoutes from './Routes/orderRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

const app = express();

// IMPORTANT: In production, change 'http://localhost:3000' to your Vercel frontend URL
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'YOUR_VERCEL_FRONTEND_URL' : 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Your API routes
app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);

// Connect to MongoDB (ensure this is called before any route handlers that use the DB)
connectDatabase();

// 1. All specific routes go first.
// This middleware will catch any /api/ routes that were not handled by the specific route handlers above.
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API Route Not Found' });
  }
  // For non-API routes, let the frontend handle 404s or serve a generic HTML 404 page
  // This part might be less critical if Vercel is serving your frontend's static files directly for non-/api/ paths.
  res.status(404).send('<!DOCTYPE html><html><head><title>Not Found</title></head><body><h1>404 Not Found</h1><p>The requested URL was not found on this server.</p></body></html>');
});

// 3. Finally, the Global Error Handler.
app.use((err, req, res, next) => {
  console.error('Global Error Handler: Raw error object:', err);
  console.error('Global Error Handler: Error stack:', err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types for better messages
  if (err.name === 'CastError') {
    message = `Resource not found. Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }
  if (err.code === 11000) { // Mongoose duplicate key error
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

  const finalResponseBody = {
    success: false,
    message: message,
  };

  console.log(`Global Error Handler: Sending ${statusCode} response:`, JSON.stringify(finalResponseBody, null, 2));

  res.status(statusCode).json(finalResponseBody);
});

// REMOVE THE app.listen() CALL
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// EXPORT THE APP INSTANCE FOR VERCEL
export default app; // For ES Modules
// module.exports = app; // For CommonJS