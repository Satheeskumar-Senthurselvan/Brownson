// ProductReview.js
import React from 'react';
import './StorePage.css';

export default function ProductReview({ reviews }) {
  return (
    <div className="reviews w-75" style={{ margin: 'auto', marginTop: '40px' }}>
      <h3>Other's Reviews:</h3>
      <hr />
      {reviews && reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review._id} className="review-card my-3" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Reviewer Profile Image */}
            <img
              src={review.user?.ProfileImg || '/img/uploadsImage/1751522584148-wadigala_1.jpeg'}
              alt="Reviewer"
              className="review-user-img"
            />

            {/* Review Content */}
            <div style={{ flex: 1 }}>
              {/* Rating Stars */}
              <div className="rating-outer">
                <div
                  className="rating-inner"
                  style={{ width: `${(parseFloat(review.rating) / 5) * 100}%` }}
                ></div>
              </div>

              {/* Reviewer Name */}
              <p className="review_user" style={{ fontWeight: 'bold', margin: 0 }}>
                by {review.user?.name || 'Anonymous'}
              </p>

              {/* Comment */}
              <p className="review_comment" style={{ marginTop: '5px' }}>
                {review.comment}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted">No reviews yet.</p>
      )}
    </div>
  );
}
