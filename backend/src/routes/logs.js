const express = require('express')
const { createLog, getLog, getLogs } = require('../controllers/logController')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.get('/',authMiddleware,getLogs)

// @route   POST /api/logs
// @desc    Create a health log
// @access  Private
router.post('/', authMiddleware, createLog)

// @route   GET /api/logs
// @desc    Get all user logs
// @access  Private


// @route   GET /api/logs/:id
// @desc    Get single log
// @access  Private
router.get('/:id', authMiddleware, getLog)

module.exports = router