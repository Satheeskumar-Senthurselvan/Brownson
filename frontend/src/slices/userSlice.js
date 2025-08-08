import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    loading: false,
    users: [],
    error: null,
  },
  reducers: {
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
  adminUsersRequest,
  adminUsersSuccess,
  adminUsersFail,
  clearUserError,
} = userSlice.actions;

export default userSlice.reducer;
