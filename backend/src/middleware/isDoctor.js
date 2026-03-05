// FILE: backend/src/middleware/isDoctor.js
const isDoctor = (req, res, next) => {
  if (!req.user || req.user.role !== 'doctor' || !req.user.verified) {
    return res.status(403).json({ msg: 'Verified doctor access required' })
  }
  next()
}

module.exports = isDoctor