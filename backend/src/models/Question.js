// FILE: backend/src/models/Question.js
const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

    // if asked on a professional post
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },

    // cached owner of the post for fast "My Posts" filter
    postOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    askedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true, maxlength: 10000 },

    anonymous: { type: Boolean, default: false },

    status: { type: String, enum: ['unanswered', 'answered'], default: 'unanswered', index: true },

    // claim lock (recommended approach)
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    claimedAt: { type: Date, default: null },
    claimExpiresAt: { type: Date, default: null },

    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    answer: { type: String, default: '' },
    answeredAt: { type: Date, default: null },
  },
  { timestamps: true }
)

questionSchema.index({ categoryId: 1, status: 1, createdAt: -1 })
questionSchema.index({ postOwner: 1, status: 1, createdAt: -1 })

module.exports = mongoose.model('Question', questionSchema)