import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';
import './adminDashboard.css';
import API_BASE_URL from '../config';

export default function SingleOrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSingleOrder();
  }, []);

  const fetchSingleOrder = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/order/admin/order/${id}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setNewStatus(data.order.orderStatus);
      } else {
        toast.error(data.message || 'Order not found');
        navigate('/admin/orders');
      }
    } catch (err) {
      toast.error('Error fetching order');
      navigate('/admin/orders');
    }
  };

  const updateOrderStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/order/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Order status updated');
        navigate('/admin/orders');
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Server error during update');
    }
  };

  if (!order) {
    return <p style={{ textAlign: 'center', marginTop: '100px' }}>Loading order details...</p>;
  }

  return (
    <div className="admin-container">
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="main-content">
        <div className="shipping-container">
          <h2 className="shipping-title">Order Details</h2>

          <div className="order-status-section">
            <label htmlFor="order-status-dropdown">Order Status</label>
            <select
              id="order-status-dropdown"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="status-dropdown"
            >
              <option value="packing">Packing</option>
              <option value="ready to ship">Ready to Ship</option>
              <option value="shipping">Shipping</option>
              <option value="handed over">Handed Over</option>
            </select>
            <button onClick={updateOrderStatus} className="status-update-btn">
              Update Status
            </button>
          </div>

          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>User:</strong> {order.user?.username}</p>
          <p><strong>Total Price:</strong> Rs {order.totalPrice}</p>
          <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
          <p><strong>Current Status:</strong> {order.orderStatus}</p>
          <p><strong>Delivery Address:</strong> {order.user?.deliveryAddress}</p>
          <p><strong>Contact Number:</strong> {order.user?.contactNumber}</p>

          <h4 style={{ marginTop: '20px' }}>Products:</h4>
          <ul>
            {order.products.map((item, idx) => (
              <li key={idx}>
                {item.productName} - Qty: {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
