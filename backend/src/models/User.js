//# FILE: backend/src/models/User.js
// backend/src/models/User.js
const mongoose = require('mongoose');

// backend/src/models/User.js
const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  role: { type: String, enum: ['patient', 'chw', 'doctor', 'moderator', 'admin'], default: 'patient' },
  verified: { type: Boolean, default: false }, // For doctors
  reputation: { type: Number, default: 0 },
  // New profile:
  profile: {
    age: Number,
    gender: String,
    height: Number,
    weight: Number,
    medicalHistory: [String],
    // === NEW: SPECIAL CASES ===
    conditions: { type: [String], default: [] }, // "I have this"
    interestedIn: { type: [String], default: [] }, // "Just info"
    isPregnant: { type: Boolean, default: false },
    preferredLanguage: { type: String, enum: ['en', 'rw', 'fr'], default: 'en' },
    reminders: [{ disease: String, time: String // e.g., "08:00"
    }]
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);