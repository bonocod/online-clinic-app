const User = require('../models/User')

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profile: req.body } },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) return res.status(404).json({ msg: req.__('profile.not_found') })
    res.json({ user, msg: req.__('profile.updated') })
  } catch (err) {
    next(err)
  }
}
module.exports = { updateProfile }