// App.js - Main application component that manages routing and global state
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from './pages/auth/Login';
import Header from './components/Header';
import Home from './pages/home/Home';
import UserProfile from './pages/user/UserProfile';
import Footer from './components/Footer';
import UpdateProfile from './pages/user/UpdateProfile';
import StorePage from './pages/Store/StorePage'; 
import ProductDetail from './pages/Store/ProductDetail';
import CartPage from './pages/Cart/CartPage';
import ShippingPage from './pages/Cart/ShippingPage';
import PaymentPage from './pages/Cart/PaymentPage';
import PlaceOrder from './pages/Cart/PlaceOrder';
import UserOrders from './pages/Orders/UserOrders';
import OrderDetail from './pages/Orders/OrderDetail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminDashboard from './admin/AdminDashboard';
import ProductList from './admin/ProductList';
import UpdateProduct from './admin/UpdateProduct';
import NewProduct from './admin/NewProduct';
import AdminAllUsersPage from './admin/AdminAllUsersPage';
import AdminUserDetailsPage from './admin/AdminUserDetailsPage';
import AdminOrderList from './admin/AdminOrderList';
import SingleOrderPage from './admin/SingleOrderPage';
import AdminAllReviewsPage from './admin/AdminAllReviewsPage';
import SingleProductReviewsPage from './admin/SingleProductReviewsPage';
import Chatbot from './pages/Chatbot/Chatbot';

const App = () => {
  const [coins, setCoins] = useState(0);

  return (
    <div>
      <Header />
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* User Routes */}
          <Route path='/userProfile' element={<UserProfile />} />
          <Route path='/update-profile' element={<UpdateProfile />} />
          <Route path='/store' element={<StorePage />} />
          <Route path='/product/:id' element={<ProductDetail />} /> 
          <Route path ='/cart' element={<CartPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/UserOrders" element= {<UserOrders/>} />
          <Route path= "/order/:id" element = {<OrderDetail />} />
          <Route path="/chatbot" element={<Chatbot />} />

          {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<ProductList />} />
        <Route path="/admin/product/:id" element={<UpdateProduct />} />
        <Route path="/admin/products/create" element={<NewProduct />} />
        <Route path="/admin/users" element={<AdminAllUsersPage />} />
        <Route path="/admin/user/:email" element={<AdminUserDetailsPage />} />
        <Route path="/admin/orders" element={<AdminOrderList />} />
        <Route path="/admin/order/:id" element={<SingleOrderPage />} />
        <Route path="/admin/reviews" element={<AdminAllReviewsPage />} />
        <Route path="/admin/product/:productId/reviews" element={<SingleProductReviewsPage />} />
        </Routes>
      <Footer />
    </div>
  );
};

export default App;
