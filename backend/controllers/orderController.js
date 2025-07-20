import Order from '../Models/OrderModel.js';

// Create new order
export const createOrder = async (req, res) => {
  try {
    const { products, totalPrice, paymentStatus, username, deliveryAddress, contactNumber } = req.body;

    if (!username || !deliveryAddress || !contactNumber) {
      return res.status(400).json({ success: false, error: 'Missing shipping details' });
    }

    const newOrder = new Order({
      user: {
        userId: req.user._id,
        username,
        deliveryAddress,
        contactNumber
      },
      products,
      totalPrice,
      paymentStatus
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, order: savedOrder });
  } catch (err) {
    console.error('❌ Create Order Error:', err);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
};


// Get logged-in user's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'user.userId': req.user._id });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error('Fetch Orders Error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};

// ✅ Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Ensure only the owner or admin can view it
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized access' });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('❌ Get Order By ID Error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
};


// Update order status (admin/staff usage)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    order.orderStatus = status;
    await order.save();

    res.status(200).json({ success: true, message: 'Order status updated', order });
  } catch (err) {
    console.error('Update Status Error:', err);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
};
