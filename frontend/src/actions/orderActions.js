
export const userOrders = () => async (dispatch) => {
  try {
    const res = await fetch('/api/order/my-orders', {
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success) {
      dispatch({ type: 'SET_USER_ORDERS', payload: data.orders });
    }
  } catch (err) {
    console.error('Failed to fetch orders', err);
  }
};
