import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';
import ErrorHandler from '../utils/errorHandler.js';
import catchAsyncError from './catchAsyncError.js';

// ✅ Middleware: Check if user is logged in (via cookie token or Authorization header)
export const isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  let token;

  // 1. Check for Bearer token in Authorization header (PREFERRED FOR API TESTS)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
      console.log('Auth Middleware: Found token in Authorization header.');
    } else {
      console.log('Auth Middleware: Authorization header malformed (not "Bearer token").');
    }
  }
  // 2. Fallback: Check for 'jwt' cookie (for browser-based authentication, if still used)
  else if (req.cookies.jwt) {
    token = req.cookies.jwt;
    console.log('Auth Middleware: Found token in JWT cookie.');
  }

  // No token found = not logged in
  if (!token) {
    console.log('Auth Middleware: No token found in header or cookie. Returning 401.');
    return next(new ErrorHandler('Please login to access this resource', 401));
  }

  try {
    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth Middleware: Token decoded payload:', decoded); // IMPORTANT DEBUG LOG

    // --- CRUCIAL FIX HERE: Use 'decoded.id' instead of 'decoded.userId' ---
    // This aligns with how your authController.js signs the token (jwt.sign({ id: user._id }))
    const userIdFromToken = decoded.id; 

    // Ensure 'id' exists in the decoded payload
    if (!userIdFromToken) {
      console.log('Auth Middleware: Decoded token missing "id" property. Returning 401.');
      return next(new ErrorHandler('Invalid token: User ID ("id") missing from payload.', 401));
    }

    // Attach user info to request
    req.user = await User.findById(userIdFromToken); // Use the corrected ID

    if (!req.user) {
      console.log('Auth Middleware: User not found in DB for ID:', userIdFromToken, '. Returning 404.');
      return next(new ErrorHandler('User not found', 404));
    }
    console.log('Auth Middleware: User authenticated:', req.user.email);
    next();
  } catch (error) {
    // Catch specific JWT errors for clearer messages
    if (error.name === 'JsonWebTokenError') {
      console.error('Auth Middleware: JWT Verification Error (Malformed/Invalid Signature):', error.message);
      return next(new ErrorHandler('Invalid or malformed token. Please login again.', 401));
    } else if (error.name === 'TokenExpiredError') {
      console.error('Auth Middleware: JWT Verification Error (Expired):', error.message);
      return next(new ErrorHandler('Token expired. Please login again.', 401));
    } else {
      console.error('Auth Middleware: Unexpected error during token verification:', error);
      return next(new ErrorHandler('Authentication failed due to server error.', 500));
    }
  }
});

// ✅ Middleware: Check role permissions (e.g., 'admin')
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Ensure req.user exists before checking its role
    if (!req.user || !roles.includes(req.user.role)) {
      console.log(`Auth Middleware: Role (${req.user ? req.user.role : 'undefined'}) is not allowed to access this resource. Returning 403.`);
      return next(
        new ErrorHandler(`Role (${req.user ? req.user.role : 'undefined'}) is not allowed to access this resource`, 403)
      );
    }
    next();
  };
};
