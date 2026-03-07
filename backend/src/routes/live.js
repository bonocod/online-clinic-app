const express = require('express');
const authMiddleware = require('../middleware/auth');
const isDoctor = require('../middleware/isDoctor');
const {
  startSession,
  endSession,
  getSession,
  getActiveSessions,
  getPastSessions,
  submitQuestion,
  answerQuestion,
  skipQuestion,
  getQueue,
} = require('../controllers/liveController');

const router = express.Router();

// Doctor endpoints
router.post('/sessions', authMiddleware, isDoctor, startSession);
router.patch('/sessions/:id/end', authMiddleware, isDoctor, endSession);
router.post('/questions/:id/answer', authMiddleware, isDoctor, answerQuestion);
router.post('/questions/:id/skip', authMiddleware, isDoctor, skipQuestion);

// Public endpoints (authenticated)
router.get('/sessions/active', authMiddleware, getActiveSessions);
router.get('/sessions/past', authMiddleware, getPastSessions);
router.get('/sessions/:id', authMiddleware, getSession);
router.get('/sessions/:id/queue', authMiddleware, getQueue);
router.post('/sessions/:id/questions', authMiddleware, submitQuestion);

module.exports = router;