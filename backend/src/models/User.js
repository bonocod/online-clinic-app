// FILE: backend/src/models/User.js
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    isAdmin: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ['patient', 'chw', 'doctor', 'admin'],
      default: 'patient',
    },

    // professionals must be verified by admin
    verified: { type: Boolean, default: false },

    reputation: { type: Number, default: 0 },

    // follow categories (forum)
    followedCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],

    profile: {
      age: Number,
      gender: String,
      height: Number,
      weight: Number,
      medicalHistory: [String],
      conditions: { type: [String], default: [] },
      interestedIn: { type: [String], default: [] },
      isPregnant: { type: Boolean, default: false },
      preferredLanguage: { type: String, enum: ['en', 'rw', 'fr'], default: 'en' },
      reminders: [
        {
          disease: String,
          time: String,
        },
      ],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)