const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    age: Number,
    gender: String,
    height: Number,
    weight: Number,
    medicalHistory: [String],
    isPregnant: { type: Boolean, default: false },
    preferredLanguage: { type: String, enum: ['en', 'rw', 'fr'], default: 'en' }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);