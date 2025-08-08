import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    loading: false,
    user: {}, // Added for a single user
    users: [],
    error: null,
  },
  reducers: {
    userRequest: (state) => {
      state.loading = true;
    },
    userSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
    },
    userFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    adminUsersRequest: (state) => {
      state.loading = true;
    },
    adminUsersSuccess: (state, action) => {
      state.loading = false;
      state.users = action.payload.users;
    },
    adminUsersFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearUserError: (state) => {
      state.error = null;
    }
  },
});

export const {
  userRequest,
  userSuccess,
  userFail,
  adminUsersRequest,
  adminUsersSuccess,
  adminUsersFail,
  clearUserError,
} = userSlice.actions;

export default userSlice.reducer;