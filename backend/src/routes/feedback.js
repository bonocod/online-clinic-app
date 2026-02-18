const express = require('express');
const authMiddleware = require('../middleware/auth');
const { addFeedback, getFeedback, likeFeedback, addReply } = require('../controllers/feedbackController');

const router = express.Router();

// POST /api/feedback/:diseaseId - Add tip
router.post('/:diseaseId', authMiddleware, addFeedback);

// GET /api/feedback/:diseaseId - Get tips for disease
router.get('/:diseaseId', getFeedback);

// POST /api/feedback/:tipId/like - Like a tip
router.post('/:tipId/like', authMiddleware, likeFeedback);

// POST /api/feedback/:tipId/reply - Add reply to tip
router.post('/:tipId/reply', authMiddleware, addReply);

module.exports = router;