//backend/src/models/Post.js
const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video'], required: true },
  caption: { type: String },
  captionStyle: {
    fontSize: { type: Number },
    color: { type: String },
    position: {
      x: { type: Number },
      y: { type: Number }
    }
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });
module.exports = mongoose.model('Post', postSchema);