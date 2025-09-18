import Cart from '../Models/Cart.js';
import Product from '../Models/productModel.js';


export const addToCart = async (req, res) => {
  const { productId, productName, image, quantity, price } = req.body;
  const userId = req.user._id;

  try {
    let cartItem = await Cart.findOne({ userId, productId });

    if (cartItem) {
      cartItem.quantity = quantity;
      cartItem.totalPrice = quantity * price;
      await cartItem.save();
    } else {
      cartItem = new Cart({
        userId,
        productId,
        productName,
        image,
        quantity,
        price,
        totalPrice: quantity * price,
      });
      await cartItem.save();
    }

    res.status(200).json({ success: true, cartItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to add to cart' });
  }
};

export const getUserCart = async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.user._id });

    const enrichedItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findById(item.productId);
        return {
          ...item.toObject(),
          stock: product?.stock ?? 0, // Add stock to cart item
        };
      })
    );

    res.status(200).json({ success: true, cartItems: enrichedItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch cart' });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    await Cart.findOneAndDelete({ userId: req.user._id, productId });
    res.status(200).json({ success: true, message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to remove item' });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({ userId: req.user._id });
    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to clear cart' });
  }
};
