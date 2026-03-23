const mongoose = require('mongoose')

const healthTipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    shortText: { type: String, required: true, trim: true, maxlength: 600 },
    longText: { type: String, trim: true, maxlength: 12000, default: '' },
    category: { type: String, required: true, trim: true, maxlength: 120, index: true },
    language: {
      type: String,
      enum: ['en', 'rw', 'fr', 'multi'],
      default: 'en',
      index: true,
    },
    audioUrl: { type: String, trim: true, maxlength: 2000, default: '' },
    imageUrl: { type: String, trim: true, maxlength: 2000, default: '' },
    type: {
      type: String,
      enum: ['myth_fact', 'quick_tip', 'danger_sign', 'prevention', 'checklist'],
      required: true,
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    shareText: { type: String, trim: true, maxlength: 600, default: '' },
    isPublished: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    archivedAt: { type: Date, default: null },
    relatedCampaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }],
    relatedNews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OfficialNews' }],
  },
  { timestamps: true }
)

healthTipSchema.index({ category: 1, language: 1, type: 1, isFeatured: 1 })

module.exports = mongoose.model('HealthTip', healthTipSchema)