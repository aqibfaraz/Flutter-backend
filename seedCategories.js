// Seed script to add default categories
const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

const defaultCategories = [
  { name: 'Electronics', description: 'Phones, laptops, gadgets', icon: '📱' },
  { name: 'Fashion', description: 'Clothing, shoes, accessories', icon: '👕' },
  { name: 'Home & Garden', description: 'Furniture, decor, tools', icon: '🏠' },
  { name: 'Sports', description: 'Sports equipment and gear', icon: '⚽' },
  { name: 'Books', description: 'Books and educational materials', icon: '📚' },
  { name: 'Toys & Games', description: 'Toys, games, hobbies', icon: '🎮' },
  { name: 'Vehicles', description: 'Cars, bikes, parts', icon: '🚗' },
  { name: 'Services', description: 'Professional services', icon: '🛠️' },
  { name: 'Food & Beverages', description: 'Food items and drinks', icon: '🍔' },
  { name: 'Health & Beauty', description: 'Healthcare and beauty products', icon: '💄' }
];

async function seedCategories() {
  try {
    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert default categories
    await Category.insertMany(defaultCategories);
    console.log('Default categories added successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
