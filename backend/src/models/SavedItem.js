const mongoose = require('mongoose')

const savedItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    itemType: {
      type: String,
      enum: ['campaign', 'news', 'tip', 'live_event'],
      required: true,
      index: true,
    },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    reminderDateTime: { type: Date, default: null },
    notificationChannel: {
      type: String,
      enum: ['in_app', 'email', 'sms'],
      default: 'in_app',
    },
    status: {
      type: String,
      enum: ['saved', 'active', 'completed', 'cancelled'],
      default: 'saved',
      index: true,
    },
    lastNotifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

savedItemSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true })
savedItemSchema.index({ userId: 1, status: 1, reminderDateTime: 1 })

module.exports = mongoose.model('SavedItem', savedItemSchema)