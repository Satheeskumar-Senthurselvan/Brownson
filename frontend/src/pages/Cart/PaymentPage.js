// PaymentPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css'; // or use PaymentPage.css if separated

export default function PaymentPage() {
  const navigate = useNavigate();

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!cardNumber || !expiry || !cvc) {
      return alert('Please fill in all fields');
    }

    navigate('/place-order');
  };

  return (
    <div className="page-wrapper">
      <div className="payment-container">
        <h2 className="payment-title">Enter Card Details</h2>
        <form className="payment-form" onSubmit={handleSubmit}>
          <label>Card Number</label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            required
          />

          <div className="payment-row">
            <div className="payment-field">
              <label>Expiry Date</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                required
              />
            </div>

            <div className="payment-field">
              <label>CVC</label>
              <input
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="payment-btn">Pay Now</button>
        </form>
      </div>
    </div>
  );
}
