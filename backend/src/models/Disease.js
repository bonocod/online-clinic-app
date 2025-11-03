const mongoose = require('mongoose')

const diseaseSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    rw: { type: String },
    fr: { type: String }
  },
  symptoms: [String], // Universal
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
  }
}, { timestamps: true })

module.exports = mongoose.model('Disease', diseaseSchema)