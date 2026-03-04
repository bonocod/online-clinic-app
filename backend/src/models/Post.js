// FILE: backend/src/models/Post.js
// backend/src/models/Post.js
const mongoose = require('mongoose')
const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    attachments: [{ type: String }], // URLs for files/images
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: { type: String }, // Author's role badge
    type: { type: String, enum: ['general', 'question'], default: 'general' }, // Changed to general/question
    urgency: {
      type: String,
      enum: ['general', 'advice', 'urgent'],
      default: 'general',
    },
    anonymous: { type: Boolean, default: false },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Marked helpful (by verified users)
    reports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // For circles or categories
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    views: { type: Number, default: 0 },
    mediaUrl: { type: String }, // Optional media
    mediaType: { type: String, enum: ['image', 'video'] },
    caption: { type: String },
    captionStyle: {
      fontSize: { type: Number },
      color: { type: String },
      position: { x: { type: Number }, y: { type: Number } },
    },
    isPinned: { type: Boolean, default: false }, // For pinned posts
    isResolved: { type: Boolean, default: false }, // For questions
    escalatedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Escalated by CHWs
  },
  { timestamps: true }
)

module.exports = mongoose.model('Post', postSchema)
