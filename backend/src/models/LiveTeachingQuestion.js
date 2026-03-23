const mongoose = require('mongoose')

const liveTeachingQuestionSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LiveTeachingEvent',
      required: true,
      index: true,
    },
    askedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questionText: { type: String, required: true, trim: true, maxlength: 2000 },
    anonymous: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'answered'],
      default: 'pending',
      index: true,
    },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    moderatedAt: { type: Date, default: null },
    answerText: { type: String, trim: true, maxlength: 8000, default: '' },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    answeredAt: { type: Date, default: null },
  },
  { timestamps: true }
)

liveTeachingQuestionSchema.index({ eventId: 1, status: 1, createdAt: 1 })

module.exports = mongoose.model('LiveTeachingQuestion', liveTeachingQuestionSchema)