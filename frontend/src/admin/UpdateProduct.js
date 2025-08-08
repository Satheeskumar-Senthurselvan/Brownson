// src/admin/UpdateProduct.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import { toast } from "react-toastify";
import "./adminDashboard.css";

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [seller, setSeller] = useState("");
  const [quantityValue, setQuantityValue] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("");

  const categories = [
    "Jellies",
    "Custards",
    "Food essences",
    "Cake ingredients",
    "Artificial colors and flavors",
  ];
  const units = ["ml", "g", "kg", "l", "pcs"];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(
          `https://brownson-backend.onrender.com/api/product/product/${id}`,
          { withCredentials: true }
        );
        setProduct(data.product);
        setName(data.product.name);
        setPrice(data.product.price);
        setDescription(data.product.description);
        setCategory(data.product.category);
        setStock(data.product.stock);
        setSeller(data.product.seller);
        setQuantityValue(data.product.quantity?.value || 0);
        setQuantityUnit(data.product.quantity?.unit || "");
        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch product details");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `https://brownson-backend.onrender.com/api/product/admin/product/${id}`,
        {
          name,
          price,
          description,
          category,
          stock,
          seller,
          imagesCleared: 'false',
          quantity: {
            value: quantityValue,
            unit: quantityUnit,
          },
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Product updated successfully");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="new-product-container">
      <div className="new-product-content">
        <form onSubmit={handleUpdate} className="new-product-form">
          <h2 className="form-title">Update Product</h2>

          <div className="form-group">
            <label>Product Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Price (Rs)</label>
            <input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="5" required />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity Value</label>
            <input type="number" min={1} value={quantityValue} onChange={(e) => setQuantityValue(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Quantity Unit</label>
            <select value={quantityUnit} onChange={(e) => setQuantityUnit(e.target.value)} required>
              <option value="">Select Unit</option>
              {units.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Stock</label>
            <input type="number" min={1} value={stock} onChange={(e) => setStock(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Seller</label>
            <input value={seller} onChange={(e) => setSeller(e.target.value)} required />
          </div>

          <button type="submit" className="submit-button">
            Update Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProduct;
