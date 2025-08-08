import jwt from 'jsonwebtoken';

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '3d',
  });

  res.cookie('jwt', token, {
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    httpOnly: true,
    sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'strict', // Set to 'none' in production
    secure: process.env.NODE_ENV !== 'development', // Set to true in production
  });
};

export default generateToken;