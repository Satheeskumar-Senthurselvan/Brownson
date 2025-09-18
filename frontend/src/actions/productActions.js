// src/actions/productActions.js
import axios from 'axios';
import {
  adminProductsRequest,
  adminProductsSuccess,
  adminProductsFail,
  newProductRequest,
  newProductSuccess,
  newProductFail
} from '../slices/productsSlice';
import {
  setProductDeleted,
  setProductDeleteError
} from '../slices/productSlice';
import API_BASE_URL from '../config';

// Get all admin products
export const getAdminProducts = () => async (dispatch) => {
  try {
    dispatch(adminProductsRequest());

    const { data } = await axios.get(`${API_BASE_URL}/api/product/admin/products`, {
      withCredentials: true,
    });

    dispatch(adminProductsSuccess({ products: data.products }));
  } catch (error) {
    dispatch(adminProductsFail(error.response?.data?.message || error.message));
  }
};

// Create new product
export const createNewProduct = (formData) => async (dispatch) => {
  try {
    dispatch(newProductRequest());

    const { data } = await axios.post(`${API_BASE_URL}/api/product/admin/product/new`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });

    dispatch(newProductSuccess(data.product));
  } catch (error) {
    dispatch(newProductFail(error.response?.data?.message || error.message));
  }
};

// ✅ Delete product by ID
export const deleteProduct = (id) => async (dispatch) => {
  try {
    await axios.delete(`${API_BASE_URL}/api/product/admin/product/${id}`, {
      withCredentials: true,
    });

    dispatch(setProductDeleted(true));
  } catch (error) {
    dispatch(setProductDeleteError(error.response?.data?.message || error.message));
  }
};
