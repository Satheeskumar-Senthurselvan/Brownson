import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import axios from 'axios';
import Sidebar from './Sidebar';
import './adminDashboard.css';

const AdminAllReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get('https://brownson-backend.onrender.com/api/product/admin/reviews', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          withCredentials: true,
        });

        setReviews(data.reviews);
      } catch (error) {
        console.error('❌ Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleView = (productId) => {
    navigate(`/admin/product/${productId}/reviews`);
  };

  const handleDeleteReview = async (reviewId, productId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await axios.delete(`https://brownson-backend.onrender.com/api/product/review`, {
        params: { id: reviewId, productId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        withCredentials: true,
      });

      // ✅ Remove the deleted review from the UI
      setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
    } catch (err) {
      console.error('❌ Failed to delete review:', err);
      alert('Failed to delete review');
    }
  };


  return (
    <div className="admin-container">
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="main-content">
        <h2 className="admin-title">All Product Reviews</h2>

        {loading ? (
          <div className="center-message">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="center-message">No reviews found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r, i) => (
                <tr key={i}>
                  <td>{r.productName}</td>
                  <td>{r.reviewer}</td>
                  <td>{r.rating}</td>
                  <td>{r.comment}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="view-btn" onClick={() => handleView(r.productId)}>
                        <FaEye />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteReview(r.reviewId, r.productId)}
                      >
                        🗑️
                      </button>

                    </div>
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

export default AdminAllReviewsPage;
