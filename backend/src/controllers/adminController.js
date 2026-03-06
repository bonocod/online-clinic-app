// FILE: backend/src/controllers/adminController.js
const User = require('../models/User')


const Post = require('../models/Post')
const Category = require('../models/Category')
const Discussion = require('../models/Discussion')
const Report = require('../models/Report')
const bcrypt = require('bcryptjs')
const { logAudit } = require('../utils/audit')
const { notifyUser } = require('../utils/notify')
const AuditLog = require('../models/AuditLog')

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    if (!['patient', 'chw', 'doctor'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' })
    }

    let user = await User.findOne({ email })
    if (user) return res.status(400).json({ msg: 'User exists' })

    user = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
      // doctors & CHWs must be verified by admin
      verified: role === 'patient' ? true : false,
    })

    await user.save()
    await logAudit(req, { action: 'admin.create_user', targetType: 'user', targetId: user._id })

    res.status(201).json({ msg: 'User created' })
  } catch (err) {
    next(err)
  }
}

const listPendingProfessionals = async (req, res, next) => {
  try {
    const role = req.query.role
    const query = { verified: false, role: { $in: ['doctor', 'chw'] } }
    if (role && ['doctor', 'chw'].includes(role)) query.role = role
    const users = await User.find(query).select('name email role verified createdAt')
    res.json(users)
  } catch (err) {
    next(err)
  }
}

const verifyProfessional = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ msg: 'User not found' })
    if (!['doctor', 'chw'].includes(user.role)) return res.status(400).json({ msg: 'Not a professional' })

    user.verified = true
    await user.save()

    await logAudit(req, { action: 'admin.verify_professional', targetType: 'user', targetId: user._id })
    res.json({ msg: 'Professional verified' })
  } catch (err) {
    next(err)
  }
}

// existing reported-posts (kept)
const getReportedPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ 'reports.0': { $exists: true } })
      .populate('author', 'name role verified')
      .populate('reports.user', 'name')
    res.json(posts)
  } catch (err) {
    next(err)
  }
}

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    await Post.findByIdAndDelete(req.params.id)
    await logAudit(req, { action: 'admin.delete_post', targetType: 'post', targetId: req.params.id })

    res.json({ msg: 'Post deleted successfully' })
  } catch (err) {
    next(err)
  }
}

// existing: clears Post.reports
const resolveReport = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    post.reports = []
    await post.save()

    await logAudit(req, { action: 'admin.clear_post_reports', targetType: 'post', targetId: post._id })
    res.json({ msg: 'Reports cleared' })
  } catch (err) {
    next(err)
  }
}

/**
 * Discussions moderation
 */
const listDiscussions = async (req, res, next) => {
  try {
    const { status = 'waiting' } = req.query
    const q = {}
    if (['waiting', 'open', 'closed'].includes(status)) q.status = status

    const discussions = await Discussion.find(q)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name role verified')
      .populate('approvedBy', 'name role verified')

    res.json(discussions)
  } catch (err) {
    next(err)
  }
}

const approveDiscussion = async (req, res, next) => {
  try {
    const d = await Discussion.findById(req.params.id)
    if (!d) return res.status(404).json({ msg: 'Discussion not found' })

    d.status = 'open'
    d.approvedBy = req.user.id
    d.approvedAt = new Date()

    // auto-close if closeAt already passed
    if (d.closeAt && d.closeAt.getTime() <= Date.now()) {
      d.status = 'closed'
      d.closedBy = req.user.id
      d.closedAt = new Date()
    }

    await d.save()
    await notifyUser(req, d.createdBy, {
  type: 'discussion.approved',
  title: 'Discussion approved',
  message: 'Your discussion is now live in the category.',
  link: `/discussion/${d._id.toString()}`,
  metadata: { discussionId: d._id.toString(), categoryId: d.categoryId.toString() },
})
    await logAudit(req, { action: 'admin.approve_discussion', targetType: 'discussion', targetId: d._id })

    res.json({ msg: 'Discussion approved', discussion: d })
  } catch (err) {
    next(err)
  }
}

const rejectDiscussion = async (req, res, next) => {
  try {
    const d = await Discussion.findById(req.params.id)
    if (!d) return res.status(404).json({ msg: 'Discussion not found' })
      await notifyUser(req, d.createdBy, {
  type: 'discussion.rejected',
  title: 'Discussion rejected',
  message: 'Your discussion request was rejected by an admin.',
  link: `/category/${d.categoryId.toString()}?tab=discussions`,
  metadata: { discussionId: d._id.toString(), categoryId: d.categoryId.toString() },
})

    await Discussion.findByIdAndDelete(d._id)
    await logAudit(req, { action: 'admin.reject_discussion', targetType: 'discussion', targetId: d._id })

    res.json({ msg: 'Discussion rejected and removed' })
  } catch (err) {
    next(err)
  }
}

