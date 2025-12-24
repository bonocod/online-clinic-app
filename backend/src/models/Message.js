//backend/src/models/Message.js
const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
}, { timestamps: true });
module.exports = mongoose.model('Message', messageSchema);