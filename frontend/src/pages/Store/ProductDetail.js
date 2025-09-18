import React, { Fragment, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './StorePage.css';
import ProductReview from './ProductReview';
import API_BASE_URL from '../../config';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showReviewBox, setShowReviewBox] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewErrors, setReviewErrors] = useState({});

  const loadProduct = async () => {
    const res = await fetch(`${API_BASE_URL}/api/product/product/${id}`, {
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success) {
      setProduct(data.product);
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/product/reviews/${id}`, {
        credentials: 'include',
      });

      const contentType = res.headers.get('content-type');
      if (!res.ok || !contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error(' Invalid JSON Response:', text);
        throw new Error('Invalid JSON response from server');
      }

      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      } else {
        console.error('Failed to load reviews:', data);
      }
    } catch (error) {
      console.error('Review fetch failed:', error);
    }
  };

  useEffect(() => {
    loadProduct();
    loadReviews();
  }, [id]);

  const decreaseQty = () => {
    if (quantity <= 1) return;
    setQuantity(prev => prev - 1);
  };

  const increaseQty = () => {
    if (quantity >= product.stock) return;
    setQuantity(prev => prev + 1);
  };

  const reviewHandler = async () => {
    const errors = {};
    if (!rating) errors.rating = 'Rating is required';
    if (!comment.trim()) errors.comment = 'Comment is required';
    setReviewErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/product/review`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id, rating, comment })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Review submitted successfully!');
        setShowReviewBox(false);
        setRating(0);
        setComment('');
        setReviewErrors({});
        loadReviews();
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Review error:', err);
      toast.error('Something went wrong');
    }
  };

  const addToCartHandler = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          productName: product.name,
          image: product.images?.[0]?.image || '/img/default.jpg',
          quantity,
          price: product.price,
          totalPrice: quantity * product.price
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Product added to cart!');
      } else {
        toast.error(data.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Something went wrong while adding to cart.');
    }
  };

  return (
    <Fragment>
      {loading ? (
        <h2 style={{ textAlign: 'center' }}>Loading...</h2>
      ) : (
        <div className="store-wrapper">
          <h1 className="store-title">{product.name}</h1>

          <div className="product-container" style={{ justifyContent: 'center' }}>
            <div className="product-item" style={{ width: '90%' }}>
              <div className="image-container" style={{ flex: 'unset', marginRight: '40px' }}>
                <img
                  src={product.images?.[0]?.image || '/img/default.jpg'}
                  alt={product.name}
                  style={{ width: '400px', height: 'auto' }}
                />
              </div>

              <div className="content">
                <p><strong>Product ID:</strong> {product._id}</p>
                <p><strong>Description:</strong> {product.description}</p>
                <p><strong>Price:</strong> Rs {product.price}</p>
                <p><strong>Quantity:</strong> {product.quantity?.value} {product.quantity?.unit}</p>
                <p><strong>Stock:</strong> {product.stock}</p>
                <p><strong>Status:</strong> <span style={{ color: product.stock > 0 ? 'green' : 'red' }}>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></p>
                <p><strong>Seller:</strong> {product.seller}</p>

                <div className="stockCounter">
                  <button className="btn-view" onClick={decreaseQty}>-</button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val > 0 && val <= product.stock) setQuantity(val);
                    }}
                    style={{ width: '50px', textAlign: 'center', margin: '0 10px' }}
                  />
                  <button className="btn-view" onClick={increaseQty}>+</button>
                </div>

                <div className="ratings">
                  <div className="rating-outer">
                    <div className="rating-inner" style={{ width: `${(parseFloat(product.ratings) / 5) * 100}%` }}></div>
                  </div>
                  <span className="review-count">({product.numOfReviews} Reviews)</span>
                </div>

                <button className="btn-view" style={{ marginTop: '10px', marginLeft: '10px' }} onClick={addToCartHandler}>Add to Cart</button>
                <button className="btn-view" onClick={() => setShowReviewBox(true)}>Submit Your Review</button>

                {showReviewBox && (
                  <div className="review-popup" style={{ marginTop: '20px' }}>
                    <h3>Submit Review</h3>

                    <ul className="stars" style={{ listStyle: 'none', padding: 0, display: 'flex' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <li
                          key={star}
                          className={`star ${star <= rating ? 'orange' : ''}`}
                          onClick={() => setRating(star)}
                          style={{
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: star <= rating ? '#B82933' : '#ccc',
                            border: reviewErrors.rating ? '1px solid red' : 'none',
                            padding: '2px'
                          }}
                        >
                          ★
                        </li>
                      ))}
                    </ul>

                    <textarea
                      placeholder={reviewErrors.comment || "Write your comment..."}
                      className="form-control mt-3"
                      value={comment}
                      onChange={(e) => {
                        setComment(e.target.value);
                        if (reviewErrors.comment) {
                          setReviewErrors({ ...reviewErrors, comment: '' });
                        }
                      }}
                      style={{
                        width: '100%',
                        minHeight: '100px',
                        marginBottom: '10px',
                        border: reviewErrors.comment ? '1px solid red' : ''
                      }}
                    ></textarea>

                    <button className="btn-view" onClick={reviewHandler}>Submit</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <ProductReview reviews={reviews} />
        </div>
      )}
    </Fragment>
  );
};

export default ProductDetail;
