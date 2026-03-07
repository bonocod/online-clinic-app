const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  reason: { type: String, trim: true, maxlength: 2000 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  notes: { type: String, trim: true }
}, { timestamps: true });

joinRequestSchema.index({ user: 1, group: 1 }, { unique: true });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);