// FILE: backend/src/models/Post.js
const mongoose = require('mongoose')

const postSchema = new mongoose.Schema(
  {
    // Display info
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 20000 },

    attachments: [{ type: String }],

    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String }, // legacy badge

    // Legacy UI field (your frontend uses this)
    type: { type: String, enum: ['general', 'question'], default: 'general' },

    // urgency kept for backwards compatibility, but patients cannot set it anymore (enforced in route)
    urgency: { type: String, enum: ['general', 'advice', 'urgent'], default: 'general' },

    // professional-only post type: Advice / General / Lesson
    proType: { type: String, enum: ['advice', 'general', 'lesson'], default: null },

    // professional highlight (their own posts)
    highlighted: { type: Boolean, default: false },
    highlightedAt: { type: Date },
    highlightedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    anonymous: { type: Boolean, default: false },

    // likes/upvotes compatibility:
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // professional verdict: helpful
    helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    reports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],

    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },

    views: { type: Number, default: 0 },

    mediaUrl: { type: String },
    mediaType: { type: String, enum: ['image', 'video'] },

    caption: { type: String },
    captionStyle: {
      fontSize: { type: Number },
      color: { type: String },
      position: { x: { type: Number }, y: { type: Number } },
    },

    isPinned: { type: Boolean, default: false },

    isResolved: { type: Boolean, default: false }, // legacy "question post" resolution
    escalatedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // NEW: attention triage
    needsAttention: { type: Boolean, default: false },
    flaggedByKeywords: { type: Boolean, default: false },
    keywordsMatched: [{ type: String }],
  },
  { timestamps: true }
)

postSchema.pre('save', function (next) {
  // ensure likes mirrors upvotes for old frontend components
  if (!Array.isArray(this.likes) || this.likes.length === 0) {
    this.likes = Array.isArray(this.upvotes) ? this.upvotes : []
  }
  next()
})

module.exports = mongoose.model('Post', postSchema)