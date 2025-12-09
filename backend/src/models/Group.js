const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  privacy: { type: String, enum: ['public', 'private'], default: 'public' },
  conditionTag: { type: String } // e.g., 'diabetes'
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);