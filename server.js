// ============================================
// Import Required Packages
// ============================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import User Model
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Notification = require('./models/Notification');
const Category = require('./models/Category');

// ============================================
// Initialize Express App
// ============================================
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware Configuration
// ============================================

// Enable CORS for all origins (Flutter app can access this backend)
app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json());

// Parse URL-encoded request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// ============================================
// MongoDB Connection
// ============================================

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
  console.log('❌ MongoDB Connection Error:', err);
  process.exit(1); // Exit if database connection fails
});

// ============================================
// API Routes
// ============================================

// Test Route - Check if server is running
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Project 786 Backend API',
    version: '1.0.0',
    endpoints: {
      addUser: 'POST /addUser',
      getUsers: 'GET /users',
      login: 'POST /login',
      updateUser: 'PUT /updateUser/:id',
      deleteUser: 'DELETE /deleteUser/:id'
    }
  });
});

// ============================================
// 1. POST /addUser - Add a new user (Buyer/Seller Signup)
// ============================================
app.post('/addUser', async (req, res) => {
  try {
    // Extract fields from request body
    const { 
      role, email, password,
      bname, blocation, bborn, bgender, bcountry, bphone,
      sname, slocation, sdescription,
      imagePath
    } = req.body;

    // Validate required fields
    if (!role || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Role, email and password are required fields'
      });
    }

    // Validate role
    if (role !== 'Buyer' && role !== 'Seller') {
      return res.status(400).json({
        success: false,
        message: 'Role must be either Buyer or Seller'
      });
    }

    // Validate Buyer fields
    if (role === 'Buyer') {
      if (!bname || !blocation || !bphone) {
        return res.status(400).json({
          success: false,
          message: 'Buyer requires: name, location, and phone'
        });
      }
    }

    // Validate Seller fields
    if (role === 'Seller') {
      if (!sname || !slocation) {
        return res.status(400).json({
          success: false,
          message: 'Seller requires: store name and location'
        });
      }
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user object
    const newUser = new User({
      role,
      email,
      password, // Note: In production, hash this password!
      imagePath: imagePath || ''
    });

    // Add buyer-specific fields
    if (role === 'Buyer') {
      newUser.bname = bname;
      newUser.blocation = blocation;
      newUser.bborn = bborn || '';
      newUser.bgender = bgender || '';
      newUser.bcountry = bcountry || '';
      newUser.bphone = bphone;
    }

    // Add seller-specific fields
    if (role === 'Seller') {
      newUser.sname = sname;
      newUser.slocation = slocation;
      newUser.sdescription = sdescription || '';
    }

    // Save user to database
    const savedUser = await newUser.save();

    // Send success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user_id: savedUser._id,
      data: {
        id: savedUser._id,
        role: savedUser.role,
        email: savedUser.email,
        bname: savedUser.bname,
        sname: savedUser.sname,
        createdAt: savedUser.createdAt
      }
    });

  } catch (error) {
    console.error('Error in /addUser:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add user',
      error: error.message
    });
  }
});

// ============================================
// 2. GET /users - Get all users
// ============================================
app.get('/users', async (req, res) => {
  try {
    // Fetch all users from database, sorted by creation date (newest first)
    const users = await User.find().sort({ createdAt: -1 });

    // Send success response with user list
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      count: users.length,
      data: users
    });

  } catch (error) {
    console.error('Error in /users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
});

