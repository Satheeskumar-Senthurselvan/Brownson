import express from 'express';
import { isAuthenticatedUser } from '../middlewares/auth.js';
import {
  createOrder,
  getMyOrders,
  updateOrderStatus,
  getOrderById  
} from '../controllers/orderController.js';

const router = express.Router();

// ✅ Routes
router.post('/create', isAuthenticatedUser, createOrder);
router.get('/my-orders', isAuthenticatedUser, getMyOrders);
router.get('/:id', isAuthenticatedUser, getOrderById);  // ✅ NEW: Get order by ID
router.put('/update-status/:orderId', isAuthenticatedUser, updateOrderStatus);

export default router;
