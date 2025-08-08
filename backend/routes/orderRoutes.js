import express from 'express';
import {
  createOrder,
  getMyOrders,
  updateOrderStatus,
  getOrderById,
  getAllOrders,
  deleteOrder,
  getOrderByIdForAdmin,
} from '../controllers/orderController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

router.post('/create', isAuthenticatedUser, createOrder);
router.get('/my-orders', isAuthenticatedUser, getMyOrders);
router.get('/:id', isAuthenticatedUser, getOrderById);
router.put('/:orderId/status', isAuthenticatedUser, authorizeRoles('admin'), updateOrderStatus); // <--- correct path
router.get('/admin/orders', isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);
router.delete('/admin/order/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);
router.get('/admin/order/:id', isAuthenticatedUser, authorizeRoles('admin'), getOrderByIdForAdmin); // ✅ new route


export default router;
