import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import './adminDashboard.css';
import { useParams } from 'react-router-dom';
import API_BASE_URL from '../config';

const SingleProductReviewsPage = () => {
  const { productId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [productName, setProductName] = useState('');
  const [productImage, setProductImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/product/reviews/${productId}`, {
          headers: {
            Authorization: localStorage.getItem('token'),
          },
        });

        setReviews(data.reviews);
        if (data.reviews.length > 0) {
          setProductName(data.reviews[0].productName || '');
          setProductImage(data.reviews[0].productImage || '');
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch product reviews:', error);
        if (error.response?.status === 404) {
          setError('Product not found. It may have been deleted.');
        } else {
          setError('An error occurred while fetching reviews.');
        }
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="main-content">
        <h2 className="admin-title">Reviews for: {productName}</h2>

        {productImage && (
          <div style={{  marginBottom: '20px' }}>
            <img
              src={productImage}
              alt="Product"
              style={{
                width: '250px',
                height: '250px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '2px solid #B82933',
              }}
            />
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : reviews.length === 0 ? (
          <p>No reviews found for this product.</p>
        ) : (
          <div className="review-card-container">
            {reviews.map((r, i) => (
              <div key={i} className="review-card">
                <h4 className="review-user">{r.user?.name || 'Anonymous'}</h4>
                <div className="review-rating">Rating: <strong>{r.rating}</strong></div>
                <p className="review-comment">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleProductReviewsPage;
