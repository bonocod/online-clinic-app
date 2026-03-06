// FILE: backend/src/routes/forum.js
const express = require('express')
const authMiddleware = require('../middleware/auth')
const isAdmin = require('../middleware/isAdmin')
const isDoctor = require('../middleware/isDoctor')
const isCHW = require('../middleware/isCHW')
const isProfessional = require('../middleware/isProfessional')

const Post = require('../models/Post')
const Comment = require('../models/Comment')
const Group = require('../models/Group')
const Message = require('../models/Message')
const Category = require('../models/Category')
const User = require('../models/User')

const Discussion = require('../models/Discussion')
const Question = require('../models/Question')
const Report = require('../models/Report')

const { logAudit } = require('../utils/audit')

const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = express.Router()

/* ---------------- Helpers ---------------- */

const sanitizeAnonymousUser = () => ({
  _id: null,
  name: 'Anonymous',
  role: 'patient',
  verified: false,
})

const toId = (v) => (v ? v.toString() : '')

const pageParams = (page, limit, maxLimit = 50) => {
  const p = Math.max(parseInt(page, 10) || 1, 1)
  const l = Math.min(Math.max(parseInt(limit, 10) || 10, 1), maxLimit)
  const skip = (p - 1) * l
  return { p, l, skip }
}

const ensureForumCategoryWritable = async (categoryId, req, res) => {
  const c = await Category.findById(categoryId)
  if (!c) {
    res.status(404).json({ msg: 'Category not found' })
    return null
  }
  if (c.type !== 'forum') {
    res.status(400).json({ msg: 'Not a forum category' })
    return null
  }
  // allow admin to write even if locked
  if (c.isLocked && !req.user?.isAdmin) {
    res.status(403).json({ msg: 'Category is locked' })
    return null
  }
  return c
}

const maybeAutoCloseDiscussion = async (d) => {
  if (!d) return d
  if (d.status === 'open' && d.closeAt && d.closeAt.getTime() <= Date.now()) {
    d.status = 'closed'
    d.closedAt = new Date()
    await d.save()
  }
  return d
}

// Minimal keyword triage (MVP)
const detectUrgentKeywords = (text) => {
  const t = (text || '').toLowerCase()
  const keywords = [
    'chest pain',
    'difficulty breathing',
    'cannot breathe',
    'fainting',
    'severe bleeding',
    'unconscious',
    'stroke',
    'heart attack',
    'overdose',
    'poison',
    'seizure',
    'pregnant bleeding',
    'baby not moving',
    'high fever',
  ]
  return keywords.filter((k) => t.includes(k))
}

/* ---------------- Socket emit helpers ---------------- */

const emitPostEvent = (io, post, event, payload) => {
  if (!io || !post?._id) return
  const postId = toId(post._id)

  // Optional future room
  io.to(`post_${postId}`).emit(event, payload)

  // Group feed room (Group.jsx uses joinGroup(groupId))
  if (post.group) io.to(toId(post.group)).emit(event, payload)

  // Category room (future Category live)
  if (post.category) io.to(`category_${toId(post.category)}`).emit(event, payload)
}

const emitDiscussionEvent = (io, discussion, event, payload) => {
  if (!io || !discussion?._id) return
  const did = toId(discussion._id)

  io.to(`discussion_${did}`).emit(event, payload)
  if (discussion.categoryId) io.to(`category_${toId(discussion.categoryId)}`).emit(event, payload)
}

/* ---------------- Multer config ---------------- */

