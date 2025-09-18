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
import orderRoutes  from './Routes/orderRoutes.js'
import chatbotRoutes from './routes/chatbotRoutes.js';
import paymentRoutes from './Routes/paymentRoutes.js';

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

app.get('/', async (req, res) => {
  res.json("backend is running");
});

app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/payment', paymentRoutes);

connectDatabase();

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
