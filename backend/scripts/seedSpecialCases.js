// backend/seedAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User'); // adjust path if needed

// MongoDB connection string
const MONGO_URI = 'mongodb://127.0.0.1:27017/yourDatabaseName'; // replace with your DB

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      isAdmin: true,
    });

    await adminUser.save();
    console.log('Admin user created successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();