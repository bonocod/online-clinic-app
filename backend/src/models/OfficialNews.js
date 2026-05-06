const mongoose = require('mongoose')

const officialNewsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    summary: { type: String, required: true, trim: true, maxlength: 800 },
    body: { type: String, required: true, trim: true, maxlength: 30000 },
    category: { type: String, trim: true, maxlength: 120, default: '', index: true },
    sourceName: { type: String, required: true, trim: true, maxlength: 180 },
    sourceUrl: { type: String, trim: true, maxlength: 2000, default: '' },
    publishedAt: { type: Date, default: null, index: true },
    urgencyLevel: {
      type: String,
      enum: ['low', 'normal', 'high', 'critical'],
      default: 'normal',
      index: true,
    },
    coverImage: { type: String, trim: true, maxlength: 2000, default: '' },
    isOfficial: { type: Boolean, default: true, index: true },
    isPublished: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    archivedAt: { type: Date, default: null },
    institutionName: { type: String, trim: true, maxlength: 200, default: '' },
    institutionBadge: { type: String, trim: true, maxlength: 2000, default: '' },
    relatedCampaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }],
    relatedTips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HealthTip' }],
    relatedLiveEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LiveTeachingEvent' }],
  },
  { timestamps: true }
)

officialNewsSchema.index({ isPublished: 1, status: 1, publishedAt: -1 })
officialNewsSchema.index({ category: 1, urgencyLevel: 1 })
officialNewsSchema.index({ institutionName: 1 })

module.exports = mongoose.model('OfficialNews', officialNewsSchema)
