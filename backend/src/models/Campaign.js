const mongoose = require('mongoose')

const campaignMaterialSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: 160, default: '' },
    url: { type: String, trim: true, maxlength: 2000, default: '' },
    type: {
      type: String,
      enum: ['image', 'pdf', 'audio', 'video', 'link', 'other'],
      default: 'link',
    },
  },
  { _id: false }
)

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    summary: { type: String, required: true, trim: true, maxlength: 600 },
    description: { type: String, required: true, trim: true, maxlength: 20000 },
    category: { type: String, trim: true, maxlength: 120, default: '', index: true },
    targetAudience: { type: [String], default: [] },
    organization: { type: String, required: true, trim: true, maxlength: 180 },
    districtScope: { type: [String], default: [] },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    coverImage: { type: String, trim: true, maxlength: 2000, default: '' },
    locationText: { type: String, trim: true, maxlength: 300, default: '' },
    instructions: { type: String, trim: true, maxlength: 5000, default: '' },
    materials: { type: [campaignMaterialSchema], default: [] },
    isFeatured: { type: Boolean, default: false, index: true },
    isUrgent: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'active', 'ended', 'archived'],
      default: 'draft',
      index: true,
    },
    archivedAt: { type: Date, default: null },
    relatedNews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OfficialNews' }],
    relatedTips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HealthTip' }],
    relatedLiveEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LiveTeachingEvent' }],
  },
  { timestamps: true }
)

campaignSchema.index({ isPublished: 1, status: 1, startDate: 1 })
campaignSchema.index({ category: 1, isFeatured: 1, isUrgent: 1 })

module.exports = mongoose.model('Campaign', campaignSchema)