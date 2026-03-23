const mongoose = require('mongoose')

const liveTeachingEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, required: true, trim: true, maxlength: 12000 },
    hostName: { type: String, required: true, trim: true, maxlength: 160 },
    hostRole: { type: String, required: true, trim: true, maxlength: 100 },
    organization: { type: String, required: true, trim: true, maxlength: 180 },
    scheduledAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'live', 'past', 'cancelled'],
      default: 'draft',
      index: true,
    },
    streamUrl: { type: String, trim: true, maxlength: 2000, default: '' },
    replayUrl: { type: String, trim: true, maxlength: 2000, default: '' },
    moderationEnabled: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false, index: true },
    relatedCampaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }],
    relatedNews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OfficialNews' }],
    relatedTips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HealthTip' }],
  },
  { timestamps: true }
)

liveTeachingEventSchema.index({ isPublished: 1, status: 1, scheduledAt: 1 })
liveTeachingEventSchema.index({ organization: 1, hostRole: 1 })

module.exports = mongoose.model('LiveTeachingEvent', liveTeachingEventSchema)