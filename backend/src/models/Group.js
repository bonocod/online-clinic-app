const mongoose = require('mongoose')

const joinRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, trim: true, maxlength: 1000, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    note: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: true }
)

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 4000, default: '' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    privacy: {
      type: String,
      enum: ['public', 'private', 'semi-private'],
      default: 'public',
    },
    conditionTag: { type: String, trim: true, default: '' },
    approvalRequired: { type: Boolean, default: false },
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    type: {
      type: String,
      enum: ['group', 'circle'],
      default: 'group',
      index: true,
    },
    status: {
      type: String,
      enum: ['approved', 'waiting', 'rejected'],
      default: 'approved',
      index: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, trim: true, maxlength: 1000, default: '' },
    requestReason: { type: String, trim: true, maxlength: 1000, default: '' },
    joinRequests: { type: [joinRequestSchema], default: [] },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true }
)

groupSchema.index({ type: 1, status: 1, createdAt: -1 })
groupSchema.index({ type: 1, conditionTag: 1 })
groupSchema.index({ members: 1, type: 1 })
groupSchema.index({ 'joinRequests.user': 1, type: 1 })

module.exports = mongoose.model('Group', groupSchema)