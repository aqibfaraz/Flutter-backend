const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  total_price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  delivery_address: {
    type: String,
    required: true
  },
  buyer_phone: {
    type: String,
    required: true
  },
  buyer_name: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  review: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
orderSchema.index({ buyer_id: 1, createdAt: -1 });
orderSchema.index({ seller_id: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
