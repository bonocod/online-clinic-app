const mongoose = require('mongoose');

const healthLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  vitals: {
    bp: String,  // e.g., "120/80"
    temp: Number,
    sugar: Number,
    heartRate: Number
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('HealthLog', healthLogSchema);