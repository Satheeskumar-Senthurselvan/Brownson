// ✅ Backend: app.js (important parts only)
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

connectDatabase(); // This should ideally be called before app.listen, but it's a promise, so it connects asynchronously. It's fine here.

// === NEW: 404 Not Found Handler ===
// This middleware will be called if no other route matches
app.use((req, res, next) => {
    // For API requests, send JSON response
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({ message: 'API Route Not Found' });
    }
    // For non-API requests, you might serve a frontend build or a simple HTML page
    // For now, let's just return a generic HTML 404 if it's not an API call
    res.status(404).send('<!DOCTYPE html><html><head><title>Not Found</title></head><body><h1>404 Not Found</h1><p>The requested URL was not found on this server.</p></body></html>');
});

// === NEW: Global Error Handler ===
// This middleware will catch any errors thrown in your route handlers
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Send JSON error response for API calls
    res.status(statusCode).json({
        message: message,
        // In development, you might want to send the error for more details
        // error: process.env.NODE_ENV === 'development' ? err : {}
    });
});
// =======================

const PORT = process.env.PORT || 4000; // Ensure PORT is defined (e.g., in config.env)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});