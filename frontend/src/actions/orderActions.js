import axios from 'axios';

// Action types for admin orders
export const ADMIN_ORDERS_REQUEST = 'order/ADMIN_ORDERS_REQUEST';
export const ADMIN_ORDERS_SUCCESS = 'order/ADMIN_ORDERS_SUCCESS';
export const ADMIN_ORDERS_FAIL = 'order/ADMIN_ORDERS_FAIL';

// Optional user orders action type (if used outside slice)
export const SET_USER_ORDERS = 'order/SET_USER_ORDERS';

// ✅ Action: Fetch orders for logged-in user
export const userOrders = () => async (dispatch) => {
  try {
    const { data } = await axios.get('https://brownson-backend.onrender.com/api/order/my-orders', {
      withCredentials: true,
    });

    if (data.success) {
      dispatch({
        type: SET_USER_ORDERS,
        payload: data.orders,
      });
    }
  } catch (err) {
    console.error('❌ User Orders Error:', err.message);
  }
};

// ✅ Action: Fetch all orders for admin
export const adminOrders = () => async (dispatch) => {
  try {
    dispatch({ type: ADMIN_ORDERS_REQUEST });

    const { data } = await axios.get('https://brownson-backend.onrender.com/api/order/admin/orders', {
      withCredentials: true,
    });

    if (data.success) {
      dispatch({
        type: ADMIN_ORDERS_SUCCESS,
        payload: data.orders,
      });
    }
  } catch (err) {
    dispatch({
      type: ADMIN_ORDERS_FAIL,
      payload: err.response?.data?.error || err.message,
    });
  }
};
