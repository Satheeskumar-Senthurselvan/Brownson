import Cart from '../Models/Cart.js';
import Product from '../Models/productModel.js'; // Import the Product model

export const addToCart = async (req, res) => {
  // Only expect productId and quantity from the request body
  const { productId, quantity } = req.body;
  const userId = req.user._id; // This is the user ID from authentication

  try {
    // 1. Validate incoming quantity
    if (typeof quantity !== 'number' || quantity <= 0) {
      console.log(`CartController: Invalid quantity received: ${quantity}`);
      return res.status(400).json({ success: false, error: 'Quantity must be a positive number.' });
    }

    // 2. Find the product details using productId
    const product = await Product.findById(productId);

    if (!product) {
      console.log(`CartController: Product not found for ID: ${productId}`);
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    // Extract necessary details from the found product
    const productName = product.name;
    const price = product.price;
    const image = product.images && product.images.length > 0 ? product.images[0].image : '/img/placeholder.jpg';

    // Calculate totalPrice
    const totalPrice = quantity * price;

    // Find the cart item for the specific user and product using 'userId'
    let cartItem = await Cart.findOne({ userId: userId, productId: productId }); // Use 'userId' here

    if (cartItem) {
      // If item already exists, update its quantity and totalPrice
      cartItem.quantity = quantity; // Update to the new quantity
      cartItem.totalPrice = totalPrice;
      await cartItem.save();
      console.log(`CartController: Updated cart item for user ${userId}, product ${productId}. New quantity: ${quantity}, totalPrice: ${totalPrice}`);
      res.status(200).json({ success: true, message: 'Product quantity updated in cart', cart: cartItem });
    } else {
      // If item does not exist, create a new one
      cartItem = new Cart({
        userId: userId, // Use 'userId' here
        productId,
        productName,
        image,
        quantity,
        price,
        totalPrice,
      });
      await cartItem.save();
      console.log(`CartController: Added new cart item for user ${userId}, product ${productId}. Quantity: ${quantity}, totalPrice: ${totalPrice}`);
      res.status(200).json({ success: true, message: 'Product added to cart', cart: cartItem });
    }

  } catch (err) {
    console.error('CartController Error in addToCart:', err);
    // Handle CastError for invalid product IDs specifically
    if (err.name === 'CastError' && err.path === '_id') {
      return res.status(400).json({ success: false, error: 'Invalid Product ID format.' });
    }
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Failed to add to cart due to server error.' });
  }
};

export const getUserCart = async (req, res) => {
  try {
    // Populate product details for a more complete cart view using 'userId'
    const cartItems = await Cart.find({ userId: req.user._id }).populate('productId', 'name price images'); // Use 'userId' here
    
    console.log(`CartController: Fetched cart for user ${req.user._id}. Items count: ${cartItems.length}`);
    
    // Always return a structured cart object, even if no items
    res.status(200).json({ success: true, cart: { user: req.user._id, items: cartItems } }); 
  } catch (err) {
    console.error('CartController Error in getUserCart:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch cart.' });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'Product ID is required to remove from cart.' });
    }
    
    // Find and delete the cart item using 'userId'
    const result = await Cart.findOneAndDelete({ userId: userId, productId: productId }); // Use 'userId' here

    if (!result) {
      console.log(`CartController: Attempted to remove non-existent item for user ${userId}, product ${productId}`);
      return res.status(404).json({ success: false, error: 'Item not found in cart.' });
    }

    // After removal, check if there are any remaining items for the user using 'userId'
    const updatedCartItems = await Cart.find({ userId: userId }).populate('productId', 'name price images'); // Use 'userId' here
    
    console.log(`CartController: Removed item ${productId} for user ${userId}. Remaining items: ${updatedCartItems.length}`);
    res.status(200).json({ success: true, message: 'Product removed from cart successfully', cart: { user: userId, items: updatedCartItems } });
  } catch (err) {
    console.error('CartController Error in removeFromCart:', err);
    // Handle CastError for invalid product IDs specifically
    if (err.name === 'CastError' && err.path === 'productId') {
      return res.status(400).json({ success: false, error: 'Invalid Product ID format.' });
    }
    res.status(500).json({ success: false, error: 'Failed to remove item from cart.' });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    // Delete all cart items for the user using 'userId'
    await Cart.deleteMany({ userId: userId }); // Use 'userId' here
    console.log(`CartController: Cleared cart for user ${userId}`);
    res.status(200).json({ success: true, message: 'Cart cleared successfully', cart: { user: userId, items: [] } });
  } catch (err) {
    console.error('CartController Error in clearCart:', err);
    res.status(500).json({ success: false, error: 'Failed to clear cart.' });
  }
};