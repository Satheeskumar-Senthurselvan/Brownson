import express from 'express';
import {
  signup,
  signin,
  updateUser,
  getUserByEmail,
  logout,
  forgotPassword,    
  resetPassword 
} from '../controllers/Auth.js';

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

export default router;
