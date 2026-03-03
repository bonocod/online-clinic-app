//# FILE: backend/src/models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }, // For nesting
  helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who marked helpful
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Reported by users
  isHighlighted: { type: Boolean, default: false } // For doctor highlights
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);