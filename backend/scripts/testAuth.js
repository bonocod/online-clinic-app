const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('../src/models/Post');
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



const seedGroups = async () => {
  await connectDB();
  try {
    const posts = await Post.find();

    console.log(posts)
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedGroups();