const User = require('../models/User');
const express = require('express')
const { updateProfile } = require('../controllers/userController')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.put('/profile', authMiddleware, updateProfile)

module.exports = router