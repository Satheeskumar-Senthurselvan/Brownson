// StorePage.js
import React, { useEffect, useState } from 'react';
import './StorePage.css';
import { Link } from 'react-router-dom';

const StorePage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    '',
    'Jellies',
    'Custards',
    'Food essences',
    'Cake ingredients',
    'Artificial colors and flavors'
  ];

  useEffect(() => {
    fetch('/api/product/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.products);
          setFilteredProducts(data.products);
        }
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
      });
  }, []);

  useEffect(() => {
    let results = [...products];

    if (searchTerm.trim() !== '') {
      results = results.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== '') {
      results = results.filter(product =>
        product.category === selectedCategory
      );
    }

    setFilteredProducts(results);
  }, [searchTerm, selectedCategory, products]);

  return (
    <div className="store-wrapper">
      <div className="store-header-bar">
        <h1 className="Brownson-title">Brownson Store</h1>

        
          <input
            type="text"
            placeholder="Search product..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="category-dropdown"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.slice(1).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
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

                {/* Rating */}
                <div className="ratings">
                  <div className="rating-outer">
                    <div
                      className="rating-inner"
                      style={{
                        width: `${(parseFloat(product.ratings) / 5) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="review-count">({product.numOfReviews} Reviews)</span>
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
