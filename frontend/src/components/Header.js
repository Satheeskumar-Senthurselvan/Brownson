// Header.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import './Header.css';
import { Dropdown} from 'react-bootstrap';

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('User'));

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });
      localStorage.removeItem('User');
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Error logging out");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top">
      <div className="container-fluid">

        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src="/img/image/logo.png" alt="Logo" className="logo" />
        </Link>

        {/* Center navigation */}
        <div className="collapse navbar-collapse justify-content-center">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link active" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/userProfile">Profile</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/store">Store</Link>
            </li>
          </ul>
        </div>

        {/* Right-side */}
        <div className="d-flex align-items-center">
          <Link className="btn cart-btn d-flex align-items-center" to="/cart">
            <i className="bi bi-cart-fill me-2"></i> Add to Cart
          </Link>

          {!user ? (
            <Link className="btn login-btn d-flex align-items-center" to="/login">
              <i className="bi bi-box-arrow-in-right me-2"></i> Login
            </Link>
          ) : (
            <Dropdown className="d-inline">
              <Dropdown.Toggle variant="default text-white pr-5" id="dropdown-basic" className="login-btn">
                <span>{user?.name || 'Anonymous'}</span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {user.role === 'admin' && (
                  <Dropdown.Item onClick={() => navigate('/admin/dashboard')} className="text-dark">
                    Dashboard
                  </Dropdown.Item>
                )}
                <Dropdown.Item onClick={() => navigate('/userProfile')} className="text-dark">Profile</Dropdown.Item>
                <Dropdown.Item onClick={() => navigate('/UserOrders')} className="text-dark">Orders</Dropdown.Item>
                <Dropdown.Item onClick={handleLogout} className="text-danger">Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
