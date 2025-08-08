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
  getAdminProducts,
  getAllReviews
} from '../controllers/productController.js';

import { isAuthenticatedUser, authorizeRoles } from '../middlewares/auth.js';
import { upload } from '../config/multerUpload.js';

const router = express.Router();

// Public
router.get('/products', getProducts);
router.get('/product/:id', getSingleProduct);
router.get('/reviews/:id', getReviews);

// Authenticated users
router.post('/review', isAuthenticatedUser, createReview);
router.delete('/review', isAuthenticatedUser, deleteReview);

// Admin
router.post('/admin/product/new', isAuthenticatedUser, authorizeRoles('admin'), upload.array('images'), newProduct);
router.get('/admin/products', isAuthenticatedUser, authorizeRoles('admin'), getAdminProducts);
router.put('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), upload.array('images'), updateProduct);
router.delete('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);
router.get('/admin/reviews', isAuthenticatedUser, authorizeRoles('admin'), getAllReviews);

export default router;
