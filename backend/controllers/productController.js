// controllers/productController.js
import Product from '../models/productModel.js';
import ErrorHandler from '../utils/errorHandler.js';
import catchAsyncError from '../middlewares/catchAsyncError.js';

// Get all products
export const getProducts = catchAsyncError(async (req, res, next) => {
  const products = await Product.find();
  res.status(200).json({ success: true, products });
});

// Create new product
export const newProduct = catchAsyncError(async (req, res, next) => {
  const BASE_URL = `${req.protocol}://${req.get('host')}`;
  console.log(BASE_URL);
  let images = [];

  if (req.files && req.files.length > 0) {
    req.files.forEach(file => {
      images.push({ image: `/img/product/${file.filename}` });
    });
  }

  req.body.images = images;
  const product = await Product.create(req.body);

  res.status(201).json({ success: true, product });
});

// Get single product
export const getSingleProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('reviews.user', 'name');
  if (!product) return next(new ErrorHandler('Product not found', 404));

  res.status(200).json({ success: true, product });
});

// Update product
export const updateProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler('Product not found', 404));

  const BASE_URL = `${req.protocol}://${req.get('host')}`;
  let images = req.body.imagesCleared === 'false' ? product.images : [];

  if (req.files && req.files.length > 0) {
    req.files.forEach(file => {
      images.push({ image: `${BASE_URL}/uploads/product/${file.filename}` });
    });
  }

  req.body.images = images;
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, product: updated });
});

// Delete product
export const deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler('Product not found', 404));

  //await product.remove();
  await product.deleteOne();

  res.status(200).json({ success: true, message: 'Product deleted' });
});

// Create or update review
export const createReview = catchAsyncError(async (req, res, next) => {
  const { productId, rating, comment } = req.body;
  const product = await Product.findById(productId);
  if (!product) return next(new ErrorHandler('Product not found', 404));

  const existingReview = product.reviews.find(r => r.user.toString() === req.user._id.toString());

  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment;
  } else {
    product.reviews.push({ user: req.user._id, rating, comment });
    product.numOfReviews = product.reviews.length;
  }

  product.ratings = product.reviews.reduce((acc, r) => acc + parseFloat(r.rating), 0) / product.reviews.length;
  await product.save({ validateBeforeSave: false });

  res.status(200).json({ success: true });
});

// Get reviews of a product
export const getReviews = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, error: 'Invalid Product ID format' });
    }

    const product = await Product.findById(productId)
      .populate('reviews.user', 'name ProfileImg');

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (err) {
    console.error('Get Reviews Error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching reviews',
    });
  }
};


// Delete review
export const deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  if (!product) return next(new ErrorHandler('Product not found', 404));

  const reviews = product.reviews.filter(r => r._id.toString() !== req.query.id.toString());

  product.reviews = reviews;
  product.numOfReviews = reviews.length;
  product.ratings = reviews.length === 0 ? 0 :
    reviews.reduce((acc, r) => acc + parseFloat(r.rating), 0) / reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({ success: true });
});

// Admin: get all products
export const getAdminProducts = catchAsyncError(async (req, res, next) => {
  const products = await Product.find();
  res.status(200).json({ success: true, products });
});
