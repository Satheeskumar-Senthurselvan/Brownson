import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: 'product',
  initialState: {
    isProductDeleted: false,
    error: null
  },
  reducers: {
    setProductDeleted(state, action) {
      state.isProductDeleted = action.payload;
    },
    clearProductDeleted(state) {
      state.isProductDeleted = false;
    },
    setProductDeleteError(state, action) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    }
  }
});

export const {
  setProductDeleted,
  clearProductDeleted,
  setProductDeleteError,
  clearError
} = productSlice.actions;

export default productSlice.reducer;
