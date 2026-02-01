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

// Get MongoDB connection string from environment variable or use default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://aaqibali198_db_user:aqib786@cluster0.a6acsah.mongodb.net/myDatabase';

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB Atlas successfully!');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
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
// 1. POST /addUser - Add a new user
// ============================================
app.post('/addUser', async (req, res) => {
  try {
    // Extract name and email from request body
    const { name, email } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required fields'
      });
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const newUser = new User({
      name,
      email
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Send success response
    res.status(201).json({
      success: true,
      message: 'User added successfully',
      data: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
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
// 3. POST /login - Authenticate user by email
// ============================================
app.post('/login', async (req, res) => {
  try {
    // Extract email from request body
    const { email } = req.body;

    // Validate email field
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for login'
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

    // Send success response with user data
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
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
