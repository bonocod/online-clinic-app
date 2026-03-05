// FILE: backend/src/utils/audit.js
const AuditLog = require('../models/AuditLog')

const logAudit = async (req, { action, targetType = '', targetId = null, metadata = {} }) => {
  try {
    if (!req?.user?.id) return

    await AuditLog.create({
      action,
      actor: req.user.id,
      actorRole: req.user.role || '',
      targetType,
      targetId,
      metadata,
      ip: req.headers['x-forwarded-for']?.toString() || req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    })
  } catch (e) {
    // never block core flows on audit logging
  }
}

module.exports = { logAudit }