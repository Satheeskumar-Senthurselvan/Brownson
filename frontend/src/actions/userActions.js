// src/actions/userActions.js
import axios from 'axios';
import {
  adminUsersRequest,
  adminUsersSuccess,
  adminUsersFail,
  userRequest,
  userSuccess,
  userFail,
} from '../slices/userSlice';

// This function fetches a list of all users for an admin dashboard.
export const getUsers = () => async (dispatch) => {
  try {
    dispatch(adminUsersRequest());

    const { data } = await axios.get('https://brownson-backend.onrender.com/api/auth/admin/users', {
      withCredentials: true,
    });

    // Send data in { users } format to match reducer
    dispatch(adminUsersSuccess({ users: data.users }));
  } catch (error) {
    dispatch(adminUsersFail(error.response?.data?.message || error.message));
  }
};

// This is the new function to fetch a single user's details by their email.
// It resolves the 404 error you were seeing on the profile page.
export const getUserByEmail = (email) => async (dispatch) => {
  try {
    dispatch(userRequest());

    // Use a template literal to construct the correct URL with the email parameter.
    const { data } = await axios.get(`https://brownson-backend.onrender.com/api/auth/user/${email}`, {
      withCredentials: true,
    });

    // Dispatch a success action with the fetched user data.
    dispatch(userSuccess(data.user));
  } catch (error) {
    // Dispatch a fail action with the error message.
    dispatch(userFail(error.response?.data?.message || error.message));
  }
};
