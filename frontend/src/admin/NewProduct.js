import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "./Sidebar";

import { createNewProduct } from "../actions/productActions";
import { clearError, clearProductCreated } from "../slices/productsSlice";

import "react-toastify/dist/ReactToastify.css";
import "./adminDashboard.css";

const NewProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, isProductCreated, error } = useSelector((state) => state.productsState);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(0);
  const [seller, setSeller] = useState("");
  const [quantityValue, setQuantityValue] = useState(0);
  const [quantityUnit, setQuantityUnit] = useState("");
  const [images, setImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);

  const categories = [
    "Jellies",
    "Custards",
    "Food essences",
    "Cake ingredients",
    "Artificial colors and flavors",
  ];

  const units = ["ml", "g", "kg", "l", "pcs"];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([]);
    setImagesPreview([]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.readyState === 2) {
          setImagesPreview((prev) => [...prev, reader.result]);
          setImages((prev) => [...prev, file]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("description", description);
    formData.append("seller", seller);
    formData.append("category", category);
    formData.append("quantity[value]", quantityValue);
    formData.append("quantity[unit]", quantityUnit);

    images.forEach((image) => formData.append("images", image));

    dispatch(createNewProduct(formData));
  };

  useEffect(() => {
    if (isProductCreated) {
      toast.success("Product Created Successfully!", { position: "bottom-center" });
      dispatch(clearProductCreated());
      navigate("/admin/products");
    }

    if (error) {
      toast.error(error, { position: "bottom-center" });
      dispatch(clearError());
    }
  }, [isProductCreated, error, dispatch, navigate]);

  return (
    <div className="new-product-container">
      <Sidebar />
      <div className="new-product-content">
        <form onSubmit={handleSubmit} className="new-product-form" encType="multipart/form-data">
          <h2 className="form-title">Add New Product</h2>

          <div className="form-group">
            <label>Product Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
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
            <label>Seller Name</label>
            <input type="text" value={seller} onChange={(e) => setSeller(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Product Images</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} />
            <div className="image-preview-container">
              {imagesPreview.map((img, index) => (
                <img key={index} src={img} alt="Preview" className="preview-image" />
              ))}
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Creating..." : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewProduct;
