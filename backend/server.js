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
import chatbotRoutes from './routes/chatbotRoutes.js';
import paymentRoutes from './Routes/paymentRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });
}

const app = express();

const corsOrigin = process.env.NODE_ENV === 'production' ? process.env.VERCEL_URL : 'http://localhost:3000';

app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get('/api', (req, res) => {
  res.json({ message: "Backend is running!" });
});

app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/payment', paymentRoutes);

connectDatabase();
export default app;
