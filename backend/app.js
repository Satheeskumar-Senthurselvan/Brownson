// ✅ Backend: app.js (Corrected Middleware Order)
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
import orderRoutes  from './Routes/orderRoutes.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// === Your API Routes ===
app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
// =======================

connectDatabase();

// --- IMPORTANT: NEW ORDERING ---

// 1. All specific routes go first.

// 2. Then, the 404 Not Found Handler for unmatched routes.
// This will catch any request that didn't hit an API route.
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) {
        // Ensure this 404 also sends `success: false` for consistency in API responses
        return res.status(404).json({ success: false, message: 'API Route Not Found' });
    }
    res.status(404).send('<!DOCTYPE html><html><head><title>Not Found</title></head><body><h1>404 Not Found</h1><p>The requested URL was not found on this server.</p></body></html>');
});

// 3. Finally, the Global Error Handler.
// This catches all errors passed via `next(err)` from any middleware or route.
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

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});