// ============================================
// 3. POST /login - Authenticate user by email and password
// ============================================
app.post('/login', async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Validate email field
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required for login'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Verify password (Note: In production, compare hashed passwords)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Prepare response data based on role
    const responseData = {
      id: user._id,
      role: user.role,
      email: user.email,
      createdAt: user.createdAt
    };

    // Add buyer-specific data
    if (user.role === 'Buyer') {
      responseData.bname = user.bname;
      responseData.blocation = user.blocation;
      responseData.bborn = user.bborn;
      responseData.bgender = user.bgender;
      responseData.bcountry = user.bcountry;
      responseData.bphone = user.bphone;
    }

    // Add seller-specific data
    if (user.role === 'Seller') {
      responseData.sname = user.sname;
      responseData.slocation = user.slocation;
      responseData.sdescription = user.sdescription;
    }

    // Add image path
    responseData.imagePath = user.imagePath;

    // Send success response with user data
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user_id: user._id,
      data: responseData
    });

  } catch (error) {
    console.error('Error in /login:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// ============================================
// 4. PUT /updateUser/:id - Update user information
// ============================================
app.put('/updateUser/:id', async (req, res) => {
  try {
    // Extract user ID from URL parameters
    const { id } = req.params;

    // Extract fields to update from request body
    const { name, email } = req.body;

    // Validate that at least one field is provided for update
    if (!name && !email) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (name or email) is required for update'
      });
    }

    // Prepare update object
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    updateData.updatedAt = Date.now();

    // If email is being updated, check if it's already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id } // Exclude current user from check
      });
      
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
    }

    // Find user by ID and update
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    );

    // Check if user was found
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found with the provided ID'
      });
    }

    // Send success response
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Error in /updateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// ============================================
// 5. DELETE /deleteUser/:id - Delete user by ID
// ============================================
app.delete('/deleteUser/:id', async (req, res) => {
  try {
    // Extract user ID from URL parameters
    const { id } = req.params;

    // Find and delete user by ID
    const deletedUser = await User.findByIdAndDelete(id);

    // Check if user was found and deleted
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found with the provided ID'
      });
    }

    // Send success response
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {
        id: deletedUser._id,
        name: deletedUser.name,
        email: deletedUser.email
      }
    });

  } catch (error) {
    console.error('Error in /deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// ============================================
// PRODUCT ENDPOINTS
// ============================================

// Add new product
app.post('/addProduct', async (req, res) => {
  try {
    const { seller_id, name, description, price, category, tags, images, stock, location, condition } = req.body;

    if (!seller_id || !name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: seller_id, name, description, price, category'
      });
    }

    const newProduct = new Product({
      seller_id,
      name,
      description,
      price,
      category,
      tags: tags || [],
      images: images || [],
      stock: stock || 1,
      location: location || '',
      condition: condition || 'New',
      status: 'active'
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product_id: savedProduct._id,
      product: savedProduct
    });
  } catch (error) {
    console.error('Error in /addProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product',
      error: error.message
    });
  }
});

// Get all products or filter by seller/category/status
app.get('/getProducts', async (req, res) => {
  try {
    const { seller_id, category, status, search } = req.query;
    let filter = {};

    if (seller_id) filter.seller_id = seller_id;
    if (category) filter.category = category;
    if (status) filter.status = status;
    
    // Text search if search query provided
    if (search) {
      filter.$text = { $search: search };
    }

    const products = await Product.find(filter)
      .populate('seller_id', 'sname slocation email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products: products
    });
  } catch (error) {
    console.error('Error in /getProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// Get product by ID
app.get('/getProductById/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller_id', 'sname slocation email bname blocation');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    product.views += 1;
    await product.save();

    res.json({
      success: true,
      product: product
    });
  } catch (error) {
    console.error('Error in /getProductById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// Update product
app.put('/updateProduct/:id', async (req, res) => {
  try {
    const updateData = req.body;
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error in /updateProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
});

// Delete product
app.delete('/deleteProduct/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error in /deleteProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

// Save/unsave product (toggle)
app.post('/saveProduct', async (req, res) => {
  try {
    const { product_id, user_id } = req.body;

    if (!product_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: 'product_id and user_id required'
      });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const index = product.savedBy.indexOf(user_id);
    let action;

    if (index > -1) {
      // Remove from saved
      product.savedBy.splice(index, 1);
      action = 'unsaved';
    } else {
      // Add to saved
      product.savedBy.push(user_id);
      action = 'saved';
    }

    await product.save();

    res.json({
      success: true,
      message: `Product ${action} successfully`,
      action: action
    });
  } catch (error) {
    console.error('Error in /saveProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save/unsave product',
      error: error.message
    });
  }
});

// Get saved products for a user
app.get('/getSavedProducts/:user_id', async (req, res) => {
  try {
    const products = await Product.find({ savedBy: req.params.user_id })
      .populate('seller_id', 'sname slocation')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products: products
    });
  } catch (error) {
    console.error('Error in /getSavedProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved products',
      error: error.message
    });
  }
});

// ============================================
// CATEGORY ENDPOINTS
// ============================================

// Get all categories
app.get('/getCategories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.json({
      success: true,
      count: categories.length,
      categories: categories
    });
  } catch (error) {
    console.error('Error in /getCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Add category (admin)
app.post('/addCategory', async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name required'
      });
    }

    const newCategory = new Category({ name, description, icon });
    const savedCategory = await newCategory.save();

    res.status(201).json({
      success: true,
      message: 'Category added successfully',
      category: savedCategory
    });
  } catch (error) {
    console.error('Error in /addCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add category',
      error: error.message
    });
  }
});

// ============================================
// ORDER ENDPOINTS
// ============================================

// Place new order
app.post('/addOrder', async (req, res) => {
  try {
    const { buyer_id, seller_id, product_id, quantity, total_price, delivery_address, buyer_phone, buyer_name, notes } = req.body;

    if (!buyer_id || !seller_id || !product_id || !quantity || !total_price || !delivery_address || !buyer_phone || !buyer_name) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: buyer_id, seller_id, product_id, quantity, total_price, delivery_address, buyer_phone, buyer_name'
      });
    }

    const newOrder = new Order({
      buyer_id,
      seller_id,
      product_id,
      quantity,
      total_price,
      delivery_address,
      buyer_phone,
      buyer_name,
      notes: notes || '',
      status: 'pending'
    });

    const savedOrder = await newOrder.save();

    // Create notification for seller
    await Notification.create({
      user_id: seller_id,
      type: 'order',
      title: 'New Order Received',
      message: `You have a new order for ${quantity} item(s)`,
      related_id: savedOrder._id
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order_id: savedOrder._id,
      order: savedOrder
    });
  } catch (error) {
    console.error('Error in /addOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place order',
      error: error.message
    });
  }
});

