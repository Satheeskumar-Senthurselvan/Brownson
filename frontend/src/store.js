import { combineReducers, configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice.js';
import productReducer from './slices/productSlice.js'; // ✅ NEW
import orderReducer from './slices/orderSlice.js';
import userReducer from './slices/userSlice.js';

const reducer = combineReducers({
  productsState: productsReducer,
  productState: productReducer, // ✅ ADD this
  orderState: orderReducer,
  userState: userReducer,
});

const store = configureStore({
  reducer,
});

export default store;
