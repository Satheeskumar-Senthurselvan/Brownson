// ShippingPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css'; // Use your existing styles

export default function ShippingPage() {
  const [username, setUsername] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const navigate = useNavigate();

  // ✅ Auto-fill fields from localStorage user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('User'));

    if (user) {
      setUsername(user.name || '');
      setDeliveryAddress(user.address || '');
      setContactNumber(user.contactNumber || '');
    }
  }, []);

  const submitHandler = (e) => {
    e.preventDefault();

    if (!username || !deliveryAddress || !contactNumber || !paymentMethod) {
      return alert('Please fill all fields');
    }

    const shippingData = {
      username,
      deliveryAddress,
      contactNumber,
      paymentMethod,
    };

    localStorage.setItem('shippingData', JSON.stringify(shippingData));

    if (paymentMethod === 'online') {
      navigate('/payment');
    } else {
      navigate('/place-order');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="shipping-container">
        <h2 className="shipping-title">Shipping Information</h2>
        <form className="shipping-form" onSubmit={submitHandler}>
          <label>Full Name</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Address</label>
          <input
            type="text"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            required
          />

          <label>Contact Number</label>
          <input
            type="text"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            required
          />

          <label>Select Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            <option value="">-- Select --</option>
            <option value="cash_on_delivery">Cash on Delivery</option>
            <option value="online">Online Payment</option>
          </select>

          <button type="submit" className="shipping-btn">Continue</button>
        </form>
      </div>
    </div>
  );
}
