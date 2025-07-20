// This is your updated backend authentication controller.
// It incorporates fixes for the failed Playwright tests.

import User from '../Models/userModel.js';
import sendEmail from '../utils/sendEmail.js';
import jwt from 'jsonwebtoken'; // Still needed for jwt.verify in other places if any
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js'; // Import the updated generateToken

// --- Signup Controller ---
export const signup = async (req, res) => {
  console.log('--- SIGNUP REQUEST RECEIVED ---');
  try {
    const { name, email, password, contactNumber, address, ProfileImg } = req.body;
    console.log('Signup: Request Body:', req.body);

    // 1. Validate input
    if (!name || !email || !password) { // Corrected: `!!password` was likely a typo
      console.log('Signup: Error - Missing required fields');
      return res.status(400).json({ error: 'Please enter all required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Signup: Error - Invalid email format provided:', email);
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 8) {
      console.log('Signup: Error - Password less than 8 characters');
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // 2. Check if email already exists
    console.log(`Signup: Checking for existing user with email: ${email}`);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`Signup: Error - Email already registered for ${email}`);
      return res.status(400).json({ error: 'Email already registered' });
    }
    console.log(`Signup: Email ${email} is unique. Proceeding to create user.`);

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Signup: Password hashed successfully.');

    const finalProfileImg = ProfileImg || '/img/uploadsImage/user.jpg';
    console.log('Signup: Final ProfileImg:', finalProfileImg);

    // 4. Create and save new user instance
    console.log('Signup: Attempting to create new user in DB...');
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      contactNumber,
      address,
      ProfileImg: finalProfileImg,
    });
    console.log(`Signup: New user created in DB: ${newUser.email} (ID: ${newUser._id})`);

    // 5. Generate JWT Token and set cookie using the consolidated utility
    const token = generateToken(newUser._id, res); // Use the utility function
    console.log('Signup: JWT Token generated and cookie set.');

    // 6. Send successful response
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      contactNumber: newUser.contactNumber,
      address: newUser.address,
      ProfileImg: newUser.ProfileImg,
    };
    console.log('Signup: Sending 201 response with user data and token.');
    res.status(201).json({
      message: 'Signup successful',
      user: userResponse,
      token: token, // Return the token in the response body
    });

  } catch (err) {
    console.error('Signup Error (Catch Block):', err);
    res.status(500).json({ error: 'Server error during signup' });
  } finally {
    console.log('--- SIGNUP REQUEST ENDED ---');
  }
};

