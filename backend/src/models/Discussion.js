// FILE: backend/src/models/Discussion.js
const mongoose = require('mongoose')

const discussionSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 20000 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    anonymous: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ['waiting', 'open', 'closed'],
      default: 'waiting',
      index: true,
    },

    closeAt: { type: Date, default: null },

    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },

    closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    closedAt: { type: Date, default: null },

    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
)

discussionSchema.index({ categoryId: 1, status: 1, isPinned: -1, createdAt: -1 })

module.exports = mongoose.model('Discussion', discussionSchema)