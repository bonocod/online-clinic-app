// FILE: backend/src/utils/audit.js
const AuditLog = require('../models/AuditLog')

const logAudit = async (req, { action, targetType = '', targetId = null, metadata = {} }) => {
  try {
    if (!req?.user?.id) return

    const created = await AuditLog.create({
      action,
      actor: req.user.id,
      actorRole: req.user.role || '',
      targetType,
      targetId,
      metadata,
      ip: req.headers['x-forwarded-for']?.toString() || req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    })

    // 🔥 LIVE: notify admins
    const io = req?.app?.get?.('io')
    if (io) {
      // Populate actor for nicer UI
      const populated = await AuditLog.findById(created._id)
        .populate('actor', 'name role verified email')
        .lean()

      io.to('admin').emit('audit:new', populated)
    }
  } catch (e) {
    // never block core flows on audit logging
  }
}

module.exports = { logAudit }