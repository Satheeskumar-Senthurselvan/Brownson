import { createSlice } from "@reduxjs/toolkit";

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    loading: false,
    isProductCreated: false,
    products: [],
    error: null
  },
  reducers: {
    productsRequest(state) {
      state.loading = true;
    },
    productsSuccess(state, action) {
      state.loading = false;
      state.products = action.payload.products;
      state.productsCount = action.payload.count;
      state.resPerPage = action.payload.resPerPage;
    },
    productsFail(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    adminProductsRequest(state) {
      state.loading = true;
    },
    adminProductsSuccess(state, action) {
      state.loading = false;
      state.products = action.payload.products;
    },
    adminProductsFail(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    newProductRequest(state) {
      state.loading = true;
    },
    newProductSuccess(state, action) {
      state.loading = false;
      state.isProductCreated = true;
      state.product = action.payload;
    },
    newProductFail(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    clearProductCreated(state) {
      state.isProductCreated = false;
    }
  }
});

const { actions, reducer } = productsSlice;

export const {
  productsRequest,
  productsSuccess,
  productsFail,
  adminProductsFail,
  adminProductsRequest,
  adminProductsSuccess,
  newProductRequest,
  newProductSuccess,
  newProductFail,
  clearError,
  clearProductCreated
} = actions;

export default reducer;
