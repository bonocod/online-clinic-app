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

// NEW models
const Discussion = require('../models/Discussion')
const Question = require('../models/Question')
const Report = require('../models/Report')

const { logAudit } = require('../utils/audit')

const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = express.Router()

/**
 * Helpers
 */
const sanitizeAnonymousUser = () => ({
  _id: null,
  name: 'Anonymous',
  role: 'patient',
  verified: false,
})

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
  const matched = keywords.filter((k) => t.includes(k))
  return matched
}

/**
 * MULTER CONFIGURATION
 */
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

const upload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } })

/**
 * CATEGORIES
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ type: 'forum' }).sort({ name: 1 })
    res.json(categories)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) return res.status(404).json({ msg: 'Category not found' })
    res.json(category)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Follow / Unfollow category
 */
router.post('/categories/:id/follow', authMiddleware, async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id)
    if (!cat) return res.status(404).json({ msg: 'Category not found' })

    await User.findByIdAndUpdate(req.user.id, { $addToSet: { followedCategories: cat._id } })
    await logAudit(req, { action: 'category.follow', targetType: 'category', targetId: cat._id })

    const u = await User.findById(req.user.id).select('followedCategories')
    res.json({ followedCategories: u.followedCategories })
  } catch (e) {
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
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * CATEGORY FEED (NEW): /categories/:id/feed?tab=posts|discussions|replies
 */
router.get('/categories/:id/feed', authMiddleware, async (req, res) => {
  try {
    const { tab = 'posts', page = 1, limit = 10 } = req.query
    const categoryId = req.params.id

    if (tab === 'posts') {
      const posts = await Post.find({ category: categoryId })
        .sort({ isPinned: -1, highlighted: -1, createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate('author', 'name role verified')
        .populate({ path: 'comments', populate: { path: 'author', select: 'name role verified' } })

      // likes compatibility
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
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate('createdBy', 'name role verified')

      // ensure auto-close if needed
      await Promise.all(open.map((d) => maybeAutoCloseDiscussion(d)))

      const closed = await Discussion.find({ categoryId, status: 'closed' })
        .sort({ isPinned: -1, closedAt: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .populate('createdBy', 'name role verified')

      return res.json({
        open,
        closed,
      })
    }

    if (tab === 'replies') {
      const answered = await Question.find({ categoryId, status: 'answered' })
        .sort({ answeredAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
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
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Backward-compatible posts list (your current frontend uses it):
 * GET /categories/:id/posts?tab=recent|popular|questions|discussions|posts|replies
 */
router.get('/categories/:id/posts', authMiddleware, async (req, res) => {
  try {
    const { tab = 'recent', page = 1, limit = 10, pinned } = req.query

    const query = { category: req.params.id }
    if (pinned === 'true') query.isPinned = true

    // legacy tabs
    let sortObj = { createdAt: -1 }

    if (tab === 'popular') sortObj = { upvotes: -1 }

    if (tab === 'questions') query.type = 'question'
    if (tab === 'discussions') query.type = 'general'

    // NEW tab name "posts" -> show all posts
    if (tab === 'posts') {
      // no extra filter
    }

    // NEW tab name "replies" -> answered questions
    if (tab === 'replies') {
      const answered = await Question.find({ categoryId: req.params.id, status: 'answered' })
        .sort({ answeredAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
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

    const posts = await Post.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'name role verified')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name role verified' },
      })

    const mapped = posts.map((p) => {
      const obj = p.toObject()
      obj.likes = Array.isArray(obj.likes) && obj.likes.length ? obj.likes : obj.upvotes || []
      return obj
    })

    res.json(mapped)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/categories/:id/circles', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    const circles = await Group.find({
      conditionTag: category.name.toLowerCase().replace(' ', '-'),
      type: 'circle',
    })
    res.json(circles)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * DISCUSSIONS (NEW)
 */
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

    res.status(201).json({
      msg: 'Discussion submitted — waiting admin approval',
      discussion: d,
    })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/categories/:id/discussions', authMiddleware, async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query
    const categoryId = req.params.id

    const base = { categoryId }
    const include = status === 'all'
    const openQuery = include ? { ...base, status: 'open' } : { ...base, status }
    const closedQuery = include ? { ...base, status: 'closed' } : { ...base, status }

    const open = await Discussion.find(openQuery)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('createdBy', 'name role verified')

    await Promise.all(open.map((d) => maybeAutoCloseDiscussion(d)))

    // if requesting only open, skip closed
    if (status === 'open') return res.json({ open, closed: [] })

    const closed = await Discussion.find(closedQuery)
      .sort({ isPinned: -1, closedAt: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'name role verified')

    res.json({ open, closed })
  } catch (e) {
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
  } catch (e) {
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
    res.status(201).json(populated)
  } catch (e) {
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

    res.json({ msg: 'Discussion closed', discussion: d })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * GROUPS/CIRCLES
 */
router.get('/groups', authMiddleware, async (req, res) => {
  try {
    const groups = await Group.find()
    res.json(groups)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/groups/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
    if (!group) return res.status(404).json({ msg: 'Group not found' })
    res.json(group)
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * POSTS (Global)
 */
router.get('/posts', authMiddleware, async (req, res) => {
  try {
    const { type, sort, limit } = req.query
    const query = {}
    if (type) query.type = type

    let sortObj = { createdAt: -1 }
    if (sort === 'upvoted') sortObj = { 'upvotes.length': -1 }

    const posts = await Post.find(query)
      .sort(sortObj)
      .limit(parseInt(limit) || 10)
      .populate('author', 'name role verified')
      .populate({ path: 'comments', populate: { path: 'author', select: 'name role verified' } })

    const mapped = posts.map((p) => {
      const obj = p.toObject()
      obj.likes = Array.isArray(obj.likes) && obj.likes.length ? obj.likes : obj.upvotes || []
      return obj
    })

    res.json(mapped)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * FIXED ORDER: trending + related must be BEFORE /posts/:id
 */
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
          author: { name: 1, role: 1, verified: 1 },
        },
      },
    ])

    res.json(posts)
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Create post (patients cannot set urgency or proType)
 * Professionals can set proType (advice/general/lesson)
 */
router.post('/posts', authMiddleware, upload.single('media'), async (req, res) => {
  try {
    if (!req.body.title || !req.body.body) {
      return res.status(400).json({ msg: 'Title and body required' })
    }

    const io = req.app.get('io')
    const { title, body, groupId, categoryId, anonymous, type, proType } = req.body

    // validate forum category lock if posting in a category
    if (categoryId) {
      const cat = await ensureForumCategoryWritable(categoryId, req, res)
      if (!cat) return
    }

    const isProf = ['doctor', 'chw'].includes(req.user.role) && req.user.verified
    const isPatient = req.user.role === 'patient'

    // patients: no urgency control, always general
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

    // keyword flagging (system triage)
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

    if (groupId) io.to(groupId).emit('newPost', populated)
    else if (categoryId) io.to(`category_${categoryId}`).emit('newPost', populated)

    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Get single post and increment views
 */
router.get('/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('author', 'name role verified')
      .populate({ path: 'comments', populate: { path: 'author', select: 'name role verified' } })

    if (!post) return res.status(404).json({ msg: 'Post not found' })

    const obj = post.toObject()
    obj.likes = Array.isArray(obj.likes) && obj.likes.length ? obj.likes : obj.upvotes || []

    res.json(obj)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Admin pin/unpin posts (kept)
 */
router.post('/posts/:id/pin', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: 'Admin access required' })
    const post = await Post.findByIdAndUpdate(req.params.id, { isPinned: true }, { new: true })
    res.json(post)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/posts/:id/unpin', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: 'Admin access required' })
    const post = await Post.findByIdAndUpdate(req.params.id, { isPinned: false }, { new: true })
    res.json(post)
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Upvote post toggle (kept) + keeps likes in sync for old frontend
 */
router.post('/posts/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    const userId = req.user.id.toString()

    const idx = post.upvotes.findIndex((id) => id.toString() === userId)
    if (idx === -1) post.upvotes.push(req.user.id)
    else post.upvotes.splice(idx, 1)

    // sync likes
    const idx2 = post.likes.findIndex((id) => id.toString() === userId)
    if (idx2 === -1) post.likes.push(req.user.id)
    else post.likes.splice(idx2, 1)

    await post.save()
    await logAudit(req, { action: 'post.upvote_toggle', targetType: 'post', targetId: post._id })

    res.json({ upvotes: post.upvotes, likes: post.likes })
  } catch (err) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Compatibility alias: /posts/:id/like (Group.jsx uses it)
 */
router.post('/posts/:id/like', authMiddleware, async (req, res) => {
  // same as upvote
  try {
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

    res.json({ likes: r.likes, upvotes: r.upvotes })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Professional-only: mark helpful (distinct from upvote)
 * - only verified professionals
 * - cannot mark own post
 */
router.post('/posts/:id/mark-helpful', authMiddleware, isProfessional, async (req, res) => {
  try {
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

    res.json({ helpful: post.helpful })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Backward-compatible: /posts/:id/helpful (your frontend uses it)
 */
router.post('/posts/:id/helpful', authMiddleware, isProfessional, async (req, res) => {
  // proxy to mark-helpful logic
  try {
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

    res.json({ helpful: post.helpful })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Professional-only: highlight own post
 */
router.post('/posts/:id/highlight', authMiddleware, isProfessional, async (req, res) => {
  try {
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

    res.json({ highlighted: post.highlighted })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Report post:
 * - keeps old Post.reports
 * - also creates unified Report document for moderation queue
 */
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

    res.json({ reports: post.reports })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Create comment on a post
 */
router.post('/posts/:id/comments', authMiddleware, async (req, res) => {
  try {
    const io = req.app.get('io')
    const { content, anonymous } = req.body
    if (!content?.trim()) return res.status(400).json({ msg: 'Content required' })

    const comment = await Comment.create({
      content: content.trim(),
      author: req.user.id,
      post: req.params.id,
      anonymous: anonymous === 'true' || !!anonymous,
      isProfessional: ['doctor', 'chw'].includes(req.user.role) && req.user.verified,
    })

    const post = await Post.findById(req.params.id)
    post.comments.push(comment._id)
    await post.save()

    const populatedComment = await Comment.findById(comment._id).populate('author', 'name role verified')
    io.to(post.group?.toString() || `category_${post.category?.toString()}`).emit('newComment', {
      ...populatedComment.toObject(),
      post: post._id,
    })

    await logAudit(req, { action: 'post.comment', targetType: 'post', targetId: post._id })

    res.status(201).json(populatedComment)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Compatibility alias: /posts/:id/comment (your Post.jsx currently calls it)
 */
router.post('/posts/:id/comment', authMiddleware, async (req, res) => {
  // proxy to /comments
  try {
    const { content, anonymous } = req.body
    if (!content?.trim()) return res.status(400).json({ msg: 'Content required' })

    const comment = await Comment.create({
      content: content.trim(),
      author: req.user.id,
      post: req.params.id,
      anonymous: anonymous === 'true' || !!anonymous,
      isProfessional: ['doctor', 'chw'].includes(req.user.role) && req.user.verified,
    })

    const post = await Post.findById(req.params.id)
    post.comments.push(comment._id)
    await post.save()

    const populatedComment = await Comment.findById(comment._id).populate('author', 'name role verified')
    await logAudit(req, { action: 'post.comment', targetType: 'post', targetId: post._id })

    res.status(201).json(populatedComment)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/posts/:id/comments', authMiddleware, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'name role verified')
      .sort({ createdAt: 1 })
    res.json(comments)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Comment moderation (kept + improved security)
 */
router.post('/comments/:id/highlight', authMiddleware, isDoctor, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { isHighlighted: true }, { new: true })
    res.json(comment)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/comments/:id/professional', authMiddleware, isDoctor, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { isProfessional: true }, { new: true })
    res.json(comment)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/comments/:id/recommended', authMiddleware, isCHW, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { isRecommended: true }, { new: true })
    res.json(comment)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/comments/:id/misinfo', authMiddleware, isDoctor, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { isMisinfo: true }, { new: true })
    res.json(comment)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Escalate post (CHW) -> doctors attention queue
 */
router.post('/posts/:id/escalate', authMiddleware, isCHW, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    if (!post.escalatedBy.includes(req.user.id)) {
      post.escalatedBy.push(req.user.id)
    }
    post.needsAttention = true

    await post.save()
    await logAudit(req, { action: 'post.escalate', targetType: 'post', targetId: post._id })

    res.json(post)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Doctor resolves/handles (legacy)
 */
router.post('/posts/:id/resolve', authMiddleware, isDoctor, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { isResolved: true, needsAttention: false }, { new: true })
    res.json(post)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * ASK-AN-EXPERT (NEW)
 * - Post-based question: only patients can ask, only on professional posts (doctor/chw verified)
 * POST /forum/posts/:id/question
 */
router.post('/posts/:id/question', authMiddleware, async (req, res) => {
  try {
    const { body, anonymous } = req.body
    if (!body || !body.trim()) return res.status(400).json({ msg: 'Question body required' })

    // only normal users can ask here
    if (req.user.role !== 'patient') {
      return res.status(403).json({ msg: 'Only normal users can ask questions on professional posts' })
    }

    const post = await Post.findById(req.params.id).populate('author', 'role verified')
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    const isProPost = ['doctor', 'chw'].includes(post.author.role) && post.author.verified
    if (!isProPost) return res.status(403).json({ msg: 'Questions can only be asked on professional posts' })

    // category lock applies
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
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * General Ask-an-Expert (NEW)
 * POST /forum/questions
 * body: { categoryId, body, anonymous }
 */
router.post('/questions', authMiddleware, async (req, res) => {
  try {
    const { categoryId, body, anonymous } = req.body
    if (!categoryId || !body || !body.trim()) {
      return res.status(400).json({ msg: 'categoryId and body required' })
    }

    // only normal users for general question queue
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
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Replies tab helpers:
 * - GET /forum/categories/:id/replies  (answered questions in category)
 * - GET /forum/posts/:id/replies       (answered questions for a post)
 */
router.get('/categories/:id/replies', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const items = await Question.find({ categoryId: req.params.id, status: 'answered' })
      .sort({ answeredAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('askedBy', 'name role verified')
      .populate('answeredBy', 'name role verified')
      .populate('postId', 'title author')

    const mapped = items.map((q) => {
      const obj = q.toObject()
      if (obj.anonymous) obj.askedBy = sanitizeAnonymousUser()
      return obj
    })

    res.json(mapped)
  } catch (e) {
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
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Unified reports endpoint (NEW): POST /forum/reports
 * body: { contentType, contentId, reason }
 */
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

    res.status(201).json(report)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Admin-only: Get reported posts (kept for your existing Admin UI)
 */
router.get('/reported-posts', authMiddleware, isAdmin, async (req, res) => {
  try {
    const posts = await Post.find({ 'reports.0': { $exists: true } })
      .populate('author', 'name role verified')
      .populate('reports.user', 'name')
    res.json(posts)
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Delete Post (Admin Only) - kept
 */
router.post('/posts/:id/delete-post', authMiddleware, isAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'Post not found' })

    await Post.findByIdAndDelete(req.params.id)
    await logAudit(req, { action: 'admin.delete_post', targetType: 'post', targetId: req.params.id })

    res.json({ msg: 'Post deleted successfully' })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * MESSAGES
 */
router.get('/groups/:id/messages', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.id })
      .populate('author', 'name')
      .sort({ createdAt: 1 })
    res.json(messages)
  } catch (e) {
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
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

/**
 * Legacy endpoints used by your current DoctorConsole/CHWConsole pages
 * (kept so you don't break before frontend refactor)
 */
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
  } catch (e) {
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
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/doctor-stats', authMiddleware, isDoctor, async (req, res) => {
  try {
    const answered = await Question.countDocuments({ answeredBy: req.user.id, status: 'answered' })
    const urgentHandled = await Post.countDocuments({ needsAttention: false, escalatedBy: { $in: [req.user.id] } })
    res.json({ totalAnswers: answered, urgentHandled })
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

router.get('/chw-stats', authMiddleware, isCHW, async (req, res) => {
  try {
    const escalations = await Post.countDocuments({ escalatedBy: { $in: [req.user.id] } })
    const postsSupported = await Comment.countDocuments({ author: req.user.id })
    res.json({ postsSupported, escalations })
  } catch (e) {
    res.status(500).json({ msg: 'Server error' })
  }
})

module.exports = router