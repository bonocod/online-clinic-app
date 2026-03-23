const isPublicHealthEditor = (req, res, next) => {
  if (!req.user) return res.status(401).json({ msg: 'Authentication required' })

  if (req.user.isAdmin) return next()

  const isVerifiedProfessional =
    ['doctor', 'chw'].includes(req.user.role) && req.user.verified

  if (!isVerifiedProfessional) {
    return res.status(403).json({ msg: 'Public Health editor access required' })
  }

  next()
}

module.exports = isPublicHealthEditor