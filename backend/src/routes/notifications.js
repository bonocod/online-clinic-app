// FILE: backend/src/routes/notifications.js
const express = require('express')
const auth = require('../middleware/auth')
const Notification = require('../models/Notification')
const { logAudit } = require('../utils/audit')

const router = express.Router()

// GET /api/notifications?unread=true&page=1&limit=30
router.get('/', auth, async (req, res) => {
  try {
    const { unread, page = 1, limit = 30 } = req.query
    const q = { user: req.user.id }
    if (unread === 'true') q.read = false

    const lim = Math.min(parseInt(limit) || 30, 100)
    const skip = (parseInt(page) - 1) * lim

    const items = await Notification.find(q).sort({ createdAt: -1 }).skip(skip).limit(lim)
    const total = await Notification.countDocuments(q)

    res.json({
      page: parseInt(page),
      limit: lim,
      total,
      hasMore: skip + items.length < total,
      items,
    })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

// PATCH /api/notifications/:id/read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const n = await Notification.findOne({ _id: req.params.id, user: req.user.id })
    if (!n) return res.status(404).json({ msg: 'Notification not found' })

    if (!n.read) {
      n.read = true
      n.readAt = new Date()
      await n.save()
      await logAudit(req, { action: 'notification.read', targetType: 'notification', targetId: n._id })
    }

    res.json(n)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

// POST /api/notifications/read-all
router.post('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true, readAt: new Date() } }
    )
    await logAudit(req, { action: 'notification.read_all', targetType: 'notification', targetId: null })
    res.json({ msg: 'All notifications marked as read' })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

module.exports = router