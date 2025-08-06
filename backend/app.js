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



// REMOVE THE app.listen() CALL
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// EXPORT THE APP INSTANCE FOR VERCEL
export default app; // For ES Modules
// module.exports = app; // For CommonJS