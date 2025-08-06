// CartPage.js
import React, { useEffect, useState, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CartPage.css';

export default function CartPage() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const res = await fetch('/api/cart', {
      credentials: 'include',
    });
    const data = await res.json();
    console.log("Cart API Response:", data); // Add this for debugging
    if (data.success) {
      // FIX IS HERE: Access data.cart.items, not data.cartItems
      setItems(data.cart.items);
    } else {
      // Handle the case where success is false, e.g., show an error message
      console.error("Failed to fetch cart:", data.error);
      setItems([]); // Ensure items is an empty array even on error
    }
  };

  const increaseQty = async (item) => {
    const newQty = item.quantity + 1;
    if (newQty > item.stock) {
      alert('Cannot exceed available stock');
      return;
    }
    await updateCartItem(item, newQty);
  };

  const decreaseQty = async (item) => {
    const newQty = item.quantity - 1;
    if (newQty < 1) return;
    await updateCartItem(item, newQty);
  };

  const handleQtyChange = async (item, value) => {
    const qty = parseInt(value);
    if (isNaN(qty) || qty < 1 || qty > item.stock) {
      alert(`Quantity must be between 1 and ${item.stock}`);
      return;
    }
    await updateCartItem(item, qty);
  };

  const updateCartItem = async (item, quantity) => {
    await fetch('/api/cart/add', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: item.productId,
        productName: item.productName,
        image: item.image,
        quantity,
        price: item.price,
      }),
    });
    fetchCart();
  };

  const removeItem = async (productId) => {
    await fetch(`/api/cart/remove/${productId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    fetchCart();
  };

  const checkoutHandler = () => {
    localStorage.setItem('checkoutItems', JSON.stringify(items));
    navigate('/shipping');
  };

  return (
    <div className="cart-container">
      {items.length === 0 ? (
        <h2 className="empty-cart">Your Cart is Empty</h2>
      ) : (
        <Fragment>
          <h2 className="cart-title">Your Cart: <b>{items.length} items</b></h2>
          <div className="cart-content">
            <div className="cart-items">
              {/* Ensure items is an array before mapping */}
              {Array.isArray(items) && items.map(item => (
                <Fragment key={item._id}>
                  <div className="cart-item">
                    <img src={item.image} alt={item.productName} className="item-image" />
                    <Link to={`/product/${item.productId}`} className="item-name">{item.productName}</Link>
                    <p className="item-price">Rs {item.price}</p>
                    <div className="quantity-control">
                      <button onClick={() => decreaseQty(item)}>-</button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQtyChange(item, e.target.value)}
                        min="1"
                        max={item.stock}
                      />
                      <button onClick={() => increaseQty(item)}>+</button>
                    </div>
                <button className="remove-button" onClick={() => removeItem(item.productId._id)}>🗑</button>
                  </div>
                </Fragment>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>
              <p>Subtotal: <span>{items.reduce((acc, item) => acc + item.quantity, 0)} Units</span></p>
              <p>Total: <span>Rs {items.reduce((acc, item) => acc + item.quantity * item.price, 0)}</span></p>
              <button className="checkout-btn" onClick={checkoutHandler}>Check out</button>
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
}