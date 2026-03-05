// FILE: backend/src/models/Category.js
const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    type: {
      type: String,
      enum: ['video', 'forum'],
      required: true,
    },
    // Forum moderation: lock category to prevent new posts/discussions/questions
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// unique per type
categorySchema.index({ name: 1, type: 1 }, { unique: true })

module.exports = mongoose.model('Category', categorySchema)