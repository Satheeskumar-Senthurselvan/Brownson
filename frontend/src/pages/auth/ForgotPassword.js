// src/pages/Auth/ForgotPassword.js
import React, { useState } from 'react';
import './Login.css';
import API_BASE_URL from '../../config';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok && data.resetLink) {
        setMessage('Check your email for the reset link.');
        setIsSuccess(true);
      } else {
        setMessage(data.error || 'Failed to send reset link');
        setIsSuccess(false);
      }
    } catch (err) {
      console.error(err);
      setMessage('Something went wrong');
      setIsSuccess(false);
    }
  };

  return (
    <div className='forgot-password'>
      <div className="auth-container">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Link</button>
        </form>

        {message && (
          <p style={{ marginTop: '10px', color: isSuccess ? 'green' : 'red' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
