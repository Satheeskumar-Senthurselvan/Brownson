import Order from '../Models/OrderModel.js';
import Product from '../Models/productModel.js';
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
        contactNumber,
      },
      products,
      totalPrice,
      paymentStatus,
    });

    const savedOrder = await newOrder.save();

    // ✅ Reduce stock for each product
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock = product.stock - item.quantity;
        if (product.stock < 0) product.stock = 0; // Prevent negative stock
        await product.save();
      }
    }

    res.status(201).json({ success: true, order: savedOrder });
  } catch (err) {
    console.error('❌ Create Order Error:', err);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'user.userId': req.user._id });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error('Fetch Orders Error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized access' });
    }
    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('❌ Get Order By ID Error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    if (!['packing', 'ready to ship', 'shipping', 'handed over'].includes(orderStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order,
    });
  } catch (err) {
    console.error('❌ Update Status Error:', err);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
};


export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error('Fetch All Orders Error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    await order.deleteOne();
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Order Error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete order' });
  }
};

export const getOrderByIdForAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('❌ Admin Get Order By ID Error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
};


