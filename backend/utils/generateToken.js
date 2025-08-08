import jwt from 'jsonwebtoken';

// Corrected generateToken function
const generateToken = (userId, res) => {
  // Create the JWT
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15d', // Set a reasonable expiration
  });

  // Set the cookie with the correct security attributes
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Set secure flag in production
    sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'strict', // 'none' for production cross-site
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
  });
};

export default generateToken;
