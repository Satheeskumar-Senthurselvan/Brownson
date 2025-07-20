import express from 'express';
import {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  createReview,
  getReviews,
  deleteReview,
  getAdminProducts
} from '../controllers/productController.js';

import { isAuthenticatedUser, authorizeRoles } from '../middlewares/auth.js';
import { upload } from '../config/multerUpload.js'; // You must have a Multer config

const router = express.Router();

// Public routes
router.get('/products', getProducts);
router.get('/product/:id', getSingleProduct);
router.get('/reviews/:id', getReviews);

// Authenticated routes
router.post('/review', isAuthenticatedUser, createReview);
router.delete('/review', isAuthenticatedUser, deleteReview);

// Admin routes
router.post('/admin/product/new', isAuthenticatedUser, authorizeRoles('admin'), upload.array('images'), newProduct);
router.get('/admin/products', isAuthenticatedUser, authorizeRoles('admin'), getAdminProducts);
router.put('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), upload.array('images'), updateProduct);
router.delete('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

export default router;