// Get buyer orders
app.get('/getBuyerOrders/:buyer_id', async (req, res) => {
  try {
    const orders = await Order.find({ buyer_id: req.params.buyer_id })
      .populate('product_id', 'name price images')
      .populate('seller_id', 'sname slocation')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    console.error('Error in /getBuyerOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch buyer orders',
      error: error.message
    });
  }
});

// Get seller orders
app.get('/getSellerOrders/:seller_id', async (req, res) => {
  try {
    const orders = await Order.find({ seller_id: req.params.seller_id })
      .populate('product_id', 'name price images')
      .populate('buyer_id', 'bname blocation')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    console.error('Error in /getSellerOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seller orders',
      error: error.message
    });
  }
});

// Get order details
app.get('/getOrderDetails/:order_id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.order_id)
      .populate('product_id')
      .populate('buyer_id', 'bname blocation bphone email')
      .populate('seller_id', 'sname slocation email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Error in /getOrderDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
});

// Update order status
app.put('/updateOrderStatus/:order_id', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status required'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.order_id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Notify buyer about status change
    await Notification.create({
      user_id: order.buyer_id,
      type: 'order',
      title: 'Order Status Updated',
      message: `Your order status changed to: ${status}`,
      related_id: order._id
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: order
    });
  } catch (error) {
    console.error('Error in /updateOrderStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// Add rating to order
app.post('/addRating', async (req, res) => {
  try {
    const { order_id, rating, review } = req.body;

    if (!order_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'order_id and rating required'
      });
    }

    const order = await Order.findByIdAndUpdate(
      order_id,
      { rating, review: review || '' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update product rating
    const product = await Product.findById(order.product_id);
    if (product) {
      const newCount = product.rating.count + 1;
      const newAverage = ((product.rating.average * product.rating.count) + rating) / newCount;
      
      product.rating.average = newAverage;
      product.rating.count = newCount;
      await product.save();
    }

    res.json({
      success: true,
      message: 'Rating added successfully',
      order: order
    });
  } catch (error) {
    console.error('Error in /addRating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add rating',
      error: error.message
    });
  }
});

// ============================================
// NOTIFICATION ENDPOINTS
// ============================================

// Get user notifications
app.get('/getNotifications/:user_id', async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.params.user_id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: notifications.length,
      unread_count: notifications.filter(n => !n.is_read).length,
      notifications: notifications
    });
  } catch (error) {
    console.error('Error in /getNotifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// Mark notification as read
app.put('/markNotificationRead/:notification_id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notification_id,
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error in /markNotificationRead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// ============================================
// STORE/SELLER PROFILE ENDPOINTS
// ============================================

// Get store data (seller products + info)
app.get('/getStoreData/:seller_id', async (req, res) => {
  try {
    const seller = await User.findById(req.params.seller_id);
    if (!seller || seller.role !== 'Seller') {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    const products = await Product.find({ seller_id: req.params.seller_id, status: 'active' })
      .sort({ createdAt: -1 });

    const totalSales = await Order.countDocuments({ seller_id: req.params.seller_id, status: 'delivered' });

    res.json({
      success: true,
      seller: {
        id: seller._id,
        name: seller.sname,
        location: seller.slocation,
        description: seller.sdescription,
        imagePath: seller.imagePath,
        email: seller.email
      },
      products: products,
      product_count: products.length,
      total_sales: totalSales
    });
  } catch (error) {
    console.error('Error in /getStoreData:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store data',
      error: error.message
    });
  }
});

// Search stores
app.get('/searchStores', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query required'
      });
    }

    const sellers = await User.find({
      role: 'Seller',
      $or: [
        { sname: { $regex: query, $options: 'i' } },
        { slocation: { $regex: query, $options: 'i' } },
        { sdescription: { $regex: query, $options: 'i' } }
      ]
    }).select('sname slocation sdescription imagePath');

    res.json({
      success: true,
      count: sellers.length,
      sellers: sellers
    });
  } catch (error) {
    console.error('Error in /searchStores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search stores',
      error: error.message
    });
  }
});

// ============================================
// Handle 404 - Route Not Found
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedUrl: req.originalUrl
  });
});

// ============================================
// Global Error Handler
// ============================================
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`📝 Test the API at: http://localhost:${PORT}/`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});
