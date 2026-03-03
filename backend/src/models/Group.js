//# FILE: backend/src/models/Group.js
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  privacy: { type: String, enum: ['public', 'private', 'semi-private'], default: 'public' },
  conditionTag: { type: String },
  approvalRequired: { type: Boolean, default: false }, // For private circles
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  type: { type: String, enum: ['group', 'circle'], default: 'group' } // Distinguish groups and circles
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);