import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../../config';

export default function PlaceOrder() {
  const navigate = useNavigate();
  const hasPlacedOrder = useRef(false);

  useEffect(() => {
    if (hasPlacedOrder.current) return;
    hasPlacedOrder.current = true;

    let items = [];
    let shipping = {};

    try {
      const rawItems = localStorage.getItem('checkoutItems');
      const rawShipping = localStorage.getItem('shippingData');

      items = rawItems ? JSON.parse(rawItems) : [];
      shipping = rawShipping ? JSON.parse(rawShipping) : {};

      if (
        !Array.isArray(items) || items.length === 0 ||
        !shipping.deliveryAddress || !shipping.contactNumber ||
        !shipping.paymentMethod || !shipping.username
      ) {
        throw new Error('Invalid or missing checkout data');
      }
    } catch (err) {
      console.error('Error parsing order data:', err);
      toast.error('Invalid checkout data. Please try again.');
      return navigate('/cart');
    }

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
      paymentStatus: shipping.paymentMethod === 'online' ? 'payed' : 'cash_on_delivery',
      username: shipping.username,
      deliveryAddress: shipping.deliveryAddress,
      contactNumber: shipping.contactNumber
    };

    fetch(`${API_BASE_URL}/api/order/create`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error('Raw server response:', text);
          throw new Error('Server responded with an error');
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          fetch(`${API_BASE_URL}/api/cart/clear`, {
            method: 'DELETE',
            credentials: 'include',
          })
            .then(() => {
              toast.success('Order placed successfully!');
              localStorage.removeItem('checkoutItems');
              localStorage.removeItem('shippingData');
              navigate('/UserOrders');
            })
            .catch((err) => {
              console.error('Cart clear failed:', err);
              toast.warn('Order placed, but failed to clear cart.');
              navigate('/UserOrders');
            });
        } else {
          toast.error('Failed to place order.');
        }
      })
      .catch((err) => {
        console.error('Order placement failed:', err);
        toast.error('Something went wrong while placing order.');
      });

  }, [navigate]);

  return (
    <div className="container text-center mt-5">
      <h3>Processing your order...</h3>
    </div>
  );
}
