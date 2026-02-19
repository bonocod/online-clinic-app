const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const feedbackSchema = new mongoose.Schema({
  disease: { type: mongoose.Schema.Types.ObjectId, ref: 'Disease', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true },
  helpfulUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  helpful: { type: Number, default: 0 },
  
  replies: [replySchema]  // ← New array for replies
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);