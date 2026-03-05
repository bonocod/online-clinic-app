// FILE: backend/src/models/AuditLog.js
const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, index: true },

    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorRole: { type: String, default: '' },

    targetType: { type: String, default: '' },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },

    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },

    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
)

auditLogSchema.index({ action: 1, createdAt: -1 })

module.exports = mongoose.model('AuditLog', auditLogSchema)