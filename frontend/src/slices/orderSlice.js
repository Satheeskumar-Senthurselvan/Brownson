// src/slices/orderSlice.js
import { createSlice } from '@reduxjs/toolkit';

const orderSlice = createSlice({
  name: 'orderState',
  initialState: {
    userOrders: [],
    orderDetail: null,
    loading: false,
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
});

export const { setUserOrders, setOrderDetail, setLoading } = orderSlice.actions;
export default orderSlice.reducer;
