// FILE: backend/src/middleware/isCHW.js
const isCHW = (req, res, next) => {
  if (!req.user || req.user.role !== 'chw' || !req.user.verified) {
    return res.status(403).json({ msg: 'Verified CHW access required' })
  }
  next()
}

module.exports = isCHW