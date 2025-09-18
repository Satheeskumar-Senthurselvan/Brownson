// src/slices/orderSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {
  ADMIN_ORDERS_REQUEST,
  ADMIN_ORDERS_SUCCESS,
  ADMIN_ORDERS_FAIL,
  SET_USER_ORDERS,
} from '../actions/orderActions';

const orderSlice = createSlice({
  name: 'orderState',
  initialState: {
    userOrders: [],
    adminOrders: [],  // ✅ Add this line
    orderDetail: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUserOrders: (state, action) => {
      state.userOrders = action.payload;
    },
    setOrderDetail: (state, action) => {
      state.orderDetail = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(ADMIN_ORDERS_REQUEST, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ADMIN_ORDERS_SUCCESS, (state, action) => {
        state.loading = false;
        state.adminOrders = action.payload;  // ✅ Store in adminOrders
      })
      .addCase(ADMIN_ORDERS_FAIL, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUserOrders, setOrderDetail, setLoading } = orderSlice.actions;
export default orderSlice.reducer;