// --- Signin Controller ---
export const signin = async (req, res) => {
  console.log('--- SIGNIN REQUEST RECEIVED ---');
  try {
    const { email, password } = req.body;
    console.log('Signin: Request Body:', req.body);

    // 1. Validate input
    if (!email || !password) {
      console.log('Signin: Error - Missing email or password');
      return res.status(400).json({ error: 'Please enter all credentials' });
    }

    // 2. Find user by email, EXPLICITLY SELECTING THE PASSWORD
    console.log(`Signin: Attempting to find user with email: ${email} and select password.`);
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`Signin: Error - User not found for email: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log(`Signin: User found: ${user.email} (ID: ${user._id})`);

    // 3. Compare provided password with hashed password in DB
    console.log('Signin: Comparing provided password with stored hashed password...');
    if (!user.password) {
        console.error('Signin: User password field is missing from retrieved user object.');
        return res.status(500).json({ error: 'Server error: Password not retrieved for comparison.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Signin: Password comparison result (isMatch): ${isMatch}`);
    if (!isMatch) {
      console.log(`Signin: Error - Incorrect password for user: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log(`Signin: Password matched for user: ${email}`);

    // 4. Generate JWT Token and set cookie using the consolidated utility
    const token = generateToken(user._id, res); // Use the utility function
    console.log('Signin: JWT Token generated and cookie set.');

    // 5. Send successful response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      contactNumber: user.contactNumber,
      address: user.address,
      ProfileImg: user.ProfileImg,
    };
    console.log('Signin: Sending 200 response with user data and token.');
    res.status(200).json({
      message: 'Login successful',
      user: userResponse,
      token: token, // Return the token in the response body
    });

  } catch (err) {
    console.error('Signin Error (Catch Block):', err);
    res.status(500).json({ error: 'Server error during signin' });
  } finally {
    console.log('--- SIGNIN REQUEST ENDED ---');
  }
};

// --- Logout Controller ---
export const logout = (req, res) => {
  console.log('--- LOGOUT REQUEST RECEIVED ---');
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
  console.log('--- LOGOUT REQUEST ENDED ---');
};

// --- Forgot Password Controller ---
export const forgotPassword = async (req, res) => {
  console.log('--- FORGOT PASSWORD REQUEST RECEIVED ---');
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log('Forgot Password: User not found for email:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    // Use 'id' in the payload for consistency
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '10m' });
    const resetLink = `http://localhost:3000/reset-password/${token}`;
    console.log('Forgot Password: Reset link generated.');

    const html = `
      <h2>Reset Your Password</h2>
      <p>Click the button below to reset your password. This link will expire in 10 minutes.</p>
      <a href="${resetLink}" style="padding: 10px 20px; background-color: #B82933; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you didn't request this, ignore this email.</p>
    `;

    await sendEmail(user.email, 'Reset Your Brownson Password', html);
    console.log('Forgot Password: Reset email sent successfully.');

    res.status(200).json({ success: true, resetLink });
  } catch (err) {
    console.error('Forgot password error (Catch Block):', err);
    return res.status(500).json({ error: 'Failed to send reset link' });
  } finally {
    console.log('--- FORGOT PASSWORD REQUEST ENDED ---');
  }
};

// --- Reset Password Controller ---
export const resetPassword = async (req, res) => {
  console.log('--- RESET PASSWORD REQUEST RECEIVED ---');
  try {
    const { token } = req.params;
    const { password } = req.body;
    console.log('Reset Password: Token:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    // Ensure this also uses 'id' to get the user ID
    const userIdFromToken = decoded.id; // Use 'id' here
    console.log('Reset Password: Token decoded. User ID:', userIdFromToken);

    const user = await User.findById(userIdFromToken); // Use the correct ID
    if (!user) {
      console.log('Reset Password: User not found for decoded ID:', userIdFromToken);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('Reset Password: User found.');

    if (password.length < 8) {
      console.log('Reset Password: Error - Password less than 8 characters');
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();
    console.log('Reset Password: Password updated and hashed.');

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error (Catch Block):', err);
    if (err.name === 'TokenExpiredError') {
      res.status(400).json({ error: 'Password reset token has expired' });
    } else if (err.name === 'JsonWebTokenError') {
      res.status(400).json({ error: 'Invalid password reset token' });
    } else {
      res.status(500).json({ error: 'Server error during password reset' });
    }
  } finally {
    console.log('--- RESET PASSWORD REQUEST ENDED ---');
  }
};

// --- Get user by email (for profile) Controller ---
export const getUserByEmail = async (req, res) => {
  console.log('--- GET USER BY EMAIL REQUEST RECEIVED ---');
  try {
    const { email } = req.params;
    console.log('Get User by Email: Email:', email);
    const user = await User.findOne({ email }).select('-password');

    if (!user) {
      console.log('Get User by Email: User not found for email:', email);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('Get User by Email: User found.');

    res.status(200).json({ user });
  } catch (err) {
    console.error('Get user error (Catch Block):', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    console.log('--- GET USER BY EMAIL REQUEST ENDED ---');
  }
};

// --- Update user Controller ---
export const updateUser = async (req, res) => {
  console.log('--- UPDATE USER REQUEST RECEIVED ---');
  try {
    const { email } = req.params;
    const { name, password, contactNumber, address, ProfileImg } = req.body;
    console.log('Update User: Email:', email, 'Request Body:', req.body);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('Update User: User not found for email:', email);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('Update User: User found.');

    if (name) user.name = name;
    if (contactNumber) user.contactNumber = contactNumber;
    if (address) user.address = address;
    if (req.file) {
      user.ProfileImg = `/img/uploadsImage/${req.file.filename}`;
      console.log('Update User: ProfileImg updated via file upload.');
    } else if (ProfileImg) {
      user.ProfileImg = ProfileImg;
    }

    if (password) {
      if (password.length < 8) {
        console.log('Update User: Error - Password less than 8 characters');
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      console.log('Update User: Password updated and hashed.');
    }

    await user.save();
    console.log('Update User: User document saved to DB.');

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
    console.error('Update user error (Catch Block):', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    console.log('--- UPDATE USER REQUEST ENDED ---');
  }
};
