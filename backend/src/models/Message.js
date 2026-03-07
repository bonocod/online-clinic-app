const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    kind: {
      type: String,
      enum: ['user', 'system'],
      default: 'user',
    },
    systemType: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
)

messageSchema.index({ group: 1, createdAt: 1 })

module.exports = mongoose.model('Message', messageSchema)