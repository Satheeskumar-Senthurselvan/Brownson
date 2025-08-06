// src/pages/Orders/UserOrders.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserOrders } from '../../slices/orderSlice'; // ✅ correct path
import { Link } from 'react-router-dom';
import './UserOrders.css';

export default function UserOrders() {
  const { userOrders = [] } = useSelector(state => state.orderState);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/order/my-orders', {
          credentials: 'include',
        });

        const data = await res.json();
        if (data.success) {
          dispatch(setUserOrders(data.orders));
        } else {
          alert('Failed to load orders');
        }
      } catch (err) {
        console.error('❌ Order fetch error:', err);
        alert('Something went wrong');
      }
    };

    fetchOrders();
  }, [dispatch]);

  return (
    <div className="user-orders-container">
      <h1 className="orders-title">My Orders</h1>

      <div className="table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>No. of Items</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-orders">No orders found.</td>
              </tr>
            ) : (
              userOrders.map(order => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.products.length}</td>
                  <td>Rs {order.totalPrice}</td>
                  <td className={
                    order.orderStatus === 'handed over'
                      ? 'status-delivered'
                      : 'status-pending'
                  }>
                    {order.orderStatus}
                  </td>
                  <td>
                    <Link to={`/order/${order._id}`} className="view-btn">View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
