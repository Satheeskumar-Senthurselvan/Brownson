import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Signup from './Signup';
import './Login.css';

const Login = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [signinData, setSigninData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate(); // for navigation after login

  const handleSignInClick = () => setIsRightPanelActive(false);
  const handleSignUpClick = () => setIsRightPanelActive(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSigninData({ ...signinData, [name]: value });
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://brownson-frontend.onrender.com/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signinData),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok) {
        alert('Login successful');
        localStorage.setItem('User', JSON.stringify(data.user)); // ✅ storing user
        navigate('/userProfile');
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      alert('Server error');
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
              placeholder="Email"
              value={signinData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={signinData.password}
              onChange={handleChange}
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
