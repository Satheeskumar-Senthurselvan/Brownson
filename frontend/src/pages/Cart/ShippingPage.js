import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ShippingPage() {
  const [username, setUsername] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('User'));
    if (user) {
      setUsername(user.name || '');
      setDeliveryAddress(user.address || '');
      setContactNumber(user.contactNumber || '');
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Full name required';
    if (!deliveryAddress.trim()) newErrors.deliveryAddress = 'Address required';
    if (!contactNumber.trim()) newErrors.contactNumber = 'Contact number required';
    if (!paymentMethod) newErrors.paymentMethod = 'Select payment method';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const shippingData = {
      username,
      deliveryAddress,
      contactNumber,
      paymentMethod,
    };

    localStorage.setItem('shippingData', JSON.stringify(shippingData));
    toast.success('Shipping details saved!');

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
            placeholder={errors.username || 'Enter full name'}
            onChange={(e) => {
              setUsername(e.target.value);
              setErrors({ ...errors, username: '' });
            }}
            className={errors.username ? 'error' : ''}
            required
          />

          <label>Address</label>
          <input
            type="text"
            value={deliveryAddress}
            placeholder={errors.deliveryAddress || 'Enter delivery address'}
            onChange={(e) => {
              setDeliveryAddress(e.target.value);
              setErrors({ ...errors, deliveryAddress: '' });
            }}
            className={errors.deliveryAddress ? 'error' : ''}
            required
          />

          <label>Contact Number</label>
          <input
            type="text"
            value={contactNumber}
            placeholder={errors.contactNumber || 'Enter contact number'}
            onChange={(e) => {
              setContactNumber(e.target.value);
              setErrors({ ...errors, contactNumber: '' });
            }}
            className={errors.contactNumber ? 'error' : ''}
            required
          />

          <label>Select Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setErrors({ ...errors, paymentMethod: '' });
            }}
            className={errors.paymentMethod ? 'error' : ''}
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
