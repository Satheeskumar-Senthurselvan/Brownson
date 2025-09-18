import React, { useState } from 'react';
import './Login.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../../config';

const Signup = ({ onSwitchToLogin }) => {
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    address: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!signupData.name.trim()) newErrors.name = 'Name is required';
    if (!signupData.email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(signupData.email)) newErrors.email = 'Invalid email';

    if (!signupData.password) newErrors.password = 'Password is required';
    else if (signupData.password.length < 8) newErrors.password = 'Min 8 characters';

    if (!signupData.confirmPassword) newErrors.confirmPassword = 'Confirm your password';
    else if (signupData.confirmPassword !== signupData.password)
      newErrors.confirmPassword = 'Passwords do not match';

    if (!signupData.contactNumber.trim()) newErrors.contactNumber = 'Contact number required';
    if (!signupData.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupData({ ...signupData, [name]: value });
    setErrors({ ...errors, [name]: '' }); // Clear error on change
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Signup successful!');
        onSwitchToLogin();
      } else {
        toast.error(data.error || 'Signup failed');
      }
    } catch (err) {
      toast.error('Server error');
      console.error(err);
    }
  };

  return (
    <div className="form-container sign-up-container">
      <form onSubmit={handleSignup}>
        <h2><i className="bi bi-person-plus-fill"></i> Create Account</h2>

        <input
          type="text"
          name="name"
          value={signupData.name}
          placeholder={errors.name || "Name"}
          onChange={handleChange}
          className={errors.name ? 'error' : ''}
          required
        />

        <input
          type="email"
          name="email"
          value={signupData.email}
          placeholder={errors.email || "Email"}
          onChange={handleChange}
          className={errors.email ? 'error' : ''}
          required
        />

        <input
          type="password"
          name="password"
          value={signupData.password}
          placeholder={errors.password || "Password (min 8 chars)"}
          onChange={handleChange}
          className={errors.password ? 'error' : ''}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          value={signupData.confirmPassword}
          placeholder={errors.confirmPassword || "Confirm Password"}
          onChange={handleChange}
          className={errors.confirmPassword ? 'error' : ''}
          required
        />

        <input
          type="text"
          name="contactNumber"
          value={signupData.contactNumber}
          placeholder={errors.contactNumber || "Contact Number"}
          onChange={handleChange}
          className={errors.contactNumber ? 'error' : ''}
          required
        />

        <textarea
          name="address"
          value={signupData.address}
          placeholder={errors.address || "Address"}
          onChange={handleChange}
          className={errors.address ? 'error' : ''}
          required
        ></textarea>

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
