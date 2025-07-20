import express from 'express';

import { isAuthenticatedUser } from '../middlewares/auth.js'; // ✅ corrected path
import { addToCart, clearCart, getUserCart, removeFromCart } from '../controllers/cartController.js';

const router = express.Router();

router.post('/add', isAuthenticatedUser, addToCart);
router.get('/', isAuthenticatedUser, getUserCart);
router.delete('/remove/:productId', isAuthenticatedUser, removeFromCart);
router.delete('/clear', isAuthenticatedUser, clearCart);

export default router;
