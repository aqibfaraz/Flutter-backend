// Import Mongoose library for MongoDB operations
const mongoose = require('mongoose');

// Define the User Schema with all required fields for Buyer and Seller
const userSchema = new mongoose.Schema({
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['Buyer', 'Seller'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  
  // Buyer-specific fields
  bname: {
    type: String,
    trim: true
  },
  blocation: {
    type: String,
    trim: true
  },
  bborn: {
    type: String,
    trim: true
  },
  bgender: {
    type: String,
    trim: true
  },
  bcountry: {
    type: String,
    trim: true
  },
  bphone: {
    type: String,
    trim: true
  },
  
  // Seller-specific fields
  sname: {
    type: String,
    trim: true
  },
  slocation: {
    type: String,
    trim: true
  },
  sdescription: {
    type: String,
    trim: true
  },
  
  // Profile image path
  imagePath: {
    type: String,
    default: ''
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update the 'updatedAt' field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
