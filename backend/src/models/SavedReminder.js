const mongoose = require('mongoose')

const savedReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemType: { type: String, enum: ['campaign', 'news', 'tip', 'event'], required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reminderDateTime: Date,
  notificationChannel: { type: String, enum: ['app', 'email', 'sms'], default: 'app' },
  status: { type: String, enum: ['active', 'sent', 'cancelled'], default: 'active' }
}, { timestamps: true })

savedReminderSchema.index({ userId: 1, itemType: 1, itemId: 1 })

module.exports = mongoose.model('SavedReminder', savedReminderSchema)