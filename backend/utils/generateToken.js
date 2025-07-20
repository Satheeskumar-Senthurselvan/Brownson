import jwt from 'jsonwebtoken';

const generateToken = (userId, res) => {
  // IMPORTANT: Sign the token with 'id' to match authController and auth middleware
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '3d', // Or '1h' if you prefer shorter expiry for API tokens
  });

  // Set the token as a cookie
  res.cookie('jwt', token, {
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    httpOnly: true,
    sameSite: 'strict', // Consider 'none' if frontend is on a different domain and requires it (requires secure: true)
    secure: process.env.NODE_ENV !== 'development', // Should be true in production
  });

  return token; // Return the token string so authController can use it in the response body
};

export default generateToken;
