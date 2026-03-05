// FILE: backend/src/models/Comment.js
const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, trim: true, maxlength: 10000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Either post OR discussion (at least one)
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion', default: null },

    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },

    anonymous: { type: Boolean, default: false },

    helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    isHighlighted: { type: Boolean, default: false },

    // professional opinion highlight
    isProfessional: { type: Boolean, default: false },

    isRecommended: { type: Boolean, default: false },
    isMisinfo: { type: Boolean, default: false },
  },
  { timestamps: true }
)

commentSchema.pre('validate', function (next) {
  if (!this.post && !this.discussion) {
    return next(new Error('Comment must belong to a post or a discussion'))
  }
  next()
})

module.exports = mongoose.model('Comment', commentSchema)