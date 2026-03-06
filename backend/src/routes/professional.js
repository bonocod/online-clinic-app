// FILE: backend/src/routes/professional.js
const express = require('express')
const auth = require('../middleware/auth')
const isProfessional = require('../middleware/isProfessional')
const isDoctor = require('../middleware/isDoctor')
const Question = require('../models/Question')
const Post = require('../models/Post')
const Comment = require('../models/Comment')
const User = require('../models/User')
const { logAudit } = require('../utils/audit')
const { notifyUser } = require('../utils/notify')

const router = express.Router()

const CLAIM_MINUTES = 30

const isClaimActive = (q) => {
  if (!q.claimedBy || !q.claimExpiresAt) return false
  return q.claimExpiresAt.getTime() > Date.now()
}

const sanitizeAnonymousUser = () => ({
  _id: null,
  name: 'Anonymous',
  role: 'patient',
  verified: false,
})

/**
 * GET /api/professional/questions?filter=general|myposts&status=unanswered|answered
 * - general: postId null
 * - myposts: postOwner = me
 */
router.get('/questions', auth, isProfessional, async (req, res) => {
  try {
    const {
      filter = 'general',
      status = 'unanswered',
      page = 1,
      limit = 20,
    } = req.query

    const q = {}
    if (['unanswered', 'answered'].includes(status)) q.status = status

    if (filter === 'general') {
      q.postId = null
    } else if (filter === 'myposts') {
      q.postOwner = req.user.id
    }

    const items = await Question.find(q)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('askedBy', 'name role verified')
      .populate('postId', 'title author category proType highlighted')

    const mapped = items.map((it) => {
      const obj = it.toObject()
      if (obj.anonymous) obj.askedBy = sanitizeAnonymousUser()
      obj.claimActive = isClaimActive(it)
      return obj
    })

    res.json(mapped)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * POST /api/professional/questions/:id/claim
 */
router.post('/questions/:id/claim', auth, isProfessional, async (req, res) => {
  try {
    const q = await Question.findById(req.params.id)
    if (!q) return res.status(404).json({ msg: 'Question not found' })
    if (q.status !== 'unanswered')
      return res.status(400).json({ msg: 'Already answered' })

    // if claimed and active by someone else, block
    if (isClaimActive(q) && q.claimedBy.toString() !== req.user.id.toString()) {
      return res.status(409).json({ msg: 'Question is already claimed' })
    }

    q.claimedBy = req.user.id
    q.claimedAt = new Date()
    q.claimExpiresAt = new Date(Date.now() + CLAIM_MINUTES * 60 * 1000)

    await q.save()
    await logAudit(req, {
      action: 'question.claim',
      targetType: 'question',
      targetId: q._id,
    })

    res.json({ msg: 'Claimed', question: q })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * POST /api/professional/questions/:id/answer
 * body: { answer }
 * Must be claimed by requester OR unclaimed OR claim expired
 */
router.post('/questions/:id/answer', auth, isProfessional, async (req, res) => {
  try {
    const { answer } = req.body
    if (!answer || !answer.trim())
      return res.status(400).json({ msg: 'Answer required' })

    const q = await Question.findById(req.params.id)
    if (!q) return res.status(404).json({ msg: 'Question not found' })
    if (q.status !== 'unanswered')
      return res.status(400).json({ msg: 'Already answered' })

    const active = isClaimActive(q)
    if (active && q.claimedBy.toString() !== req.user.id.toString()) {
      return res
        .status(409)
        .json({ msg: 'Question is claimed by another professional' })
    }

    // if not claimed or expired, auto-claim now for safety
    if (!active) {
      q.claimedBy = req.user.id
      q.claimedAt = new Date()
      q.claimExpiresAt = new Date(Date.now() + CLAIM_MINUTES * 60 * 1000)
    }

    q.status = 'answered'
    q.answeredBy = req.user.id
    q.answer = answer.trim()
    q.answeredAt = new Date()

    await q.save()
    // notify the patient who asked
    if (q.askedBy && q.askedBy.toString() !== req.user.id.toString()) {
      const link = q.postId
        ? `/post/${q.postId.toString()}`
        : `/category/${q.categoryId.toString()}?tab=replies`
      await notifyUser(req, q.askedBy, {
        type: 'question.answered',
        title: 'Your question was answered',
        message: 'A verified professional has answered your question.',
        link,
        metadata: {
          questionId: q._id.toString(),
          postId: q.postId || null,
          categoryId: q.categoryId.toString(),
        },
      })
    }
    const io = req.app.get('io')
    if (io) {
      io.to(`category_${q.categoryId.toString()}`).emit('questionAnswered', {
        questionId: q._id.toString(),
      })
      io.to('professionals').emit('questionAnswered', {
        questionId: q._id.toString(),
      })
    }

    // reputation points (simple MVP)
    await User.findByIdAndUpdate(req.user.id, { $inc: { reputation: 5 } })

    await logAudit(req, {
      action: 'question.answer',
      targetType: 'question',
      targetId: q._id,
      metadata: { categoryId: q.categoryId, postId: q.postId || null },
    })

    const populated = await Question.findById(q._id)
      .populate('askedBy', 'name role verified')
      .populate('answeredBy', 'name role verified')
      .populate('postId', 'title author category proType highlighted')

    const obj = populated.toObject()

    if (obj.anonymous) obj.askedBy = sanitizeAnonymousUser()
      
if (io) {
  const qid = q._id.toString()
  const categoryId = q.categoryId ? q.categoryId.toString() : null
  const postId = q.postId ? q.postId.toString() : null
  const askedBy = q.askedBy ? q.askedBy.toString() : null

  // Update category Replies tab live
  if (categoryId) io.to(`category_${categoryId}`).emit('question:answered', { questionId: qid })

  // Update Post page live if it was asked on a post
  if (postId) io.to(`post_${postId}`).emit('question:answered', { questionId: qid })

  // Notify the patient who asked
  if (askedBy) io.to(`user_${askedBy}`).emit('question:answered', { questionId: qid })

  // Professionals queue refresh hint
  io.to('professionals').emit('question:answered', { questionId: qid })
}

    res.json({ msg: 'Answered', question: obj })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * GET /api/professional/posts-needing-attention
 * - Doctors: escalated or flagged keywords or urgent
 * - CHWs: flagged keywords (triage) + urgent
 */
router.get(
  '/posts-needing-attention',
  auth,
  isProfessional,
  async (req, res) => {
    try {
      const base = {
        $or: [
          { needsAttention: true },
          { flaggedByKeywords: true },
          { urgency: 'urgent' },
        ],
      }

      const posts = await Post.find(base)
        .sort({ needsAttention: -1, flaggedByKeywords: -1, createdAt: -1 })
        .limit(50)
        .populate('author', 'name role verified')
        .populate('category', 'name description isLocked')

      res.json(posts)
    } catch (e) {
      res.status(500).json({ msg: 'Server error' })
    }
  }
)

/**
 * GET /api/professional/discussion-highlights
 * returns recent professional comments on discussions
 */
router.get('/discussion-highlights', auth, isProfessional, async (req, res) => {
  try {
    const comments = await Comment.find({
      discussion: { $ne: null },
      isProfessional: true,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('author', 'name role verified')
      .populate('discussion', 'title status categoryId')

    res.json(comments)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * GET /api/professional/stats
 * basic stats: answered questions, avg response time (minutes)
 */
router.get('/stats', auth, isProfessional, async (req, res) => {
  try {
    const answered = await Question.find({
      answeredBy: req.user.id,
      status: 'answered',
    }).select('createdAt answeredAt')

    const totalAnswers = answered.length
    let avgResponseMinutes = 0

    if (totalAnswers > 0) {
      const totalMs = answered.reduce((acc, q) => {
        const a = q.answeredAt ? q.answeredAt.getTime() : q.createdAt.getTime()
        const b = q.createdAt.getTime()
        return acc + Math.max(0, a - b)
      }, 0)
      avgResponseMinutes = Math.round(totalMs / totalAnswers / 60000)
    }

    res.json({
      answeredQuestions: totalAnswers,
      avgResponseMinutes,
    })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

module.exports = router
