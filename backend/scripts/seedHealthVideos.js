// backend/scripts/seedHealthVideos.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const Category = require('../src/models/Category');
const Video = require('../src/models/Video');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

const categoriesToSeed = [
  { name: 'Nutrition', description: 'Videos about healthy eating and diet' },
  { name: 'Physical Exercises', description: 'Workout and fitness routines' },
  { name: 'Hygiene', description: 'Personal and environmental hygiene tips' },
  { name: 'Diseases', description: 'Information on common diseases and prevention' },
  { name: 'Mental Health', description: 'Mental wellness and stress management' },
  { name: 'Pregnancy Care', description: 'Prenatal and postnatal care videos' },
  { name: 'First Aid', description: 'Basic first aid techniques' },
  { name: 'Vaccination', description: 'Importance of vaccines and schedules' },
  { name: 'Sleep Hygiene', description: 'Tips for better sleep' },
  { name: 'Stress Management', description: 'Techniques to manage stress' }
];

const sampleVideoPath = path.join(__dirname, 'sample.mp4'); // Assume you have a sample.mp4 in scripts folder

async function uploadVideoToCloudinary() {
  try {
    const result = await cloudinary.uploader.upload(sampleVideoPath, {
      resource_type: 'video'
    });
    return result.secure_url;
  } catch (err) {
    console.error('❌ Video upload failed:', err);
    process.exit(1);
  }
}

const seedVideos = async () => {
  await connectDB();
  
  try {
    await Category.deleteMany({});
    await Video.deleteMany({});
    
    const videoUrl = await uploadVideoToCloudinary(); // Upload once
    
    for (const catData of categoriesToSeed) {
      const category = await Category.create(catData);
      console.log(`🌱 Created category: ${category.name}`);
      
      for (let i = 1; i <= 6; i++) {
        await Video.create({
          title: `${category.name} Video ${i}`,
          description: `Sample video ${i} for ${category.name}`,
          videoUrl,
          category: category._id
        });
        console.log(`🎥 Seeded video ${i} for ${category.name}`);
      }
    }
    
    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedVideos();