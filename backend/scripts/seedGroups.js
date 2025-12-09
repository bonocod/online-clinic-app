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
  {
    name: 'Diabetes Support',
    description: 'Share tips, experiences, and encouragement for managing diabetes.',
    members: [],
    privacy: 'public',
    conditionTag: 'diabetes'
  },
  {
    name: 'Mental Health Warriors',
    description: 'A safe space to discuss mental health, anxiety, depression, and coping strategies.',
    members: [],
    privacy: 'public',
    conditionTag: 'mental-health'
  },
  {
    name: 'Pregnancy Journey',
    description: 'Support for expecting mothers: tips, milestones, and Q&A.',
    members: [],
    privacy: 'public',
    conditionTag: 'pregnancy'
  },
  {
    name: 'HIV Support Group',
    description: 'Confidential discussions on living with HIV, treatment, and wellness.',
    members: [],
    privacy: 'public',
    conditionTag: 'hiv'
  },
  {
    name: 'Cancer Survivors',
    description: 'Stories of strength, treatment advice, and emotional support.',
    members: [],
    privacy: 'public',
    conditionTag: 'cancer'
  }
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