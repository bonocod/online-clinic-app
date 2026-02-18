const mongoose = require('mongoose');

const behaviorSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['good', 'bad'],
    required: true
  },
  title: {
    en: { type: String, required: true },
    rw: { type: String, required: true },
    fr: { type: String, required: true }
  },
  description: {
    en: { type: String, required: true },
    rw: { type: String, required: true },
    fr: { type: String, required: true }
  },
  emoji: { type: String, required: true },
  imageUrl: { type: String, required: true }   // ← New: Real image
}, { timestamps: true });

module.exports = mongoose.model('Behavior', behaviorSchema);