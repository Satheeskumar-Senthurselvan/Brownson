// src/actions/userActions.js
import axios from 'axios';
import {
  adminUsersRequest,
  adminUsersSuccess,
  adminUsersFail,
} from '../slices/userSlice';

export const getUsers = () => async (dispatch) => {
  try {
    dispatch(adminUsersRequest());

    const { data } = await axios.get('https://brownson-backend.onrender.com/api/auth/admin/users', {
      withCredentials: true,
    });

    // ✅ Send data in { users } format to match reducer
    dispatch(adminUsersSuccess({ users: data.users }));
  } catch (error) {
    dispatch(adminUsersFail(error.response?.data?.message || error.message));
  }
};
