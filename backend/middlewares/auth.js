import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';
import ErrorHandler from '../utils/errorHandler.js';
import catchAsyncError from './catchAsyncError.js';

// ✅ Middleware: Check if user is logged in (via cookie token)
export const isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const { jwt: token } = req.cookies;

  // No token = not logged in
  if (!token) {
    return next(new ErrorHandler('Please login to access this resource', 401));
  }

  // Decode token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Attach user info to request
  req.user = await User.findById(decoded.userId);

  if (!req.user) {
    return next(new ErrorHandler('User not found', 404));
  }

  next();
});

// ✅ Middleware: Check role permissions (e.g., 'admin')
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resource`, 403)
      );
    }
    next();
  };
};
