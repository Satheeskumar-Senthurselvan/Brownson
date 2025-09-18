// StorePage.js
import React, { useEffect, useState } from 'react';
import './StorePage.css';
import { Link, useLocation } from 'react-router-dom';

const StorePage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Available categories
  const categories = [
    '',
    'Jellies',
    'Custards',
    'Food essences',
    'Cake ingredients',
    'Artificial colors and flavors',
  ];

  // ✅ Get category from URL (e.g., /store?category=Jellies)
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();

  // ✅ Fetch products from backend and apply initial category filter if present
  useEffect(() => {
    fetch('http://localhost:4000/api/product/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const initialCategory = query.get('category') || '';
          setProducts(data.products);
          setSelectedCategory(initialCategory);
        }
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
      });
  }, []);

  // ✅ Apply filtering whenever products, search term or category changes
  useEffect(() => {
    let results = [...products];

    if (searchTerm.trim() !== '') {
      results = results.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== '') {
      results = results.filter(
        (product) => product.category === selectedCategory
      );
    }

    setFilteredProducts(results);
  }, [searchTerm, selectedCategory, products]);

  return (
    <div className="store-wrapper">
      <div className="store-header-bar">
        <h1 className="Brownson-title">Brownson Store</h1>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search product..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Category Dropdown */}
        <select
          className="category-dropdown"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.slice(1).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Product List */}
      <div className="products-container">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <div className="product-item" key={index}>
              <div className="image-container">
                <img
                  src={product.images[0]?.image || '/img/default.jpg'}
                  alt={product.name}
                />
              </div>
              <div className="content">
                <h2>{product.name}</h2>
                <p>Category: {product.category}</p>
                <p>Price: Rs {product.price}</p>
                <p>Quantity: {product.quantity?.value} {product.quantity?.unit}</p>

                {/* Rating */}
                <div className="ratings">
                  <div className="rating-outer">
                    <div
                      className="rating-inner"
                      style={{
                        width: `${(parseFloat(product.ratings) / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="review-count">
                    ({product.numOfReviews} Reviews)
                  </span>
                </div>

                <Link to={`/product/${product._id}`} className="btn-view">
                  View Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="no-products">No matching products found</p>
        )}
      </div>
    </div>
  );
};

export default StorePage;
