// backend/scripts/seedAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  await connectDB();
  
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD; // Plain password from .env
    
    if (!adminEmail || !adminPassword) {
      console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
      process.exit(1);
    }
    
    // Check if admin exists
    let admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('ℹ️ Admin user already exists');
      process.exit(0);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Create admin
    admin = new User({
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true  // Set DB flag
    });
    
    await admin.save();
    console.log('✅ Admin user seeded successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword} (hashed in DB)`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedAdmin();