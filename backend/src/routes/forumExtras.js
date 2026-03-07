const express = require('express')
const auth = require('../middleware/auth')
const isAdmin = require('../middleware/isAdmin')
const isDoctor = require('../middleware/isDoctor')
const Group = require('../models/Group')
const Message = require('../models/Message')
const Category = require('../models/Category')
const Discussion = require('../models/Discussion')
const LiveSession = require('../models/LiveSession')
const LiveSessionQuestion = require('../models/LiveSessionQuestion')
const { logAudit } = require('../utils/audit')
const { notifyUser } = require('../utils/notify')

const router = express.Router()

const toId = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    if (value._id) return String(value._id)
    if (value.id) return String(value.id)
  }
  return String(value)
}

const slugify = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const isCircleMember = (circle, userId) => {
  const uid = toId(userId)
  if (!uid || !Array.isArray(circle?.members)) return false
  return circle.members.some((member) => toId(member) === uid)
}

const isCircleModerator = (circle, userId) => {
  const uid = toId(userId)
  if (!uid || !circle) return false
  if (toId(circle.createdBy) === uid) return true
  return Array.isArray(circle.moderators) && circle.moderators.some((mod) => toId(mod) === uid)
}

const ensureApprovedCircle = async (circleId) => {
  const circle = await Group.findOne({ _id: circleId, type: 'circle' })
  if (!circle || circle.status !== 'approved') return null
  return circle
}

const ensureCircleManager = (req, res, circle) => {
  if (req.user?.isAdmin || isCircleModerator(circle, req.user.id)) return true
  res.status(403).json({ msg: 'Circle moderator or admin access required' })
  return false
}

const publicUser = (user, anonymous = false) => {
  if (anonymous) {
    return { _id: null, name: 'Anonymous', role: 'patient', verified: false }
  }
  if (!user) return null
  return {
    _id: user._id,
    name: user.name,
    role: user.role,
    verified: !!user.verified,
  }
}

const getTimers = (app) => {
  let timers = app.get('liveSessionTimers')
  if (!timers) {
    timers = new Map()
    app.set('liveSessionTimers', timers)
  }
  return timers
}

const clearSessionTimer = (app, sessionId) => {
  const timers = getTimers(app)
  const key = toId(sessionId)
  const timer = timers.get(key)
  if (timer) {
    clearTimeout(timer)
    timers.delete(key)
  }
}

const buildLiveSessionState = async (sessionId, currentUserId = null, includeQueue = false) => {
  const session = await LiveSession.findById(sessionId)
    .populate('startedBy', 'name role verified')
    .populate('categoryId', 'name description')
    .lean()
  if (!session) return null

  const activeQuestion = session.activeQuestion
    ? await LiveSessionQuestion.findById(session.activeQuestion)
        .populate('askedBy', 'name role verified')
        .populate('answeredBy', 'name role verified')
        .lean()
    : null

  const answeredQuestions = await LiveSessionQuestion.find({
    session: session._id,
    status: 'answered',
  })
    .sort({ answeredAt: -1, queueOrder: -1 })
    .limit(50)
    .populate('askedBy', 'name role verified')
    .populate('answeredBy', 'name role verified')
    .lean()

  const queueCount = await LiveSessionQuestion.countDocuments({
    session: session._id,
    status: 'queued',
  })

  let queue = []
  if (includeQueue) {
    queue = await LiveSessionQuestion.find({ session: session._id, status: 'queued' })
      .sort({ queueOrder: 1 })
      .populate('askedBy', 'name role verified')
      .lean()
  }

  const currentUserQuestion = currentUserId
    ? await LiveSessionQuestion.findOne({
        session: session._id,
        askedBy: currentUserId,
        status: { $in: ['queued', 'active'] },
      })
        .sort({ queueOrder: 1 })
        .lean()
    : null

  let userQueuePosition = null
  if (currentUserQuestion) {
    if (currentUserQuestion.status === 'active') {
      userQueuePosition = 0
    } else {
      const queuedAhead = await LiveSessionQuestion.countDocuments({
        session: session._id,
        status: 'queued',
        queueOrder: { $lt: currentUserQuestion.queueOrder },
      })
      userQueuePosition = (activeQuestion ? 2 : 1) + queuedAhead
    }
  }

  return {
    session,
    activeQuestion: activeQuestion
      ? {
          ...activeQuestion,
          askedBy: publicUser(activeQuestion.askedBy, activeQuestion.anonymous),
        }
      : null,
    answeredQuestions: answeredQuestions.map((item) => ({
      ...item,
      askedBy: publicUser(item.askedBy, item.anonymous),
      answeredBy: publicUser(item.answeredBy, false),
    })),
    queueCount,
    queue: includeQueue
      ? queue.map((item) => ({
          ...item,
          askedBy: publicUser(item.askedBy, item.anonymous),
        }))
      : [],
    currentUserQuestion,
    userQueuePosition,
  }
}

