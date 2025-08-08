import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // ✅ Needed for navigation
import Sidebar from './Sidebar';
import { FaEye } from 'react-icons/fa';
import './adminDashboard.css';

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate(); // ✅ Initialize navigate

  // ✅ Fetch all orders (admin only)
  const fetchOrders = async () => {
    try {
      const res = await fetch('https://brownson-backend.onrender.com/api/order/admin/orders', {
        credentials: 'include',
      });

      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.error || 'Failed to load orders');
      }
    } catch (err) {
      toast.error('Server error while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete an order
  const handleDeleteOrder = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this order?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`https://brownson-backend.onrender.com/api/order/admin/order/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();
      if (res.status === 403) {
        toast.error('Access denied. Only admin can delete orders.');
        return;
      }

      if (data.success) {
        toast.success('Order deleted successfully');
        setOrders((prev) => prev.filter((order) => order._id !== id));
      } else {
        toast.error(data.error || 'Failed to delete order');
      }
    } catch (err) {
      toast.error('Server error while deleting order');
    }
  };

  // ✅ View details
  const handleView = (orderId) => {
    navigate(`/admin/order/${orderId}`);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="admin-container">
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="main-content">
        <h2>All Orders</h2>

        {/* ✅ Filter dropdown */}
        <div className="order-filter-bar">
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="order-filter-select"
          >
            <option value="">All</option>
            <option value="packing">Packing</option>
            <option value="ready to ship">Ready to Ship</option>
            <option value="shipping">Shipping</option>
            <option value="handed over">Handed Over</option>
          </select>
        </div>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <table className="product-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Total Price</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter((order) => statusFilter === '' || order.orderStatus === statusFilter)
                .map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.user?.username || 'Unknown'}</td>
                    <td>Rs. {order.totalPrice}</td>
                    <td>{order.paymentStatus}</td>
                    <td>{order.orderStatus || 'Pending'}</td>
                    <td>
                      {order.user?.contactNumber || 'N/A'}
                      <br />
                      {order.user?.deliveryAddress || 'N/A'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="view-btn" onClick={() => handleView(order._id)}>
                          <FaEye />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteOrder(order._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOrderList;
