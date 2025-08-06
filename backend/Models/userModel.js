import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  ProfileImg: {
    type: String,
    required: false,
  },
  role :{
    type: String,
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const User = mongoose.model('user', UserSchema);
export default User;
