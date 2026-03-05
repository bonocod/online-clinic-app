// FILE: backend/src/middleware/isProfessional.js
const isProfessional = (req, res, next) => {
  if (
    !req.user ||
    !['doctor', 'chw'].includes(req.user.role) ||
    !req.user.verified
  ) {
    return res.status(403).json({ msg: 'Verified professional access required' })
  }
  next()
}

module.exports = isProfessional