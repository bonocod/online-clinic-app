const mongoose = require('mongoose')

const diseaseSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    rw: { type: String, required: true },
    fr: { type: String, required: true }
  },
  symptoms: {
    en: [String],
    rw: [String],
    fr: [String]
  },
  causes: {
    en: String,
    rw: String,
    fr: String
  },
  effects: {
    en: String,
    rw: String,
    fr: String
  },
  prevention: {
    en: String,
    rw: String,
    fr: String
  },
  behaviorGuidelines: {
    en: String,
    rw: String,
    fr: String
  },
  treatment: {
    en: String,
    rw: String,
    fr: String
  },
  // === NEW FIELDS ===
  imageUrl: { type: String, required: true },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'serious'],
    required: true
  },
  relatedDiseases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disease'
  }]
}, { timestamps: true })

module.exports = mongoose.model('Disease', diseaseSchema)