const mongoose = require('mongoose')

const liveSessionQuestionSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LiveSession',
      required: true,
      index: true,
    },
    askedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    anonymous: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['queued', 'active', 'answered', 'skipped'],
      default: 'queued',
      index: true,
    },
    queueOrder: { type: Number, required: true },
    answer: { type: String, trim: true, maxlength: 10000, default: '' },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    answeredAt: { type: Date, default: null },
    activatedAt: { type: Date, default: null },
    skippedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

liveSessionQuestionSchema.index({ session: 1, status: 1, queueOrder: 1 })
liveSessionQuestionSchema.index({ session: 1, askedBy: 1, createdAt: -1 })

module.exports = mongoose.model('LiveSessionQuestion', liveSessionQuestionSchema)