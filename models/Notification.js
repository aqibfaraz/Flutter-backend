const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['order', 'message', 'follower', 'product', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  related_id: {
    type: mongoose.Schema.Types.ObjectId // Can reference Order, Product, User, etc.
  },
  is_read: {
    type: Boolean,
    default: false
  },
  image: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ user_id: 1, is_read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
