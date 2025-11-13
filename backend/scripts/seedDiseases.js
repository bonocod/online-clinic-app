const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Disease = require('../src/models/Disease');

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

const seedDiseases = async () => {
  await connectDB();

  try {
    // Read diseases from JSON file
    const dataPath = path.join(__dirname, 'diseases.json');
    const diseases = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    await Disease.deleteMany();
    await Disease.insertMany(diseases);

    console.log(`🌱 Seeded ${diseases.length} diseases successfully!`);
    process.exit();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDiseases();