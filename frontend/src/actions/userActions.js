// src/actions/userActions.js
import axios from 'axios';
import {
  adminUsersRequest,
  adminUsersSuccess,
  adminUsersFail,
} from '../slices/userSlice';
import API_BASE_URL from '../config';

export const getUsers = () => async (dispatch) => {
  try {
    dispatch(adminUsersRequest());

    const { data } = await axios.get(`${API_BASE_URL}/api/auth/admin/users`, {
      withCredentials: true,
    });

    // ✅ Send data in { users } format to match reducer
    dispatch(adminUsersSuccess({ users: data.users }));
  } catch (error) {
    dispatch(adminUsersFail(error.response?.data?.message || error.message));
  }
};