const emitQueuePositions = async (app, sessionId) => {
  const io = app.get('io')
  if (!io) return
  const session = await LiveSession.findById(sessionId).select('activeQuestion status')
  if (!session) return

  const queued = await LiveSessionQuestion.find({ session: sessionId, status: 'queued' })
    .sort({ queueOrder: 1 })
    .select('_id askedBy queueOrder')

  if (session.activeQuestion) {
    const active = await LiveSessionQuestion.findById(session.activeQuestion).select('_id askedBy')
    if (active?.askedBy) {
      io.to(`user_${toId(active.askedBy)}`).emit('liveSession:queuePosition', {
        sessionId: toId(sessionId),
        questionId: toId(active._id),
        position: 0,
        status: 'active',
      })
    }
  }

  queued.forEach((question, index) => {
    const position = (session.activeQuestion ? 2 : 1) + index
    io.to(`user_${toId(question.askedBy)}`).emit('liveSession:queuePosition', {
      sessionId: toId(sessionId),
      questionId: toId(question._id),
      position,
      status: 'queued',
    })
  })
}

const emitLiveSessionState = async (app, sessionId) => {
  const io = app.get('io')
  if (!io) return
  const state = await buildLiveSessionState(sessionId, null, false)
  if (!state) return

  const payload = {
    sessionId: toId(sessionId),
    status: state.session.status,
    queueCount: state.queueCount,
    answeredCount: state.session.answeredCount,
    activeQuestion: state.activeQuestion,
    startedAt: state.session.startedAt,
    endedAt: state.session.endedAt,
    endReason: state.session.endReason,
  }

  io.emit('liveSession:updated', payload)
  io.to(`live_${toId(sessionId)}`).emit('liveSession:state', payload)
  await emitQueuePositions(app, sessionId)
}

const endLiveSession = async (app, session, endedBy = null, reason = 'manual') => {
  if (!session || session.status === 'ended') return session

  if (session.activeQuestion) {
    await LiveSessionQuestion.findOneAndUpdate(
      { _id: session.activeQuestion, status: 'active' },
      { $set: { status: 'skipped', skippedAt: new Date() } }
    )
  }

  session.status = 'ended'
  session.endedAt = new Date()
  session.endReason = reason
  session.endedBy = endedBy || null
  session.activeQuestion = null
  await session.save()

  clearSessionTimer(app, session._id)

  const io = app.get('io')
  if (io) {
    io.emit('liveSession:ended', {
      sessionId: toId(session._id),
      endedAt: session.endedAt,
      reason,
    })
    io.to(`live_${toId(session._id)}`).emit('liveSession:ended', {
      sessionId: toId(session._id),
      endedAt: session.endedAt,
      reason,
    })
  }

  await emitLiveSessionState(app, session._id)
  return session
}

const maybeAutoEndSession = async (app, session) => {
  if (
    session &&
    session.status === 'live' &&
    session.scheduledEndAt &&
    new Date(session.scheduledEndAt).getTime() <= Date.now()
  ) {
    return endLiveSession(app, session, null, 'time_limit')
  }
  return session
}

const scheduleSessionEnd = (app, sessionId, scheduledEndAt) => {
  clearSessionTimer(app, sessionId)
  if (!scheduledEndAt) return

  const delay = new Date(scheduledEndAt).getTime() - Date.now()
  if (delay <= 0) return

  const timers = getTimers(app)
  const key = toId(sessionId)
  const timer = setTimeout(async () => {
    try {
      const live = await LiveSession.findById(sessionId)
      if (live && live.status === 'live') {
        await endLiveSession(app, live, null, 'time_limit')
      }
    } catch (e) {
      // swallow timer errors
    }
  }, delay)

  timers.set(key, timer)
}

