// FILE: backend/src/models/Notification.js
const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // e.g. 'post.comment', 'discussion.comment', 'discussion.approved', 'question.answered'
    type: { type: String, required: true, index: true },

    title: { type: String, default: '' },
    message: { type: String, default: '' },

    // frontend route you will open on click (later)
    link: { type: String, default: '' },

    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },

    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
)

notificationSchema.index({ user: 1, read: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', notificationSchema)