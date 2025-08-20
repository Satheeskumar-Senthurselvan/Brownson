import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import { Link } from 'react-router-dom';
import { getAdminProducts } from '../actions/productActions';
import { getUsers } from '../actions/userActions';
import { adminOrders as adminOrdersAction } from '../actions/orderActions';
import './adminDashboard.css';

const AdminDashboard = () => {
  const dispatch = useDispatch();

  const { products = [] } = useSelector((state) => state.productsState || {});
  const { adminOrders = [] } = useSelector((state) => state.orderState || {});
  const { users = [] } = useSelector((state) => state.userState || {});

  useEffect(() => {
    dispatch(getAdminProducts());
    dispatch(getUsers());
    dispatch(adminOrdersAction());
  }, [dispatch]);

  const outOfStock = products.filter((p) => p.stock === 0).length;
  const totalAmount = adminOrders.reduce((acc, order) => acc + order.totalPrice, 0);

  return (
    <div className="dashboard-container">
      <div className="sidebar-area">
        <Sidebar />
      </div>
      <div className="main-area">
        <h1 className="dashboard-title">Admin Dashboard</h1>

        <div className="revenue-card">
          <h4>Total Revenue</h4>
          <h2>Rs {totalAmount.toFixed(2)}</h2>
        </div>

        <div className="dashboard-cards">
          <DashboardCard title="Products" count={products.length} color="green" link="/admin/products" />
          <DashboardCard title="Orders" count={adminOrders.length} color="red" link="/admin/orders" />
          <DashboardCard title="Users" count={users.length} color="blue" link="/admin/users" />
          <DashboardCard title="Out of Stock" count={outOfStock} color="orange" />
        </div>
      </div>
    </div>
  );
};
// DashboardCard component for displaying individual stats
const DashboardCard = ({ title, count, color, link }) => (
  <div className={`dashboard-card card-${color}`}>
    <div className="card-content">
      <div className="card-title">{title}</div>
      <div className="card-count">{count}</div>
    </div>
    {link && (
      <Link className="card-link" to={link}>
        View Details →
      </Link>
    )}
  </div>
);

export default AdminDashboard;
