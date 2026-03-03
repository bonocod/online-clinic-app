//# FILE: backend/scripts/seedGroups.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Group = require('../src/models/Group');
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

const groups = [
  // Public groups based on categories
  { name: 'Mental Health', description: 'Discuss mental health topics.', members: [], privacy: 'public', conditionTag: 'mental-health' },
  { name: 'Pregnancy', description: 'Support for pregnancy journeys.', members: [], privacy: 'public', conditionTag: 'pregnancy' },
  { name: 'Chronic Diseases', description: 'Managing chronic conditions.', members: [], privacy: 'public', conditionTag: 'chronic-diseases' },
  { name: 'Infectious Diseases', description: 'Prevention and treatment of infections.', members: [], privacy: 'public', conditionTag: 'infectious-diseases' },
  { name: 'Child Health', description: 'Child health and development.', members: [], privacy: 'public', conditionTag: 'child-health' },
  { name: 'Nutrition', description: 'Healthy eating and nutrition tips.', members: [], privacy: 'public', conditionTag: 'nutrition' },
  // Example support circles (private)
  { name: 'Diabetes Support Circle', description: 'Private support for diabetes patients.', members: [], privacy: 'private', conditionTag: 'diabetes', approvalRequired: true },
  { name: 'Mental Health Support Circle', description: 'Private mental health support.', members: [], privacy: 'private', conditionTag: 'mental-health', approvalRequired: true }
];

const seedGroups = async () => {
  await connectDB();
  try {
    await Group.deleteMany({});
    await Group.insertMany(groups);
    console.log(`🌱 Seeded ${groups.length} groups successfully!`);
    process.exit();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedGroups();