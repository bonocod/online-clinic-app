const mongoose = require('mongoose')

const liveSessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 4000, default: '' },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    startedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['live', 'ended'],
      default: 'live',
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    endedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    endReason: {
      type: String,
      enum: ['manual', 'time_limit', 'system'],
      default: null,
    },
    scheduledEndAt: { type: Date, default: null },
    activeQuestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LiveSessionQuestion',
      default: null,
    },
    totalQuestions: { type: Number, default: 0 },
    answeredCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

liveSessionSchema.index({ status: 1, startedAt: -1 })
liveSessionSchema.index({ categoryId: 1, status: 1, startedAt: -1 })

module.exports = mongoose.model('LiveSession', liveSessionSchema)