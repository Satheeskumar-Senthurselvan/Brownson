import jwt from 'jsonwebtoken';

const getCookieOptions = (env) => ({
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
  httpOnly: true,
  sameSite: env !== 'development' ? 'none' : 'strict',
  secure: env !== 'development',
});

const generateToken = (userId, res, jwtSecret = process.env.JWT_SECRET, env = process.env.NODE_ENV) => {
  try {
    const token = jwt.sign({ userId }, jwtSecret, {
      expiresIn: '3d',
    });

    res.cookie('jwt', token, getCookieOptions(env));
    return token;
  } catch (err) {
    // Optionally log or handle the error
    throw new Error('Failed to generate token');
  }
};

export default generateToken;
