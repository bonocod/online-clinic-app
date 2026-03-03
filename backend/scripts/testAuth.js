// backend/scripts/seedForumCategories.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../src/models/Category');

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

const forumCategories = [
  { name: 'Mental Health', description: 'Discuss mental health topics.', type: 'forum' },
  { name: 'Pregnancy', description: 'Support for pregnancy journeys.', type: 'forum' },
  { name: 'Chronic Diseases', description: 'Managing chronic conditions.', type: 'forum' },
  { name: 'Infectious Diseases', description: 'Prevention and treatment of infections.', type: 'forum' },
  { name: 'Child Health', description: 'Child health and development.', type: 'forum' },
  { name: 'Nutrition', description: 'Healthy eating and nutrition tips.', type: 'forum' }
];

const seedForumCategories = async () => {
  await connectDB();

  try {
    // 🔥 Delete only forum categories
    const deleted = await Category.deleteMany({ type: 'forum' });
    console.log(`🗑 Deleted ${deleted.deletedCount} existing forum categories`);

    // 🔥 Insert fresh forum categories
    await Category.insertMany(forumCategories);
    console.log('🌱 Forum categories seeded successfully!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedForumCategories();