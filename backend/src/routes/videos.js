//# FILE: backend/src/routes/users.js
const express = require('express')
const { updateProfile } = require('../controllers/userController')
const authMiddleware = require('../middleware/auth')
const User = require('../models/User');

const router = express.Router()

router.put('/profile', authMiddleware, updateProfile)

router.get('/top', async (req, res) => {
  try {
    const users = await User.find({}).sort({reputation: -1}).limit(5).select('name role reputation');
    res.json(users);
  } catch (err) {
    res.status(500).json({msg: 'Server error'});
  }
});

module.exports = router