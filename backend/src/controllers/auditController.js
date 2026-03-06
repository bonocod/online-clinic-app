// FILE: backend/src/controllers/auditController.js
const AuditLog = require('../models/AuditLog')

const listAuditLogs = async (req, res, next) => {
  try {
    const {
      action,
      actorId,
      actorRole,
      targetType,
      targetId,
      from,
      to,
      page = 1,
      limit = 30,
    } = req.query

    const q = {}

    if (action) q.action = { $regex: String(action).trim(), $options: 'i' }
    if (actorId) q.actor = actorId
    if (actorRole) q.actorRole = actorRole
    if (targetType) q.targetType = targetType
    if (targetId) q.targetId = targetId

    if (from || to) {
      q.createdAt = {}
      if (from) q.createdAt.$gte = new Date(from)
      if (to) q.createdAt.$lte = new Date(to)
    }

    const lim = Math.min(parseInt(limit) || 30, 200)
    const skip = (parseInt(page) - 1) * lim

    const items = await AuditLog.find(q)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .populate('actor', 'name email role verified')

    const total = await AuditLog.countDocuments(q)

    res.json({
      page: parseInt(page),
      limit: lim,
      total,
      hasMore: skip + items.length < total,
      items,
    })
  } catch (e) {
    next(e)
  }
}

const auditSummary = async (req, res, next) => {
  try {
    const { days = 7 } = req.query
    const d = Math.min(Math.max(parseInt(days) || 7, 1), 90)

    const since = new Date(Date.now() - d * 24 * 60 * 60 * 1000)

    const byAction = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 },
    ])

    const byRole = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$actorRole', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    res.json({ since, days: d, byAction, byRole })
  } catch (e) {
    next(e)
  }
}

module.exports = { listAuditLogs, auditSummary }