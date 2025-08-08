// frontend/src/pages/Cart/PaymentPage.js
import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';

const stripePromise = loadStripe('pk_test_51Rp32MJ8fsxYQ2Yf8HrSFuwT7wp7L8Te73UI7SQk6rtnlHSNiWz8Uhz00N8Dakn3MBKDWi2RJfdJziL046xF9TOv00ubfUP17N');

function StripeCheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) return;

    try {
      const res = await fetch('https://brownson-backend.onrender.com/api/payment/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1000 }),
      });

      const { clientSecret } = await res.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        const rawItems = localStorage.getItem('checkoutItems');
        const rawShipping = localStorage.getItem('shippingData');

        let items = rawItems ? JSON.parse(rawItems) : [];
        let shipping = rawShipping ? JSON.parse(rawShipping) : {};

        const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const products = items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          image: i.image,
          quantity: i.quantity,
        }));

        const orderPayload = {
          products,
          totalPrice,
          paymentStatus: 'paid', // ✅ Match schema
          username: shipping.username,
          deliveryAddress: shipping.deliveryAddress,
          contactNumber: shipping.contactNumber,
        };

        const orderRes = await fetch('https://brownson-backend.onrender.com/api/order/create', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        });

        const orderData = await orderRes.json();

        if (orderData.success) {
          await fetch('https://brownson-backend.onrender.com/api/cart/clear', {
            method: 'DELETE',
            credentials: 'include',
          });

          alert('✅ Payment Successful & Order Created!');
          localStorage.removeItem('checkoutItems');
          localStorage.removeItem('shippingData');
          navigate('/UserOrders');
        } else {
          alert('⚠️ Payment succeeded, but order failed.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong.');
    }

    setLoading(false);
  };

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <label>Card Details</label>
      <div className="card-element-wrapper">
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button className="payment-btn" type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function PaymentPage() {
  return (
    <div className="page-wrapper">
      <div className="payment-container">
        <h2 className="payment-title">Secure Payment</h2>
        <Elements stripe={stripePromise}>
          <StripeCheckoutForm />
        </Elements>
      </div>
    </div>
  );
}