const pinDiscussion = async (req, res, next) => {
  try {
    const d = await Discussion.findByIdAndUpdate(req.params.id, { isPinned: true }, { new: true })
    if (!d) return res.status(404).json({ msg: 'Discussion not found' })

    await logAudit(req, { action: 'admin.pin_discussion', targetType: 'discussion', targetId: d._id })
    res.json(d)
  } catch (err) {
    next(err)
  }
}

const unpinDiscussion = async (req, res, next) => {
  try {
    const d = await Discussion.findByIdAndUpdate(req.params.id, { isPinned: false }, { new: true })
    if (!d) return res.status(404).json({ msg: 'Discussion not found' })

    await logAudit(req, { action: 'admin.unpin_discussion', targetType: 'discussion', targetId: d._id })
    res.json(d)
  } catch (err) {
    next(err)
  }
}

/**
 * Reports moderation queue (unified)
 */
const listReports = async (req, res, next) => {
  try {
    const { resolved = 'false' } = req.query
    const q = {}
    if (resolved === 'true') q.resolved = true
    else if (resolved === 'false') q.resolved = false

    const reports = await Report.find(q)
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name role verified')

    res.json(reports)
  } catch (err) {
    next(err)
  }
}

const resolveModerationReport = async (req, res, next) => {
  try {
    const { note = '' } = req.body
    const r = await Report.findById(req.params.id)
    if (!r) return res.status(404).json({ msg: 'Report not found' })

    r.resolved = true
    r.resolvedBy = req.user.id
    r.resolvedAt = new Date()
    r.resolutionNote = note

    await r.save()
    await logAudit(req, { action: 'admin.resolve_report', targetType: 'report', targetId: r._id })

    res.json({ msg: 'Report resolved', report: r })
  } catch (err) {
    next(err)
  }
}

/**
 * Category lock/unlock
 */
const lockCategory = async (req, res, next) => {
  try {
    const c = await Category.findByIdAndUpdate(req.params.id, { isLocked: true }, { new: true })
    if (!c) return res.status(404).json({ msg: 'Category not found' })

    await logAudit(req, { action: 'admin.lock_category', targetType: 'category', targetId: c._id })
    const io = req.app.get('io')
if (io) io.to(`category_${c._id.toString()}`).emit('categoryUpdated', c)
io.to('admin').emit('categoryUpdated', c)
    res.json(c)
  } catch (err) {
    next(err)
  }
}

const unlockCategory = async (req, res, next) => {
  try {
    const c = await Category.findByIdAndUpdate(req.params.id, { isLocked: false }, { new: true })
    if (!c) return res.status(404).json({ msg: 'Category not found' })

    await logAudit(req, { action: 'admin.unlock_category', targetType: 'category', targetId: c._id })
    const io = req.app.get('io')
if (io) io.to(`category_${c._id.toString()}`).emit('categoryUpdated', c)
io.to('admin').emit('categoryUpdated', c)
    res.json(c)
  } catch (err) {
    next(err)
  }
}


// ADD these functions anywhere in this file
const getAuditLogs = async (req, res, next) => {
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
    if (action) q.action = action
    if (actorId) q.actor = actorId
    if (actorRole) q.actorRole = actorRole
    if (targetType) q.targetType = targetType
    if (targetId) q.targetId = targetId

    if (from || to) {
      q.createdAt = {}
      if (from) q.createdAt.$gte = new Date(from)
      if (to) q.createdAt.$lte = new Date(to)
    }

    const lim = Math.min(parseInt(limit) || 30, 100)
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
  } catch (err) {
    next(err)
  }
}

const getAuditSummary = async (req, res, next) => {
  try {
    // last 24h counts by action (simple but useful)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const byAction = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 },
    ])

    const topActors = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$actor', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    res.json({ since, byAction, topActors })
  } catch (err) {
    next(err)
  }
}

// In module.exports at bottom, ADD:
module.exports = {
  // ... your existing exports
  createUser,
  listPendingProfessionals,
  verifyProfessional,
  getReportedPosts,
  deletePost,
  resolveReport,
  listDiscussions,
  approveDiscussion,
  rejectDiscussion,
  pinDiscussion,
  unpinDiscussion,
  listReports,
  resolveModerationReport,
  lockCategory,
  unlockCategory,

  // NEW:
  getAuditLogs,
  getAuditSummary,
}

