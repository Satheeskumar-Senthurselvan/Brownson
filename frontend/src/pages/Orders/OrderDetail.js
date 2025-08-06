import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function OrderDetail() {
  const { id } = useParams();
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/order/${id}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrderDetail(data.order);
        } else {
          alert('Order not found!');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch order:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</h2>;
  }

  if (!orderDetail) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Order not found</h2>;
  }

  return (
    <div className='section'>
      <div className="order-detail-container">
        <h2 className='order-detail-title'>Order Details</h2>
        <p><strong>Order ID:</strong> {orderDetail._id}</p>
        <p><strong>Customer:</strong> {orderDetail.user.username}</p>
        <p><strong>Address:</strong> {orderDetail.user.deliveryAddress}</p>
        <p><strong>Contact:</strong> {orderDetail.user.contactNumber}</p>
        <p><strong>Status:</strong> {orderDetail.orderStatus}</p>
        <p><strong>Total Price:</strong> Rs {orderDetail.totalPrice}</p>

        <h3>Products:</h3>
        <table className="product-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {orderDetail.products.map(product => (
              <tr key={product.productId}>
                <td>
                  <img src={product.image} alt={product.productName} className="product-img" />
                </td>
                <td>{product.productName}</td>
                <td>{product.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}
