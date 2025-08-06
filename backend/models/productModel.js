import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
    trim: true,
    maxLength: [100, "Product name cannot exceed 100 characters"]
  },
  price: {
    type: Number,
    required: true,
    default: 0.0
  },
  description: {
    type: String,
    required: [true, "Please enter product description"]
  },
  ratings: {
    type: String,
    default: 0
  },
  images: [
    {
      image: {
        type: String,
        required: true
      }
    }
  ],
  category: {
    type: String,
    required: [true, "Please enter product category"],
    enum: {
      values: [
        'Jellies',
        'Custards',
        'Food essences',
        'Cake ingredients',
        'Artificial colors and flavors'
      ],
      message: "Please select correct category"
    }
  },
  seller: {
    type: String,
    required: [true, "Please enter product seller"]
  },
  stock: {
    type: Number,
    required: [true, "Please enter product stock"],
    maxLength: [20, 'Product stock cannot exceed 20']
  },
  quantity: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['ml', 'g', 'kg', 'l', 'pcs'],
      required: true
    }
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },
      rating: {
        type: String,
        required: true
      },
      comment: {
        type: String,
        required: true
      }
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// FIX: Check if the model already exists before compiling it
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
