// store.js
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice.js';
import orderReducer from './slices/orderSlice.js'; // ✅ import order reducer

const reducer = combineReducers({
  productsState: productsReducer,
  orderState: orderReducer // ✅ add order slice
});

const store = configureStore({
  reducer,
});

export default store;
