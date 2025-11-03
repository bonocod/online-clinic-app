const express = require('express')
const { register, login, getProfile } = require('../controllers/authController')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register)

// @route   POST /api/auth/login
// @desc    Login user and get token
// @access  Public
router.post('/login', login)

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authMiddleware, getProfile)

module.exports = router