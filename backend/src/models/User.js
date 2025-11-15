const mongoose = require('mongoose');

// backend/src/models/User.js
const userSchema = new mongoose.Schema({
  name: { type: String },

  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  profile: {
    age: Number,
    gender: String,
    height: Number,
    weight: Number,
    medicalHistory: [String],

    // === NEW: SPECIAL CASES ===
    conditions: { type: [String], default: [] },        // "I have this"
    interestedIn: { type: [String], default: [] },     // "Just info"
    isPregnant: { type: Boolean, default: false },
    preferredLanguage: { type: String, enum: ['en', 'rw', 'fr'], default: 'en' }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);