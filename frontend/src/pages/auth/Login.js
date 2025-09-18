import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Signup from './Signup';
import './Login.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [signinData, setSigninData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // ✅ Redirect logged-in user to /userProfile if they visit /login
  useEffect(() => {
    const user = localStorage.getItem('User');
    if (user) {
      navigate('/userProfile');
    }
  }, [navigate]);

  const handleSignInClick = () => setIsRightPanelActive(false);
  const handleSignUpClick = () => setIsRightPanelActive(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSigninData({ ...signinData, [name]: value });
    setErrors({ ...errors, [name]: '' }); // clear specific error
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!signinData.email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(signinData.email)) newErrors.email = 'Invalid email';

    if (!signinData.password) newErrors.password = 'Password is required';
    else if (signinData.password.length < 8) newErrors.password = 'Min 8 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch('http://localhost:4000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signinData),
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Login successful!');
        localStorage.setItem('User', JSON.stringify(data.user));
        navigate('/userProfile');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      toast.error('Server error');
      console.error(err);
    }
  };

  return (
    <div className={`login-container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
      <div className="form-wrapper">

        {/* Signup Panel */}
        <Signup onSwitchToLogin={handleSignInClick} />

        {/* Signin Panel */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleSignin}>
            <h2><i className="bi bi-box-arrow-in-right"></i> Sign In</h2>

            <input
              type="email"
              name="email"
              placeholder={errors.email || "Email"}
              value={signinData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              required
            />

            <input
              type="password"
              name="password"
              placeholder={errors.password || "Password (min 8 chars)"}
              value={signinData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              required
            />

            <a href="/forgot-password"><i className="bi bi-question-circle-fill"></i> Forgot password?</a>
            <button type="submit">Sign In</button>
          </form>
        </div>

        {/* Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <img src="/img/image/login.png" alt="welcome" />
              <button className="ghost" onClick={handleSignInClick}>
                <i className="bi bi-box-arrow-in-right"></i> Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1><i className="bi bi-emoji-smile-fill"></i> Hello, Friend!</h1>
              <img src="/img/image/login.png" alt="hello" />
              <button className="ghost" onClick={handleSignUpClick}>
                <i className="bi bi-person-plus-fill"></i> Sign Up
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