router.post('/discussions/:id/close', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
    if (!discussion) return res.status(404).json({ msg: 'Discussion not found' })

    const isOwner = toId(discussion.createdBy) === toId(req.user.id)
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ msg: 'Only creator or admin can close' })
    }

    discussion.status = 'closed'
    discussion.closedBy = req.user.id
    discussion.closedAt = new Date()
    await discussion.save()

    await logAudit(req, {
      action: 'discussion.close',
      targetType: 'discussion',
      targetId: discussion._id,
    })

    const io = req.app.get('io')
    if (io) {
      const payload = {
        discussionId: toId(discussion._id),
        _id: toId(discussion._id),
        categoryId: toId(discussion.categoryId),
        status: 'closed',
        closedAt: discussion.closedAt,
      }
      io.to(`discussion_${toId(discussion._id)}`).emit('discussion:closed', payload)
      io.to(`discussion_${toId(discussion._id)}`).emit('discussionClosed', payload)
      if (discussion.categoryId) {
        io.to(`category_${toId(discussion.categoryId)}`).emit('discussion:closed', payload)
        io.to(`category_${toId(discussion.categoryId)}`).emit('discussionClosed', payload)
      }
    }

    res.json({ msg: 'Discussion closed', discussion })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/categories/:id/circles', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) return res.status(404).json({ msg: 'Category not found' })

    const tag = slugify(category.name)
    const circles = await Group.find({
      conditionTag: tag,
      type: 'circle',
      status: 'approved',
    })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name role verified')
      .lean()

    res.json(
      circles.map((circle) => ({
        ...circle,
        membersCount: Array.isArray(circle.members) ? circle.members.length : 0,
        isMember: isCircleMember(circle, req.user.id),
      }))
    )
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/circles', auth, async (req, res) => {
  try {
    const { status = 'approved', conditionTag = '', mine = 'false' } = req.query
    const query = { type: 'circle' }

    if (req.user.isAdmin && ['approved', 'waiting', 'rejected', 'all'].includes(status)) {
      if (status !== 'all') query.status = status
    } else {
      query.status = 'approved'
    }

    if (conditionTag.trim()) query.conditionTag = slugify(conditionTag)
    if (mine === 'true') query.$or = [{ createdBy: req.user.id }, { members: req.user.id }]

    const circles = await Group.find(query)
      .sort({ status: 1, createdAt: -1 })
      .populate('createdBy', 'name role verified')
      .populate('moderators', 'name role verified')
      .lean()

    res.json(
      circles.map((circle) => {
        const pendingJoinRequest = (circle.joinRequests || []).find(
          (request) =>
            toId(request.user) === toId(req.user.id) && request.status === 'pending'
        )

        return {
          ...circle,
          membersCount: Array.isArray(circle.members) ? circle.members.length : 0,
          isMember: isCircleMember(circle, req.user.id),
          isModerator: isCircleModerator(circle, req.user.id),
          pendingJoinRequest: pendingJoinRequest ? pendingJoinRequest._id : null,
          joinRequestsCount: Array.isArray(circle.joinRequests)
            ? circle.joinRequests.filter((request) => request.status === 'pending').length
            : 0,
        }
      })
    )
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/circles', auth, async (req, res) => {
  try {
    const { name, description = '', conditionTag = '', privacy, requestReason = '' } = req.body
    if (!name || !String(name).trim()) {
      return res.status(400).json({ msg: 'Circle name is required' })
    }

    const normalizedTag = slugify(conditionTag || name)
    const approvedDirectly = !!req.user.isAdmin

    const circle = await Group.create({
      name: String(name).trim(),
      description: String(description).trim(),
      conditionTag: normalizedTag,
      type: 'circle',
      privacy: privacy || 'private',
      approvalRequired: true,
      status: approvedDirectly ? 'approved' : 'waiting',
      createdBy: req.user.id,
      members: [req.user.id],
      moderators: [req.user.id],
      requestReason: String(requestReason || '').trim(),
      approvedBy: approvedDirectly ? req.user.id : null,
      approvedAt: approvedDirectly ? new Date() : null,
    })

    await logAudit(req, {
      action: approvedDirectly ? 'circle.create' : 'circle.create_request',
      targetType: 'circle',
      targetId: circle._id,
      metadata: { conditionTag: normalizedTag },
    })

    const io = req.app.get('io')
    if (io) {
      if (approvedDirectly) {
        io.emit('circle:created', {
          circleId: toId(circle._id),
          name: circle.name,
          conditionTag: circle.conditionTag,
        })
      } else {
        io.to('admin').emit('circle:pending', {
          circleId: toId(circle._id),
          name: circle.name,
          createdBy: toId(req.user.id),
        })
      }
    }

    res.status(201).json({
      msg: approvedDirectly
        ? 'Support circle created successfully'
        : 'Support circle request submitted for admin approval',
      circle,
    })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/circles/:id', auth, async (req, res) => {
  try {
    const circle = await Group.findOne({ _id: req.params.id, type: 'circle' })
      .populate('createdBy', 'name role verified')
      .populate('moderators', 'name role verified')
      .populate('members', 'name role verified')

    if (!circle) return res.status(404).json({ msg: 'Circle not found' })
    if (!req.user.isAdmin && circle.status !== 'approved') {
      return res.status(404).json({ msg: 'Circle not found' })
    }

    const myJoinRequest = circle.joinRequests.find(
      (request) => toId(request.user) === toId(req.user.id)
    )

    const canViewMembers =
      req.user.isAdmin || isCircleModerator(circle, req.user.id) || isCircleMember(circle, req.user.id)

    res.json({
      ...circle.toObject(),
      members: canViewMembers ? circle.members : [],
      membersCount: circle.members.length,
      isMember: isCircleMember(circle, req.user.id),
      isModerator: isCircleModerator(circle, req.user.id),
      myJoinRequest,
      pendingJoinRequests:
        req.user.isAdmin || isCircleModerator(circle, req.user.id)
          ? circle.joinRequests.filter((request) => request.status === 'pending')
          : undefined,
    })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.patch('/circles/:id/approve', auth, isAdmin, async (req, res) => {
  try {
    const circle = await Group.findOne({ _id: req.params.id, type: 'circle' })
    if (!circle) return res.status(404).json({ msg: 'Circle not found' })

    circle.status = 'approved'
    circle.approvedBy = req.user.id
    circle.approvedAt = new Date()
    circle.reviewedAt = new Date()
    circle.reviewNote = String(req.body?.note || '').trim()
    await circle.save()

    await notifyUser(req, circle.createdBy, {
      type: 'circle.approved',
      title: 'Support circle approved',
      message: 'Your support circle is now live.',
      link: `/group/${toId(circle._id)}`,
      metadata: { circleId: toId(circle._id) },
    })

    await logAudit(req, {
      action: 'circle.approve',
      targetType: 'circle',
      targetId: circle._id,
    })

    const io = req.app.get('io')
    if (io) {
      io.emit('circle:approved', { circleId: toId(circle._id) })
      io.emit('circle:created', {
        circleId: toId(circle._id),
        name: circle.name,
        conditionTag: circle.conditionTag,
      })
    }

    res.json({ msg: 'Circle approved', circle })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.patch('/circles/:id/reject', auth, isAdmin, async (req, res) => {
  try {
    const circle = await Group.findOne({ _id: req.params.id, type: 'circle' })
    if (!circle) return res.status(404).json({ msg: 'Circle not found' })

    circle.status = 'rejected'
    circle.reviewedAt = new Date()
    circle.reviewNote = String(req.body?.note || '').trim()
    await circle.save()

    await notifyUser(req, circle.createdBy, {
      type: 'circle.rejected',
      title: 'Support circle request rejected',
      message: 'Your support circle request was not approved.',
      link: '/forum',
      metadata: { circleId: toId(circle._id) },
    })

    await logAudit(req, {
      action: 'circle.reject',
      targetType: 'circle',
      targetId: circle._id,
    })

    const io = req.app.get('io')
    if (io) io.to('admin').emit('circle:rejected', { circleId: toId(circle._id) })

    res.json({ msg: 'Circle rejected', circle })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/circles/:id/join-request', auth, async (req, res) => {
  try {
    const circle = await ensureApprovedCircle(req.params.id)
    if (!circle) return res.status(404).json({ msg: 'Circle not found' })
    if (isCircleMember(circle, req.user.id)) {
      return res.status(400).json({ msg: 'You are already a member of this circle' })
    }

    const reason = String(req.body?.reason || '').trim()
    if (!reason) return res.status(400).json({ msg: 'Join reason is required' })

    const existing = circle.joinRequests.find(
      (request) =>
        toId(request.user) === toId(req.user.id) && request.status === 'pending'
    )
    if (existing) {
      return res.status(400).json({ msg: 'You already have a pending join request' })
    }

    circle.joinRequests.push({ user: req.user.id, reason, status: 'pending' })
    await circle.save()

    await logAudit(req, {
      action: 'circle.join_request',
      targetType: 'circle',
      targetId: circle._id,
    })

    const io = req.app.get('io')
    if (io) {
      io.to('admin').emit('circle:joinRequest', {
        circleId: toId(circle._id),
        userId: toId(req.user.id),
      })
      io.to(`circle_${toId(circle._id)}`).emit('circle:joinRequestCount', {
        circleId: toId(circle._id),
        pendingCount: circle.joinRequests.filter((request) => request.status === 'pending').length,
      })
    }

    res.status(201).json({ msg: 'Join request submitted', circleId: toId(circle._id) })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/circles/:id/join-requests', auth, async (req, res) => {
  try {
    const circle = await Group.findOne({ _id: req.params.id, type: 'circle' })
      .populate('joinRequests.user', 'name role verified')
      .populate('joinRequests.reviewedBy', 'name role verified')
    if (!circle || circle.status !== 'approved') {
      return res.status(404).json({ msg: 'Circle not found' })
    }
    if (!ensureCircleManager(req, res, circle)) return

    const pendingOnly = req.query.pendingOnly === 'true'
    const requests = pendingOnly
      ? circle.joinRequests.filter((request) => request.status === 'pending')
      : circle.joinRequests

    res.json(requests)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.patch('/circles/:id/join-requests/:requestId/approve', auth, async (req, res) => {
  try {
    const circle = await Group.findOne({ _id: req.params.id, type: 'circle' })
    if (!circle || circle.status !== 'approved') {
      return res.status(404).json({ msg: 'Circle not found' })
    }
    if (!ensureCircleManager(req, res, circle)) return

    const request = circle.joinRequests.id(req.params.requestId)
    if (!request) return res.status(404).json({ msg: 'Join request not found' })
    if (request.status !== 'pending') {
      return res.status(400).json({ msg: 'Join request already reviewed' })
    }

    request.status = 'approved'
    request.reviewedBy = req.user.id
    request.reviewedAt = new Date()
    request.note = String(req.body?.note || '').trim()
    if (!isCircleMember(circle, request.user)) circle.members.push(request.user)
    await circle.save()

    await notifyUser(req, request.user, {
      type: 'circle.join_approved',
      title: 'Circle join approved',
      message: `You can now participate in ${circle.name}.`,
      link: `/group/${toId(circle._id)}`,
      metadata: { circleId: toId(circle._id) },
    })

    await logAudit(req, {
      action: 'circle.join_request_approve',
      targetType: 'circle',
      targetId: circle._id,
      metadata: { requestId: toId(request._id), userId: toId(request.user) },
    })

    const io = req.app.get('io')
    if (io) {
      const memberPayload = {
        circleId: toId(circle._id),
        userId: toId(request.user),
        membersCount: circle.members.length,
      }
      io.to(`user_${toId(request.user)}`).emit('circle:joinApproved', memberPayload)
      io.to(`circle_${toId(circle._id)}`).emit('circle:memberUpdate', memberPayload)
      io.to(toId(circle._id)).emit('circle:memberUpdate', memberPayload)
    }

    res.json({ msg: 'Join request approved', circle })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.patch('/circles/:id/join-requests/:requestId/reject', auth, async (req, res) => {
  try {
    const circle = await Group.findOne({ _id: req.params.id, type: 'circle' })
    if (!circle || circle.status !== 'approved') {
      return res.status(404).json({ msg: 'Circle not found' })
    }
    if (!ensureCircleManager(req, res, circle)) return

    const request = circle.joinRequests.id(req.params.requestId)
    if (!request) return res.status(404).json({ msg: 'Join request not found' })
    if (request.status !== 'pending') {
      return res.status(400).json({ msg: 'Join request already reviewed' })
    }

    request.status = 'rejected'
    request.reviewedBy = req.user.id
    request.reviewedAt = new Date()
    request.note = String(req.body?.note || '').trim()
    await circle.save()

    await notifyUser(req, request.user, {
      type: 'circle.join_rejected',
      title: 'Circle join request rejected',
      message: `Your request to join ${circle.name} was not approved.`,
      link: '/forum',
      metadata: { circleId: toId(circle._id) },
    })

    await logAudit(req, {
      action: 'circle.join_request_reject',
      targetType: 'circle',
      targetId: circle._id,
      metadata: { requestId: toId(request._id), userId: toId(request.user) },
    })

    const io = req.app.get('io')
    if (io) {
      io.to(`user_${toId(request.user)}`).emit('circle:joinRejected', {
        circleId: toId(circle._id),
        requestId: toId(request._id),
      })
    }

    res.json({ msg: 'Join request rejected', circle })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/circles/:id/moderators', auth, async (req, res) => {
  try {
    const circle = await Group.findOne({ _id: req.params.id, type: 'circle' })
    if (!circle || circle.status !== 'approved') {
      return res.status(404).json({ msg: 'Circle not found' })
    }
    if (!ensureCircleManager(req, res, circle)) return

    const { userId } = req.body
    if (!userId) return res.status(400).json({ msg: 'userId is required' })
    if (!isCircleMember(circle, userId)) {
      return res.status(400).json({ msg: 'User must be a member before becoming a moderator' })
    }
    if (!circle.moderators.some((id) => toId(id) === toId(userId))) {
      circle.moderators.push(userId)
      await circle.save()
    }

    await logAudit(req, {
      action: 'circle.add_moderator',
      targetType: 'circle',
      targetId: circle._id,
      metadata: { userId: toId(userId) },
    })

    res.json(circle)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.delete('/circles/:id/members/:userId', auth, async (req, res) => {
  try {
    const circle = await Group.findOne({ _id: req.params.id, type: 'circle' })
    if (!circle || circle.status !== 'approved') {
      return res.status(404).json({ msg: 'Circle not found' })
    }
    if (!ensureCircleManager(req, res, circle)) return

    circle.members = circle.members.filter((memberId) => toId(memberId) !== toId(req.params.userId))
    circle.moderators = circle.moderators.filter(
      (memberId) => toId(memberId) !== toId(req.params.userId)
    )
    await circle.save()

    await notifyUser(req, req.params.userId, {
      type: 'circle.removed_member',
      title: 'Removed from support circle',
      message: `You were removed from ${circle.name}.`,
      link: '/forum',
      metadata: { circleId: toId(circle._id) },
    })

    await logAudit(req, {
      action: 'circle.remove_member',
      targetType: 'circle',
      targetId: circle._id,
      metadata: { userId: toId(req.params.userId) },
    })

    const io = req.app.get('io')
    if (io) {
      const memberPayload = {
        circleId: toId(circle._id),
        userId: toId(req.params.userId),
        membersCount: circle.members.length,
      }
      io.to(`circle_${toId(circle._id)}`).emit('circle:memberUpdate', memberPayload)
      io.to(toId(circle._id)).emit('circle:memberUpdate', memberPayload)
    }

    res.json({ msg: 'Member removed', circle })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/groups/:id/join', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
    if (!group) return res.status(404).json({ msg: 'Group not found' })

    if (group.type === 'circle') {
      if (group.status !== 'approved' && !req.user.isAdmin) {
        return res.status(404).json({ msg: 'Circle not found' })
      }
      if (isCircleMember(group, req.user.id)) {
        return res.json({ msg: 'Already a member', group })
      }
      if (group.approvalRequired && group.privacy === 'private') {
        const reason = String(req.body?.reason || '').trim()
        const existing = group.joinRequests.find(
          (request) =>
            toId(request.user) === toId(req.user.id) && request.status === 'pending'
        )
        if (!existing) {
          group.joinRequests.push({
            user: req.user.id,
            reason,
            status: 'pending',
          })
          await group.save()
          await logAudit(req, {
            action: 'circle.join_request',
            targetType: 'circle',
            targetId: group._id,
          })
        }
        return res.json({ msg: 'Request sent for approval', requiresApproval: true })
      }
    }

    if (!group.members.some((memberId) => toId(memberId) === toId(req.user.id))) {
      group.members.push(req.user.id)
      await group.save()
    }

    res.json(group)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/circles/:id/messages', auth, async (req, res) => {
  try {
    const circle = await ensureApprovedCircle(req.params.id)
    if (!circle) return res.status(404).json({ msg: 'Circle not found' })
    if (!isCircleMember(circle, req.user.id) && !req.user.isAdmin) {
      return res.status(403).json({ msg: 'Circle members only' })
    }

    const messages = await Message.find({ group: circle._id })
      .populate('author', 'name role verified')
      .sort({ createdAt: 1 })

    res.json(messages)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/circles/:id/messages', auth, async (req, res) => {
  try {
    const circle = await ensureApprovedCircle(req.params.id)
    if (!circle) return res.status(404).json({ msg: 'Circle not found' })
    if (!isCircleMember(circle, req.user.id) && !req.user.isAdmin) {
      return res.status(403).json({ msg: 'Circle members only' })
    }

    const content = String(req.body?.content || '').trim()
    if (!content) return res.status(400).json({ msg: 'Message content required' })

    const message = await Message.create({
      content,
      author: req.user.id,
      group: circle._id,
    })

    circle.lastMessageAt = new Date()
    await circle.save()

    const populated = await Message.findById(message._id).populate('author', 'name role verified')

    const io = req.app.get('io')
    if (io) {
      io.to(`circle_${toId(circle._id)}`).emit('circle:message', populated)
      io.to(toId(circle._id)).emit('message', populated)
    }

    await logAudit(req, {
      action: 'circle.message_create',
      targetType: 'circle',
      targetId: circle._id,
    })

    res.status(201).json(populated)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/groups/:id/messages', auth, async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
    if (group?.type === 'circle') {
      if (group.status !== 'approved') return res.status(404).json({ msg: 'Circle not found' })
      if (!isCircleMember(group, req.user.id) && !req.user.isAdmin) {
        return res.status(403).json({ msg: 'Circle members only' })
      }
    }

    const messages = await Message.find({ group: req.params.id })
      .populate('author', 'name role verified')
      .sort({ createdAt: 1 })
    res.json(messages)
  } catch (e) {
    next(e)
  }
})

router.post('/groups/:id/messages', auth, async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
    if (!group) return res.status(404).json({ msg: 'Group not found' })
    if (group.type === 'circle') {
      if (group.status !== 'approved') return res.status(404).json({ msg: 'Circle not found' })
      if (!isCircleMember(group, req.user.id) && !req.user.isAdmin) {
        return res.status(403).json({ msg: 'Circle members only' })
      }
    }

    const content = String(req.body?.content || '').trim()
    if (!content) return res.status(400).json({ msg: 'Message content required' })

    const message = await Message.create({
      content,
      author: req.user.id,
      group: group._id,
    })
    group.lastMessageAt = new Date()
    await group.save()

    const populated = await Message.findById(message._id).populate('author', 'name role verified')

    const io = req.app.get('io')
    if (io) {
      io.to(toId(group._id)).emit('message', populated)
      if (group.type === 'circle') io.to(`circle_${toId(group._id)}`).emit('circle:message', populated)
    }

    res.status(201).json(populated)
  } catch (e) {
    next(e)
  }
})

router.get('/live-sessions', auth, async (req, res) => {
  try {
    const { status = 'live', categoryId } = req.query
    const query = {}
    if (status === 'past') query.status = 'ended'
    else if (status === 'live') query.status = 'live'

    if (categoryId) query.categoryId = categoryId

    const sessions = await LiveSession.find(query)
      .sort({ status: 1, startedAt: -1 })
      .populate('startedBy', 'name role verified')
      .populate('categoryId', 'name description')
      .lean()

    const normalized = []
    for (const session of sessions) {
      const fresh = await maybeAutoEndSession(req.app, await LiveSession.findById(session._id))
      const liveState = fresh?.toObject ? fresh.toObject() : session
      normalized.push({
        ...liveState,
        startedBy: session.startedBy,
        categoryId: session.categoryId,
      })
    }

    res.json(normalized)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/live-sessions', auth, isDoctor, async (req, res) => {
  try {
    const { title, description = '', categoryId = null, scheduledEndAt = null } = req.body
    if (!title || !String(title).trim()) {
      return res.status(400).json({ msg: 'Session title is required' })
    }

    let finalCategoryId = null
    if (categoryId) {
      const category = await Category.findById(categoryId)
      if (!category || category.type !== 'forum') {
        return res.status(400).json({ msg: 'Invalid forum category' })
      }
      finalCategoryId = category._id
    }

    const session = await LiveSession.create({
      title: String(title).trim(),
      description: String(description).trim(),
      categoryId: finalCategoryId,
      startedBy: req.user.id,
      status: 'live',
      scheduledEndAt: scheduledEndAt ? new Date(scheduledEndAt) : null,
    })

    if (session.scheduledEndAt) {
      scheduleSessionEnd(req.app, session._id, session.scheduledEndAt)
    }

    await logAudit(req, {
      action: 'live_session.start',
      targetType: 'live_session',
      targetId: session._id,
      metadata: { categoryId: finalCategoryId ? toId(finalCategoryId) : null },
    })

    const populated = await LiveSession.findById(session._id)
      .populate('startedBy', 'name role verified')
      .populate('categoryId', 'name description')

    const io = req.app.get('io')
    if (io) {
      io.emit('liveSession:started', populated)
      io.emit('liveSession:updated', {
        sessionId: toId(session._id),
        status: 'live',
        queueCount: 0,
        answeredCount: 0,
        activeQuestion: null,
        startedAt: session.startedAt,
        endedAt: null,
      })
    }

    res.status(201).json(populated)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/live-sessions/:id', auth, async (req, res) => {
  try {
    let session = await LiveSession.findById(req.params.id)
    if (!session) return res.status(404).json({ msg: 'Session not found' })

    session = await maybeAutoEndSession(req.app, session)
    const includeQueue =
      req.user.isAdmin ||
      (req.user.role === 'doctor' && toId(session.startedBy) === toId(req.user.id))

    const state = await buildLiveSessionState(session._id, req.user.id, includeQueue)
    if (!state) return res.status(404).json({ msg: 'Session not found' })

    res.json(state)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/live-sessions/:id/questions', auth, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ msg: 'Only normal users can join the live question queue' })
    }

    const body = String(req.body?.body || '').trim()
    if (!body) return res.status(400).json({ msg: 'Question body is required' })

    const anonymous = !!req.body?.anonymous
    let session = await LiveSession.findById(req.params.id)
    if (!session) return res.status(404).json({ msg: 'Session not found' })

    session = await maybeAutoEndSession(req.app, session)
    if (session.status !== 'live') {
      return res.status(400).json({ msg: 'This live session has already ended' })
    }

    const existingPending = await LiveSessionQuestion.findOne({
      session: session._id,
      askedBy: req.user.id,
      status: { $in: ['queued', 'active'] },
    })
    if (existingPending) {
      return res.status(400).json({ msg: 'You already have a question in this session' })
    }

    const lastQuestion = await LiveSessionQuestion.findOne({ session: session._id })
      .sort({ queueOrder: -1 })
      .select('queueOrder')
    const queueOrder = (lastQuestion?.queueOrder || 0) + 1

    const question = await LiveSessionQuestion.create({
      session: session._id,
      askedBy: req.user.id,
      body,
      anonymous,
      status: 'queued',
      queueOrder,
    })

    session.totalQuestions += 1
    await session.save()

    await logAudit(req, {
      action: 'live_session.question_submit',
      targetType: 'live_session_question',
      targetId: question._id,
      metadata: { sessionId: toId(session._id) },
    })

    const populated = await LiveSessionQuestion.findById(question._id).populate(
      'askedBy',
      'name role verified'
    )

    const io = req.app.get('io')
    if (io) {
      io.to(`live_${toId(session._id)}`).emit('liveSession:questionQueued', {
        sessionId: toId(session._id),
        questionId: toId(question._id),
        queueCount: await LiveSessionQuestion.countDocuments({
          session: session._id,
          status: 'queued',
        }),
      })
    }

    await emitLiveSessionState(req.app, session._id)

    const state = await buildLiveSessionState(session._id, req.user.id, false)
    res.status(201).json({
      question: {
        ...populated.toObject(),
        askedBy: publicUser(populated.askedBy, anonymous),
      },
      userQueuePosition: state?.userQueuePosition ?? null,
    })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/live-sessions/:id/next', auth, isDoctor, async (req, res) => {
  try {
    let session = await LiveSession.findById(req.params.id)
    if (!session) return res.status(404).json({ msg: 'Session not found' })
    if (toId(session.startedBy) !== toId(req.user.id) && !req.user.isAdmin) {
      return res.status(403).json({ msg: 'Only the hosting doctor can control this session' })
    }

    session = await maybeAutoEndSession(req.app, session)
    if (session.status !== 'live') {
      return res.status(400).json({ msg: 'This live session has ended' })
    }
    if (session.activeQuestion) {
      return res.status(409).json({ msg: 'Answer or skip the current active question first' })
    }

    const nextQuestion = await LiveSessionQuestion.findOne({
      session: session._id,
      status: 'queued',
    }).sort({ queueOrder: 1 })
    if (!nextQuestion) {
      return res.status(404).json({ msg: 'No queued questions available' })
    }

    nextQuestion.status = 'active'
    nextQuestion.activatedAt = new Date()
    await nextQuestion.save()

    session.activeQuestion = nextQuestion._id
    await session.save()

    const populated = await LiveSessionQuestion.findById(nextQuestion._id)
      .populate('askedBy', 'name role verified')
      .lean()

    const io = req.app.get('io')
    if (io) {
      io.to(`live_${toId(session._id)}`).emit('liveSession:questionActive', {
        sessionId: toId(session._id),
        question: {
          ...populated,
          askedBy: publicUser(populated.askedBy, populated.anonymous),
        },
      })
    }

    await emitLiveSessionState(req.app, session._id)

    res.json({
      msg: 'Next question is now active',
      question: {
        ...populated,
        askedBy: publicUser(populated.askedBy, populated.anonymous),
      },
    })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/live-sessions/:id/questions/:questionId/answer', auth, isDoctor, async (req, res) => {
  try {
    const answer = String(req.body?.answer || '').trim()
    if (!answer) return res.status(400).json({ msg: 'Answer is required' })

    let session = await LiveSession.findById(req.params.id)
    if (!session) return res.status(404).json({ msg: 'Session not found' })
    if (toId(session.startedBy) !== toId(req.user.id) && !req.user.isAdmin) {
      return res.status(403).json({ msg: 'Only the hosting doctor can answer questions here' })
    }

    session = await maybeAutoEndSession(req.app, session)
    if (session.status !== 'live') {
      return res.status(400).json({ msg: 'This live session has ended' })
    }

    const question = await LiveSessionQuestion.findOne({
      _id: req.params.questionId,
      session: session._id,
      status: 'active',
    })
    if (!question) {
      return res.status(404).json({ msg: 'Active question not found' })
    }

    question.status = 'answered'
    question.answer = answer
    question.answeredBy = req.user.id
    question.answeredAt = new Date()
    await question.save()

    session.activeQuestion = null
    session.answeredCount += 1
    await session.save()

    await notifyUser(req, question.askedBy, {
      type: 'live_session.question_answered',
      title: 'Your live question was answered',
      message: 'A doctor has answered your question in the live session.',
      link: `/forum?session=${toId(session._id)}`,
      metadata: {
        sessionId: toId(session._id),
        questionId: toId(question._id),
      },
    })

    await logAudit(req, {
      action: 'live_session.question_answer',
      targetType: 'live_session_question',
      targetId: question._id,
      metadata: { sessionId: toId(session._id) },
    })

    const populated = await LiveSessionQuestion.findById(question._id)
      .populate('askedBy', 'name role verified')
      .populate('answeredBy', 'name role verified')
      .lean()

    const io = req.app.get('io')
    if (io) {
      io.to(`live_${toId(session._id)}`).emit('liveSession:questionAnswered', {
        sessionId: toId(session._id),
        question: {
          ...populated,
          askedBy: publicUser(populated.askedBy, populated.anonymous),
          answeredBy: publicUser(populated.answeredBy, false),
        },
      })
      io.to(`user_${toId(question.askedBy)}`).emit('liveSession:questionAnswered', {
        sessionId: toId(session._id),
        questionId: toId(question._id),
      })
    }

    await emitLiveSessionState(req.app, session._id)

    res.json({
      msg: 'Question answered',
      question: {
        ...populated,
        askedBy: publicUser(populated.askedBy, populated.anonymous),
        answeredBy: publicUser(populated.answeredBy, false),
      },
    })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/live-sessions/:id/questions/:questionId/skip', auth, isDoctor, async (req, res) => {
  try {
    let session = await LiveSession.findById(req.params.id)
    if (!session) return res.status(404).json({ msg: 'Session not found' })
    if (toId(session.startedBy) !== toId(req.user.id) && !req.user.isAdmin) {
      return res.status(403).json({ msg: 'Only the hosting doctor can control this session' })
    }

    session = await maybeAutoEndSession(req.app, session)
    if (session.status !== 'live') {
      return res.status(400).json({ msg: 'This live session has ended' })
    }

    const question = await LiveSessionQuestion.findOne({
      _id: req.params.questionId,
      session: session._id,
      status: 'active',
    })
    if (!question) return res.status(404).json({ msg: 'Active question not found' })

    question.status = 'skipped'
    question.skippedAt = new Date()
    await question.save()

    session.activeQuestion = null
    await session.save()

    await logAudit(req, {
      action: 'live_session.question_skip',
      targetType: 'live_session_question',
      targetId: question._id,
      metadata: { sessionId: toId(session._id) },
    })

    await emitLiveSessionState(req.app, session._id)
    res.json({ msg: 'Question skipped' })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/live-sessions/:id/end', auth, isDoctor, async (req, res) => {
  try {
    let session = await LiveSession.findById(req.params.id)
    if (!session) return res.status(404).json({ msg: 'Session not found' })
    if (toId(session.startedBy) !== toId(req.user.id) && !req.user.isAdmin) {
      return res.status(403).json({ msg: 'Only the hosting doctor can end this session' })
    }

    session = await endLiveSession(req.app, session, req.user.id, 'manual')

    await logAudit(req, {
      action: 'live_session.end',
      targetType: 'live_session',
      targetId: session._id,
    })

    res.json({ msg: 'Live session ended', session })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})
router.delete('/circles/:id', auth, isAdmin, async (req, res) => {
  try {
    const circle = await Group.findOne({ _id: req.params.id, type: 'circle' })
    if (!circle) return res.status(404).json({ msg: 'Circle not found' })

    // delete circle messages too, so you do not leave orphan chat messages behind
    await Message.deleteMany({ group: circle._id })
    await Group.deleteOne({ _id: circle._id })

    await logAudit(req, {
      action: 'circle.delete',
      targetType: 'circle',
      targetId: circle._id,
      metadata: {
        name: circle.name,
        status: circle.status,
        conditionTag: circle.conditionTag,
        privacy: circle.privacy,
      },
    })

    const io = req.app.get('io')
    if (io) {
      const payload = {
        circleId: toId(circle._id),
        name: circle.name,
      }

      io.to('admin').emit('circle:deleted', payload)
      io.emit('circle:deleted', payload)
      io.to(`circle_${toId(circle._id)}`).emit('circle:deleted', payload)
      io.to(toId(circle._id)).emit('circle:deleted', payload)
    }

    res.json({ msg: 'Circle deleted successfully' })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

module.exports = router