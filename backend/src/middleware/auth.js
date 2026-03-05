// FILE: backend/src/middleware/auth.js
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authMiddleware = async (req, res, next) => {
  try {
    const raw = req.header('Authorization')
    const token = raw?.startsWith('Bearer ') ? raw.replace('Bearer ', '') : raw

    if (!token) return res.status(401).json({ msg: req.__('common.unauthorized') })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select(
      'role verified isAdmin profile.preferredLanguage name'
    )

    if (!user) return res.status(401).json({ msg: req.__('common.invalid_token') })

    req.user = {
      id: user._id,
      role: user.role,
      verified: !!user.verified,
      isAdmin: !!user.isAdmin || !!decoded.isAdmin,
      name: user.name || '',
    }

    if (user?.profile?.preferredLanguage) req.setLocale(user.profile.preferredLanguage)

    next()
  } catch (err) {
    return res.status(401).json({ msg: req.__('common.invalid_token') })
  }
}

module.exports = authMiddleware