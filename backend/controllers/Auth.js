import User from '../Models/userModel.js';
import sendEmail from '../utils/sendEmail.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

// ✅ Signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, contactNumber, address, profileImg } = req.body;

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalProfileImg = profileImg || '/img/uploadsImage/user.jpg';

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      contactNumber,
      address,
      ProfileImg: finalProfileImg,
    });

    generateToken(newUser._id, res);

    res.status(201).json({
      message: 'Signup successful',
      user: {
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Signin
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user._id, res);

    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        contactNumber: user.contactNumber,
        ProfileImg: user.ProfileImg,
        role: user.role
      },
    });
  } catch (err) {
    console.error('Signin Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Logout
export const logout = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

//forgotPassword
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
    const resetLink = `http://localhost:3000/reset-password/${token}`; // frontend reset page

    // ✅ Email content
    const html = `
      <h2>Reset Your Password</h2>
      <p>Click the button below to reset your password. This link will expire in 10 minutes.</p>
      <a href="${resetLink}" style="padding: 10px 20px; background-color: #B82933; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you didn't request this, ignore this email.</p>
    `;

    await sendEmail(user.email, 'Reset Your Brownson Password', html);

    res.status(200).json({ success: true, resetLink });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Failed to send reset link' });
  }
};
// ✅ Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Invalid or expired token' });
  }
};


// ✅ Get user by email (for profile)
export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email }).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Update user
export const updateUser = async (req, res) => {
  try {
    const { email } = req.params;
    const { name, password, contactNumber, address } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name;
    if (contactNumber) user.contactNumber = contactNumber;
    if (address) user.address = address;
    if (req.file) user.ProfileImg = `/img/uploadsImage/${req.file.filename}`;
    
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({
      message: 'User updated',
      user: {
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        address: user.address,
        ProfileImg: user.ProfileImg,
      },
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, users }); // ✅ Added success flag
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

//User Role update
export const updateUserRole = async (req, res, next) => {
  try {
    const { email } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid or missing role' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.role = role;
    await user.save();

    res.status(200).json({
      message: 'User role updated successfully',
      user: {
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        address: user.address,
        role: user.role,
        ProfileImg: user.ProfileImg,
      },
    });
  } catch (err) {
    console.error('Update user role error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
