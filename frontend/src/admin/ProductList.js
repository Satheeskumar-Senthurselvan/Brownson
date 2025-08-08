// src/admin/ProductList.js

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import Sidebar from "../admin/Sidebar";
import Loader from "../layouts/Loader";

import {
  getAdminProducts,
  deleteProduct,
} from "../actions/productActions";

import {
  clearError as clearListError,
} from "../slices/productsSlice";

import {
  clearProductDeleted,
  clearError as clearDeleteError,
} from "../slices/productSlice";

import "./adminDashboard.css";

const ProductList = () => {
  const dispatch = useDispatch();

  const { products = [], loading, error: listError } = useSelector(
    (state) => state.productsState
  );
  const { isProductDeleted, error: deleteError } = useSelector(
    (state) => state.productState
  );

  useEffect(() => {
    dispatch(getAdminProducts());
  }, [dispatch]);

  useEffect(() => {
    if (listError) {
      toast.error(listError);
      dispatch(clearListError());
    }

    if (deleteError) {
      toast.error(deleteError);
      dispatch(clearDeleteError());
    }

    if (isProductDeleted) {
      toast.success("Product deleted successfully");
      dispatch(clearProductDeleted());
      dispatch(getAdminProducts());
    }
  }, [listError, deleteError, isProductDeleted, dispatch]);

  const handleDelete = (productId) => {
    const confirm = window.confirm("Are you sure you want to delete this product?");
    if (confirm) dispatch(deleteProduct(productId));
  };

  return (
    <div className="admin-container">
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="main-content">
        <h2>Product List</h2>

        {loading ? (
          <Loader />
        ) : (
          <table className="product-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price (Rs.)</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(({ _id, name, price, stock }) => (
                <tr key={_id}>
                  <td>{_id}</td>
                  <td>{name}</td>
                  <td>{price}</td>
                  <td>{stock}</td>
                  <td>
                    <Link to={`/admin/product/${_id}`} className="edit-btn">✏️</Link>
                    <button className="delete-btn" onClick={() => handleDelete(_id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductList;
