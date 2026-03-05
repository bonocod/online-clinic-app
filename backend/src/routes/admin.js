// FILE: backend/src/routes/admin.js
const express = require('express')
const authMiddleware = require('../middleware/auth')
const isAdmin = require('../middleware/isAdmin')
const {
  createUser,
  getReportedPosts,
  deletePost,
  resolveReport,

  listPendingProfessionals,
  verifyProfessional,

  listDiscussions,
  approveDiscussion,
  rejectDiscussion,
  pinDiscussion,
  unpinDiscussion,

  listReports,
  resolveModerationReport,

  lockCategory,
  unlockCategory,
} = require('../controllers/adminController')

const router = express.Router()

router.use(authMiddleware, isAdmin)

// existing
router.post('/users', createUser)
router.get('/reported-posts', getReportedPosts)
router.delete('/posts/:id', deletePost)
router.patch('/posts/:id/resolve', resolveReport)

// NEW: verification
router.get('/professionals/pending', listPendingProfessionals)
router.patch('/professionals/:id/verify', verifyProfessional)

// NEW: discussions moderation
router.get('/discussions', listDiscussions)
router.post('/discussions/:id/approve', approveDiscussion)
router.post('/discussions/:id/reject', rejectDiscussion)
router.patch('/discussions/:id/pin', pinDiscussion)
router.patch('/discussions/:id/unpin', unpinDiscussion)

// NEW: reports queue
router.get('/reports', listReports)
router.patch('/reports/:id/resolve', resolveModerationReport)

// NEW: category lock/unlock
router.patch('/categories/:id/lock', lockCategory)
router.patch('/categories/:id/unlock', unlockCategory)

module.exports = router