const uploadDir = path.join(process.cwd(), 'uploads/posts')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `post-${uniqueSuffix}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm',
  ]
  if (allowedTypes.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Invalid file type. Only images and videos are allowed.'), false)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
})

/* ---------------- Categories ---------------- */

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ type: 'forum' }).sort({ name: 1 })
    res.json(categories)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) return res.status(404).json({ msg: 'Category not found' })
    res.json(category)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Follow / Unfollow category ---------------- */

router.post('/categories/:id/follow', authMiddleware, async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id)
    if (!cat) return res.status(404).json({ msg: 'Category not found' })

    await User.findByIdAndUpdate(req.user.id, { $addToSet: { followedCategories: cat._id } })
    await logAudit(req, { action: 'category.follow', targetType: 'category', targetId: cat._id })

    const u = await User.findById(req.user.id).select('followedCategories')
    res.json({ followedCategories: u.followedCategories })
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/categories/:id/unfollow', authMiddleware, async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id)
    if (!cat) return res.status(404).json({ msg: 'Category not found' })

    await User.findByIdAndUpdate(req.user.id, { $pull: { followedCategories: cat._id } })
    await logAudit(req, { action: 'category.unfollow', targetType: 'category', targetId: cat._id })

    const u = await User.findById(req.user.id).select('followedCategories')
    res.json({ followedCategories: u.followedCategories })
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Category feed (optional) ---------------- */

router.get('/categories/:id/feed', authMiddleware, async (req, res) => {
  try {
    const { tab = 'posts', page = 1, limit = 10 } = req.query
    const categoryId = req.params.id
    const { l, skip } = pageParams(page, limit, 50)

    if (tab === 'posts') {
      const posts = await Post.find({ category: categoryId })
        .sort({ isPinned: -1, highlighted: -1, createdAt: -1 })
        .skip(skip)
        .limit(l)
        .populate('author', 'name role verified')
        .populate({ path: 'comments', populate: { path: 'author', select: 'name role verified' } })

      const mapped = posts.map((p) => {
        const obj = p.toObject()
        obj.likes = Array.isArray(obj.likes) && obj.likes.length ? obj.likes : obj.upvotes || []
        return obj
      })
      return res.json(mapped)
    }

    if (tab === 'discussions') {
      const open = await Discussion.find({ categoryId, status: 'open' })
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(l)
        .populate('createdBy', 'name role verified')

      await Promise.all(open.map((d) => maybeAutoCloseDiscussion(d)))

      const closed = await Discussion.find({ categoryId, status: 'closed' })
        .sort({ isPinned: -1, closedAt: -1, createdAt: -1 })
        .limit(l)
        .populate('createdBy', 'name role verified')

      return res.json({ open, closed })
    }

    if (tab === 'replies') {
      const answered = await Question.find({ categoryId, status: 'answered' })
        .sort({ answeredAt: -1 })
        .skip(skip)
        .limit(l)
        .populate('askedBy', 'name role verified')
        .populate('answeredBy', 'name role verified')
        .populate('postId', 'title author')

      const mapped = answered.map((q) => {
        const obj = q.toObject()
        if (obj.anonymous) obj.askedBy = sanitizeAnonymousUser()
        return obj
      })

      return res.json(mapped)
    }

    return res.status(400).json({ msg: 'Invalid tab' })
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Category posts (frontend uses this) ---------------- */
/**
 * GET /forum/categories/:id/posts?tab=recent|popular|questions|discussions|posts|replies&pinned=true&page=1&limit=10
 * - Category.jsx uses:
 *   - pinned=true
 *   - tab=recent OR tab=popular
 *   - tab=replies
 */
router.get('/categories/:id/posts', authMiddleware, async (req, res) => {
  try {
    const { tab = 'recent', page = 1, limit = 10, pinned } = req.query
    const { l, skip } = pageParams(page, limit, 50)

    const categoryId = req.params.id

    // Replies tab = answered questions
    if (tab === 'replies') {
      const answered = await Question.find({ categoryId, status: 'answered' })
        .sort({ answeredAt: -1 })
        .skip(skip)
        .limit(l)
        .populate('askedBy', 'name role verified')
        .populate('answeredBy', 'name role verified')
        .populate('postId', 'title author')

      const mapped = answered.map((q) => {
        const obj = q.toObject()
        if (obj.anonymous) obj.askedBy = sanitizeAnonymousUser()
        return obj
      })
      return res.json(mapped)
    }

    // Base post query
    const query = { category: categoryId }
    if (pinned === 'true') query.isPinned = true

    if (tab === 'questions') query.type = 'question'
    if (tab === 'discussions') query.type = 'general'
    // tab === 'posts' => no extra filter

    // ✅ Popular tab: correct sorting with aggregation (pagination-safe)
    if (tab === 'popular') {
      const items = await Post.aggregate([
        { $match: query },
        {
          $addFields: {
            upvotesCount: { $size: { $ifNull: ['$upvotes', []] } },
            commentsCount: { $size: { $ifNull: ['$comments', []] } },
          },
        },
        { $sort: { isPinned: -1, highlighted: -1, upvotesCount: -1, commentsCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: l },

        // author
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author',
          },
        },
        { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },

        // comments + comment authors
        {
          $lookup: {
            from: 'comments',
            let: { commentIds: '$comments' },
            pipeline: [
              { $match: { $expr: { $in: ['$_id', '$$commentIds'] } } },
              { $sort: { createdAt: 1 } },
              {
                $lookup: {
                  from: 'users',
                  localField: 'author',
                  foreignField: '_id',
                  as: 'author',
                },
              },
              { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
              {
                $project: {
                  _id: 1,
                  content: 1,
                  anonymous: 1,
                  isProfessional: 1,
                  isHighlighted: 1,
                  isRecommended: 1,
                  isMisinfo: 1,
                  createdAt: 1,
                  author: {
                    _id: '$author._id',
                    name: '$author.name',
                    role: '$author.role',
                    verified: '$author.verified',
                  },
                },
              },
            ],
            as: 'comments',
          },
        },

        // normalize likes for old UI
        {
          $addFields: {
            likes: {
              $cond: [
                { $gt: [{ $size: { $ifNull: ['$likes', []] } }, 0] },
                '$likes',
                { $ifNull: ['$upvotes', []] },
              ],
            },
          },
        },

        // shrink author fields
        {
          $addFields: {
            author: {
              _id: '$author._id',
              name: '$author.name',
              role: '$author.role',
              verified: '$author.verified',
            },
          },
        },

        { $project: { upvotesCount: 0, commentsCount: 0 } },
      ])

      return res.json(items)
    }

    // Recent/default
    const posts = await Post.find(query)
      .sort({ isPinned: -1, highlighted: -1, createdAt: -1 })
      .skip(skip)
      .limit(l)
      .populate('author', 'name role verified')
      .populate({ path: 'comments', populate: { path: 'author', select: 'name role verified' } })

    const mapped = posts.map((p) => {
      const obj = p.toObject()
      obj.likes = Array.isArray(obj.likes) && obj.likes.length ? obj.likes : obj.upvotes || []
      return obj
    })

    res.json(mapped)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/categories/:id/circles', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) return res.status(404).json({ msg: 'Category not found' })

    const tag = category.name.toLowerCase().trim().replace(/\s+/g, '-')
    const circles = await Group.find({ conditionTag: tag, type: 'circle' })
    res.json(circles)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Discussions ---------------- */

router.post('/discussions', authMiddleware, async (req, res) => {
  try {
    const { categoryId, title, body, closeAt, anonymous } = req.body
    if (!categoryId || !title?.trim() || !body?.trim()) {
      return res.status(400).json({ msg: 'categoryId, title, body required' })
    }

    const cat = await ensureForumCategoryWritable(categoryId, req, res)
    if (!cat) return

    const d = await Discussion.create({
      categoryId,
      title: title.trim(),
      body: body.trim(),
      createdBy: req.user.id,
      anonymous: !!anonymous,
      status: 'waiting',
      closeAt: closeAt ? new Date(closeAt) : null,
    })

    await logAudit(req, { action: 'discussion.create_request', targetType: 'discussion', targetId: d._id })

    // notify admins (if your admin UI joins "admin" room)
    const io = req.app.get('io')
    if (io) io.to('admin').emit('discussion:pending', { discussionId: toId(d._id), categoryId: toId(categoryId) })

    res.status(201).json({ msg: 'Discussion submitted — waiting admin approval', discussion: d })
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/categories/:id/discussions', authMiddleware, async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query
    const categoryId = req.params.id
    const { l, skip } = pageParams(page, limit, 50)

    const base = { categoryId }
    const include = status === 'all'
    const openQuery = include ? { ...base, status: 'open' } : { ...base, status }
    const closedQuery = include ? { ...base, status: 'closed' } : { ...base, status }

    const open = await Discussion.find(openQuery)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(l)
      .populate('createdBy', 'name role verified')

    await Promise.all(open.map((d) => maybeAutoCloseDiscussion(d)))

    if (status === 'open') return res.json({ open, closed: [] })

    const closed = await Discussion.find(closedQuery)
      .sort({ isPinned: -1, closedAt: -1, createdAt: -1 })
      .limit(l)
      .populate('createdBy', 'name role verified')

    res.json({ open, closed })
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/discussions/:id', authMiddleware, async (req, res) => {
  try {
    let d = await Discussion.findById(req.params.id)
      .populate('createdBy', 'name role verified')
      .populate('approvedBy', 'name role verified')
      .populate('closedBy', 'name role verified')

    if (!d) return res.status(404).json({ msg: 'Discussion not found' })
    d = await maybeAutoCloseDiscussion(d)

    const comments = await Comment.find({ discussion: d._id })
      .sort({ createdAt: 1 })
      .populate('author', 'name role verified')

    const dObj = d.toObject()
    if (dObj.anonymous) dObj.createdBy = sanitizeAnonymousUser()

    res.json({ discussion: dObj, comments })
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/discussions/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { content, anonymous } = req.body
    if (!content?.trim()) return res.status(400).json({ msg: 'Content required' })

    const d = await Discussion.findById(req.params.id)
    if (!d) return res.status(404).json({ msg: 'Discussion not found' })

    await maybeAutoCloseDiscussion(d)
    if (d.status !== 'open') return res.status(403).json({ msg: 'Discussion is closed or waiting' })

    const isProf = ['doctor', 'chw'].includes(req.user.role) && req.user.verified

    const c = await Comment.create({
      content: content.trim(),
      author: req.user.id,
      discussion: d._id,
      anonymous: !!anonymous,
      isProfessional: isProf,
    })

    await logAudit(req, { action: 'discussion.comment', targetType: 'discussion', targetId: d._id })

    const populated = await Comment.findById(c._id).populate('author', 'name role verified')

    const io = req.app.get('io')
    emitDiscussionEvent(io, d, 'discussion:newComment', {
      ...populated.toObject(),
      discussion: d._id,
    })

    res.status(201).json(populated)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/discussions/:id/close', authMiddleware, async (req, res) => {
  try {
    const d = await Discussion.findById(req.params.id)
    if (!d) return res.status(404).json({ msg: 'Discussion not found' })

    const isOwner = d.createdBy.toString() === req.user.id.toString()
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ msg: 'Only creator or admin can close' })
    }

    d.status = 'closed'
    d.closedBy = req.user.id
    d.closedAt = new Date()
    await d.save()

    await logAudit(req, { action: 'discussion.close', targetType: 'discussion', targetId: d._id })

    const io = req.app.get('io')
    emitDiscussionEvent(io, d, 'discussion:closed', { discussionId: toId(d._id) })

    res.json({ msg: 'Discussion closed', discussion: d })
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Groups / Circles ---------------- */

router.get('/groups', authMiddleware, async (req, res) => {
  try {
    const groups = await Group.find()
    res.json(groups)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/groups/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
    if (!group) return res.status(404).json({ msg: 'Group not found' })
    res.json(group)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/groups/:id/join', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
    if (!group) return res.status(404).json({ msg: 'Group not found' })

    if (group.approvalRequired && group.privacy === 'private') {
      return res.json({ msg: 'Request sent for approval' })
    }

    if (!group.members.includes(req.user.id)) {
      group.members.push(req.user.id)
      await group.save()
    }

    res.json(group)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/groups/:id/posts', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ group: req.params.id })
      .populate('author', 'name role verified')
      .populate({ path: 'comments', populate: { path: 'author', select: 'name role verified' } })
      .sort({ createdAt: -1 })

    const mapped = posts.map((p) => {
      const obj = p.toObject()
      obj.likes = Array.isArray(obj.likes) && obj.likes.length ? obj.likes : obj.upvotes || []
      return obj
    })

    res.json(mapped)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Posts: global ---------------- */

router.get('/posts', authMiddleware, async (req, res) => {
  try {
    const { type, sort, limit = 10 } = req.query
    const lim = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50)

    const query = {}
    if (type) query.type = type

    if (sort === 'upvoted') {
      const items = await Post.aggregate([
        { $match: query },
        { $addFields: { upvotesCount: { $size: { $ifNull: ['$upvotes', []] } } } },
        { $sort: { upvotesCount: -1, createdAt: -1 } },
        { $limit: lim },
        { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
        { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
      ])
      return res.json(items)
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(lim)
      .populate('author', 'name role verified')
      .populate({ path: 'comments', populate: { path: 'author', select: 'name role verified' } })

    const mapped = posts.map((p) => {
      const obj = p.toObject()
      obj.likes = Array.isArray(obj.likes) && obj.likes.length ? obj.likes : obj.upvotes || []
      return obj
    })

    res.json(mapped)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* --- trending + related must be BEFORE /posts/:id --- */

router.get('/posts/trending', async (req, res) => {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const posts = await Post.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $addFields: { activity: { $add: [{ $size: '$upvotes' }, { $size: '$comments' }] } } },
      { $sort: { activity: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
      { $unwind: '$author' },
      {
        $project: {
          title: 1,
          category: 1,
          comments: { $size: '$comments' },
          upvotes: { $size: '$upvotes' },
          author: {
            _id: '$author._id',
            name: '$author.name',
            role: '$author.role',
            verified: '$author.verified',
          },
        },
      },
    ])

    res.json(posts)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/posts/related/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    const related = await Post.aggregate([
      { $match: { category: post.category, _id: { $ne: post._id } } },
      { $addFields: { engagement: { $add: [{ $size: '$upvotes' }, { $size: '$comments' }] } } },
      { $sort: { engagement: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
      { $unwind: '$author' },
    ])

    res.json(related)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Create post ---------------- */

router.post('/posts', authMiddleware, upload.single('media'), async (req, res) => {
  try {
    if (!req.body.title || !req.body.body) {
      return res.status(400).json({ msg: 'Title and body required' })
    }

    const io = req.app.get('io')
    const { title, body, groupId, categoryId, anonymous, type, proType } = req.body

    if (categoryId) {
      const cat = await ensureForumCategoryWritable(categoryId, req, res)
      if (!cat) return
    }

    const isProf = ['doctor', 'chw'].includes(req.user.role) && req.user.verified
    const isPatient = req.user.role === 'patient'
    const urgency = isPatient ? 'general' : req.body.urgency || 'general'

    const postData = {
      title: title.trim(),
      body: body.trim(),
      author: req.user.id,
      group: groupId || null,
      category: categoryId || null,
      anonymous: anonymous === 'true' || !!anonymous,
      type: type || 'general',
      urgency,
      proType: isProf && proType ? proType : null,
    }

    const matched = detectUrgentKeywords(`${title} ${body}`)
    if (matched.length) {
      postData.flaggedByKeywords = true
      postData.keywordsMatched = matched
    }

    if (req.file) {
      postData.mediaUrl = `/uploads/posts/${req.file.filename}`
      postData.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video'
    }

    const post = await Post.create(postData)

    await logAudit(req, { action: 'post.create', targetType: 'post', targetId: post._id })

    const populated = await Post.findById(post._id).populate('author', 'name role verified')

    // Group.jsx expects newPost in group room
    if (groupId) io.to(toId(groupId)).emit('newPost', populated)

    // category live room (future)
    if (categoryId) io.to(`category_${toId(categoryId)}`).emit('newPost', populated)

    // also emit via helper for consistency
    emitPostEvent(io, post, 'newPost', populated)

    res.status(201).json(populated)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Single post ---------------- */

router.get('/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('author', 'name role verified')
      .populate({ path: 'comments', populate: { path: 'author', select: 'name role verified' } })

    if (!post) return res.status(404).json({ msg: 'Post not found' })

    const obj = post.toObject()
    obj.likes = Array.isArray(obj.likes) && obj.likes.length ? obj.likes : obj.upvotes || []

    res.json(obj)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Admin pin/unpin ---------------- */

router.post('/posts/:id/pin', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: 'Admin access required' })
    const post = await Post.findByIdAndUpdate(req.params.id, { isPinned: true }, { new: true })
    res.json(post)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/posts/:id/unpin', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: 'Admin access required' })
    const post = await Post.findByIdAndUpdate(req.params.id, { isPinned: false }, { new: true })
    res.json(post)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Upvote / Like (Group.jsx depends on postLiked) ---------------- */

router.post('/posts/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const io = req.app.get('io')
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    const userId = req.user.id.toString()

    const idx = post.upvotes.findIndex((id) => id.toString() === userId)
    if (idx === -1) post.upvotes.push(req.user.id)
    else post.upvotes.splice(idx, 1)

    // keep likes in sync for older UI
    const idx2 = post.likes.findIndex((id) => id.toString() === userId)
    if (idx2 === -1) post.likes.push(req.user.id)
    else post.likes.splice(idx2, 1)

    await post.save()
    await logAudit(req, { action: 'post.upvote_toggle', targetType: 'post', targetId: post._id })

    // 🔥 LIVE: Group.jsx listens for postLiked
    emitPostEvent(io, post, 'postLiked', {
      postId: toId(post._id),
      likes: post.likes,
      upvotes: post.upvotes,
    })

    res.json({ upvotes: post.upvotes, likes: post.likes })
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/posts/:id/like', authMiddleware, async (req, res) => {
  try {
    const io = req.app.get('io')
    const r = await Post.findById(req.params.id)
    if (!r) return res.status(404).json({ msg: 'Post not found' })

    const userId = req.user.id.toString()

    const idx = r.likes.findIndex((id) => id.toString() === userId)
    if (idx === -1) r.likes.push(req.user.id)
    else r.likes.splice(idx, 1)

    // keep upvotes in sync too
    const idx2 = r.upvotes.findIndex((id) => id.toString() === userId)
    if (idx2 === -1) r.upvotes.push(req.user.id)
    else r.upvotes.splice(idx2, 1)

    await r.save()
    await logAudit(req, { action: 'post.like_toggle', targetType: 'post', targetId: r._id })

    // 🔥 LIVE: Group.jsx listens for postLiked
    emitPostEvent(io, r, 'postLiked', {
      postId: toId(r._id),
      likes: r.likes,
      upvotes: r.upvotes,
    })

    res.json({ likes: r.likes, upvotes: r.upvotes })
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Helpful / highlight ---------------- */

router.post('/posts/:id/mark-helpful', authMiddleware, isProfessional, async (req, res) => {
  try {
    const io = req.app.get('io')
    const post = await Post.findById(req.params.id).populate('author', '_id')
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    if (post.author._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ msg: 'Cannot mark your own post helpful' })
    }

    const userId = req.user.id.toString()
    const idx = post.helpful.findIndex((id) => id.toString() === userId)

    if (idx === -1) post.helpful.push(req.user.id)
    else post.helpful.splice(idx, 1)

    await post.save()
    await User.findByIdAndUpdate(req.user.id, { $inc: { reputation: 1 } })
    await logAudit(req, { action: 'post.helpful_toggle', targetType: 'post', targetId: post._id })

    emitPostEvent(io, post, 'post:helpful', { postId: toId(post._id), helpful: post.helpful })

    res.json({ helpful: post.helpful })
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/posts/:id/helpful', authMiddleware, isProfessional, async (req, res) => {
  // backward compatible alias
  try {
    const io = req.app.get('io')
    const post = await Post.findById(req.params.id).populate('author', '_id')
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    if (post.author._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ msg: 'Cannot mark your own post helpful' })
    }

    const userId = req.user.id.toString()
    const idx = post.helpful.findIndex((id) => id.toString() === userId)

    if (idx === -1) post.helpful.push(req.user.id)
    else post.helpful.splice(idx, 1)

    await post.save()
    await User.findByIdAndUpdate(req.user.id, { $inc: { reputation: 1 } })
    await logAudit(req, { action: 'post.helpful_toggle', targetType: 'post', targetId: post._id })

    emitPostEvent(io, post, 'post:helpful', { postId: toId(post._id), helpful: post.helpful })

    res.json({ helpful: post.helpful })
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/posts/:id/highlight', authMiddleware, isProfessional, async (req, res) => {
  try {
    const io = req.app.get('io')
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ msg: 'You can only highlight your own posts' })
    }

    post.highlighted = !post.highlighted
    post.highlightedAt = post.highlighted ? new Date() : null
    post.highlightedBy = post.highlighted ? req.user.id : null

    await post.save()
    await logAudit(req, { action: 'post.highlight_toggle', targetType: 'post', targetId: post._id })

    emitPostEvent(io, post, 'post:highlight', { postId: toId(post._id), highlighted: post.highlighted })

    res.json({ highlighted: post.highlighted })
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Reports ---------------- */

router.post('/posts/:id/report', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body
    if (!reason || reason.trim() === '') return res.status(400).json({ msg: 'Reason is required' })

    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    const already = post.reports.find((r) => r.user.toString() === req.user.id.toString())
    if (already) return res.status(400).json({ msg: 'You already reported this post' })

    post.reports.push({ user: req.user.id, reason })
    await post.save()

    await Report.create({
      contentType: 'post',
      contentId: post._id,
      reason: reason.trim(),
      reportedBy: req.user.id,
    })

    await logAudit(req, { action: 'report.create', targetType: 'post', targetId: post._id })

    const io = req.app.get('io')
    if (io) io.to('admin').emit('report:new', { contentType: 'post', contentId: toId(post._id) })

    res.json({ reports: post.reports })
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/reports', authMiddleware, async (req, res) => {
  try {
    const { contentType, contentId, reason } = req.body
    if (!contentType || !contentId || !reason?.trim()) {
      return res.status(400).json({ msg: 'contentType, contentId, reason required' })
    }
    if (!['post', 'comment', 'discussion', 'question'].includes(contentType)) {
      return res.status(400).json({ msg: 'Invalid contentType' })
    }

    const report = await Report.create({
      contentType,
      contentId,
      reason: reason.trim(),
      reportedBy: req.user.id,
    })

    await logAudit(req, { action: 'report.create', targetType: contentType, targetId: contentId })

    const io = req.app.get('io')
    if (io) io.to('admin').emit('report:new', { contentType, contentId: toId(contentId) })

    res.status(201).json(report)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Comments ---------------- */

router.post('/posts/:id/comments', authMiddleware, async (req, res) => {
  try {
    const io = req.app.get('io')
    const { content, anonymous } = req.body
    if (!content?.trim()) return res.status(400).json({ msg: 'Content required' })

    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    const comment = await Comment.create({
      content: content.trim(),
      author: req.user.id,
      post: req.params.id,
      anonymous: anonymous === 'true' || !!anonymous,
      isProfessional: ['doctor', 'chw'].includes(req.user.role) && req.user.verified,
    })

    post.comments.push(comment._id)
    await post.save()

    const populatedComment = await Comment.findById(comment._id).populate('author', 'name role verified')

    emitPostEvent(io, post, 'newComment', {
      ...populatedComment.toObject(),
      post: post._id,
    })

    await logAudit(req, { action: 'post.comment', targetType: 'post', targetId: post._id })

    res.status(201).json(populatedComment)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/posts/:id/comment', authMiddleware, async (req, res) => {
  // compatibility alias
  try {
    const io = req.app.get('io')
    const { content, anonymous } = req.body
    if (!content?.trim()) return res.status(400).json({ msg: 'Content required' })

    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    const comment = await Comment.create({
      content: content.trim(),
      author: req.user.id,
      post: req.params.id,
      anonymous: anonymous === 'true' || !!anonymous,
      isProfessional: ['doctor', 'chw'].includes(req.user.role) && req.user.verified,
    })

    post.comments.push(comment._id)
    await post.save()

    const populatedComment = await Comment.findById(comment._id).populate('author', 'name role verified')

    emitPostEvent(io, post, 'newComment', {
      ...populatedComment.toObject(),
      post: post._id,
    })

    await logAudit(req, { action: 'post.comment', targetType: 'post', targetId: post._id })

    res.status(201).json(populatedComment)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/posts/:id/comments', authMiddleware, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'name role verified')
      .sort({ createdAt: 1 })
    res.json(comments)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Comment moderation ---------------- */

router.post('/comments/:id/highlight', authMiddleware, isDoctor, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { isHighlighted: true }, { new: true })
    res.json(comment)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/comments/:id/professional', authMiddleware, isDoctor, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { isProfessional: true }, { new: true })
    res.json(comment)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/comments/:id/recommended', authMiddleware, isCHW, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { isRecommended: true }, { new: true })
    res.json(comment)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/comments/:id/misinfo', authMiddleware, isDoctor, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { isMisinfo: true }, { new: true })
    res.json(comment)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Escalation / resolve ---------------- */

router.post('/posts/:id/escalate', authMiddleware, isCHW, async (req, res) => {
  try {
    const io = req.app.get('io')
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    if (!post.escalatedBy.includes(req.user.id)) post.escalatedBy.push(req.user.id)
    post.needsAttention = true

    await post.save()
    await logAudit(req, { action: 'post.escalate', targetType: 'post', targetId: post._id })

    emitPostEvent(io, post, 'post:attention', { postId: toId(post._id), needsAttention: true })
    res.json(post)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/posts/:id/resolve', authMiddleware, isDoctor, async (req, res) => {
  try {
    const io = req.app.get('io')
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { isResolved: true, needsAttention: false },
      { new: true }
    )
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    emitPostEvent(io, post, 'post:resolved', { postId: toId(post._id), isResolved: true, needsAttention: false })
    res.json(post)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Ask-an-expert ---------------- */

router.post('/posts/:id/question', authMiddleware, async (req, res) => {
  try {
    const { body, anonymous } = req.body
    if (!body || !body.trim()) return res.status(400).json({ msg: 'Question body required' })

    if (req.user.role !== 'patient') {
      return res.status(403).json({ msg: 'Only normal users can ask questions on professional posts' })
    }

    const post = await Post.findById(req.params.id).populate('author', 'role verified')
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    const isProPost = ['doctor', 'chw'].includes(post.author.role) && post.author.verified
    if (!isProPost) return res.status(403).json({ msg: 'Questions can only be asked on professional posts' })

    if (post.category) {
      const cat = await ensureForumCategoryWritable(post.category, req, res)
      if (!cat) return
    }

    const q = await Question.create({
      categoryId: post.category,
      postId: post._id,
      postOwner: post.author._id,
      askedBy: req.user.id,
      body: body.trim(),
      anonymous: !!anonymous,
    })

    await logAudit(req, { action: 'question.create_on_post', targetType: 'question', targetId: q._id })
    res.status(201).json({ msg: 'Question submitted', question: q })
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/questions', authMiddleware, async (req, res) => {
  try {
    const { categoryId, body, anonymous } = req.body
    if (!categoryId || !body || !body.trim()) {
      return res.status(400).json({ msg: 'categoryId and body required' })
    }

    if (req.user.role !== 'patient') {
      return res.status(403).json({ msg: 'Only normal users can submit general questions' })
    }

    const cat = await ensureForumCategoryWritable(categoryId, req, res)
    if (!cat) return

    const q = await Question.create({
      categoryId,
      postId: null,
      postOwner: null,
      askedBy: req.user.id,
      body: body.trim(),
      anonymous: !!anonymous,
    })

    await logAudit(req, { action: 'question.create_general', targetType: 'question', targetId: q._id })

    res.status(201).json({ msg: 'Question submitted', question: q })
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Replies helpers ---------------- */

router.get('/categories/:id/replies', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const { l, skip } = pageParams(page, limit, 50)

    const items = await Question.find({ categoryId: req.params.id, status: 'answered' })
      .sort({ answeredAt: -1 })
      .skip(skip)
      .limit(l)
      .populate('askedBy', 'name role verified')
      .populate('answeredBy', 'name role verified')
      .populate('postId', 'title author')

    const mapped = items.map((q) => {
      const obj = q.toObject()
      if (obj.anonymous) obj.askedBy = sanitizeAnonymousUser()
      return obj
    })

    res.json(mapped)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/posts/:id/replies', authMiddleware, async (req, res) => {
  try {
    const items = await Question.find({ postId: req.params.id, status: 'answered' })
      .sort({ answeredAt: -1 })
      .populate('askedBy', 'name role verified')
      .populate('answeredBy', 'name role verified')

    const mapped = items.map((q) => {
      const obj = q.toObject()
      if (obj.anonymous) obj.askedBy = sanitizeAnonymousUser()
      return obj
    })

    res.json(mapped)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Legacy admin support ---------------- */

router.get('/reported-posts', authMiddleware, isAdmin, async (req, res) => {
  try {
    const posts = await Post.find({ 'reports.0': { $exists: true } })
      .populate('author', 'name role verified')
      .populate('reports.user', 'name')
    res.json(posts)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/posts/:id/delete-post', authMiddleware, isAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    await Post.findByIdAndDelete(req.params.id)
    await logAudit(req, { action: 'admin.delete_post', targetType: 'post', targetId: req.params.id })

    res.json({ msg: 'Post deleted successfully' })
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Group chat messages ---------------- */

router.get('/groups/:id/messages', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.id })
      .populate('author', 'name')
      .sort({ createdAt: 1 })
    res.json(messages)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/groups/:id/messages', authMiddleware, async (req, res) => {
  try {
    const io = req.app.get('io')
    const { content } = req.body
    if (!content?.trim()) return res.status(400).json({ msg: 'Message content required' })

    const message = await Message.create({
      content: content.trim(),
      author: req.user.id,
      group: req.params.id,
    })

    const populated = await Message.findById(message._id).populate('author', 'name')
    io.to(req.params.id).emit('message', populated)

    res.status(201).json(populated)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

/* ---------------- Legacy Doctor/CHW endpoints ---------------- */

router.get('/urgent-posts', authMiddleware, isDoctor, async (req, res) => {
  try {
    const posts = await Post.find({
      $or: [{ urgency: 'urgent' }, { needsAttention: true }, { flaggedByKeywords: true }],
    })
      .sort({ needsAttention: -1, flaggedByKeywords: -1, createdAt: -1 })
      .limit(50)
      .populate('author', 'name role verified')
      .populate('category', 'name description isLocked')

    res.json(posts)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/unanswered-questions', authMiddleware, isDoctor, async (req, res) => {
  try {
    const qs = await Question.find({ status: 'unanswered' })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('askedBy', 'name role verified')
      .populate('postId', 'title author category')

    const mapped = qs.map((q) => {
      const obj = q.toObject()
      if (obj.anonymous) obj.askedBy = sanitizeAnonymousUser()
      return obj
    })

    res.json(mapped)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/doctor-stats', authMiddleware, isDoctor, async (req, res) => {
  try {
    const answered = await Question.countDocuments({ answeredBy: req.user.id, status: 'answered' })
    const urgentHandled = await Post.countDocuments({ needsAttention: false, escalatedBy: { $in: [req.user.id] } })
    res.json({ totalAnswers: answered, urgentHandled })
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/attention-posts', authMiddleware, isCHW, async (req, res) => {
  try {
    const posts = await Post.find({ $or: [{ flaggedByKeywords: true }, { urgency: 'urgent' }] })
      .sort({ flaggedByKeywords: -1, createdAt: -1 })
      .limit(50)
      .populate('author', 'name role verified')
      .populate('category', 'name description isLocked')

    res.json(posts)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/my-escalations', authMiddleware, isCHW, async (req, res) => {
  try {
    const posts = await Post.find({ escalatedBy: { $in: [req.user.id] } })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('author', 'name role verified')
      .populate('category', 'name description isLocked')
    res.json(posts)
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/chw-stats', authMiddleware, isCHW, async (req, res) => {
  try {
    const escalations = await Post.countDocuments({ escalatedBy: { $in: [req.user.id] } })
    const postsSupported = await Comment.countDocuments({ author: req.user.id })
    res.json({ postsSupported, escalations })
  } catch {
    res.status(500).json({ msg: 'Server error' })
  }
})

module.exports = router