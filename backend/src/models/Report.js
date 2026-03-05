// FILE: backend/src/models/Report.js
const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema(
  {
    contentType: {
      type: String,
      enum: ['post', 'comment', 'discussion', 'question'],
      required: true,
      index: true,
    },
    contentId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

    reason: { type: String, required: true, trim: true, maxlength: 2000 },

    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    resolved: { type: Boolean, default: false, index: true },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null },
    resolutionNote: { type: String, default: '' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Report', reportSchema)