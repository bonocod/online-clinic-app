const jwt = require('jsonwebtoken')
const User = require('../models/User');


const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ msg: req.__('common.unauthorized') })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('profile.preferredLanguage')
    
    req.user = { id: decoded.id }
    if (user?.profile?.preferredLanguage) {
      req.setLocale(user.profile.preferredLanguage)
    }
    console.log('done');
    next()
  } catch (err) {
    res.status(401).json({ msg: req.__('common.invalid_token') })
  }
}
module.exports = authMiddleware