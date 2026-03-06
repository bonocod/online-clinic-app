// FILE: backend/src/routes/admin.js
const express = require('express')
const authMiddleware = require('../middleware/auth')
const isAdmin = require('../middleware/isAdmin')
const { listAuditLogs, auditSummary } = require('../controllers/auditController')
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

  // NEW:
  getAuditLogs,
  getAuditSummary,
} = require('../controllers/adminController')

const router = express.Router()

router.use(authMiddleware, isAdmin)

router.post('/users', createUser)
router.get('/reported-posts', getReportedPosts)
router.delete('/posts/:id', deletePost)
router.patch('/posts/:id/resolve', resolveReport)

router.get('/professionals/pending', listPendingProfessionals)
router.patch('/professionals/:id/verify', verifyProfessional)

router.get('/discussions', listDiscussions)
router.post('/discussions/:id/approve', approveDiscussion)
router.post('/discussions/:id/reject', rejectDiscussion)
router.patch('/discussions/:id/pin', pinDiscussion)
router.patch('/discussions/:id/unpin', unpinDiscussion)

router.get('/reports', listReports)
router.patch('/reports/:id/resolve', resolveModerationReport)

router.patch('/categories/:id/lock', lockCategory)
router.patch('/categories/:id/unlock', unlockCategory)

router.get('/audit-logs', listAuditLogs)
router.get('/audit-logs/summary', auditSummary)

module.exports = router