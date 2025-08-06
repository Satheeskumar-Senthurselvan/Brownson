// App.js - Main application component that manages routing and global state
import React from 'react';
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

const App = () => {

  return (
    <div>
      <Header />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      <Footer />
    </div>
  );
};

export default App;
