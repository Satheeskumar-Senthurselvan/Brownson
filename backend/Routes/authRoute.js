import express from 'express';
import {
  signup,
  signin,
  updateUser,
  getUserByEmail,
  logout,
  forgotPassword,    
  resetPassword, 
  getAllUsers,
  deleteUser,
  updateUserRole
} from '../controllers/Auth.js';

import { isAuthenticatedUser, authorizeRoles } from '../middlewares/auth.js';
import { upload } from '../config/upload.js';

const router = express.Router();

// Auth routes
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/user/:email', getUserByEmail);
router.put('/user/update/:email', upload.single('ProfileImg'), updateUser);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);         
router.post('/reset-password/:token', resetPassword);        


router.get('/admin/users', isAuthenticatedUser, authorizeRoles('admin'), getAllUsers);
router.delete('/admin/user/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteUser);
router.put('/admin/user/role/:email', isAuthenticatedUser, authorizeRoles('admin'), updateUserRole);


export default router;
