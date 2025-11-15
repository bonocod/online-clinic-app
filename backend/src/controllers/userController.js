const User = require('../models/User')

// backend/src/controllers/userController.js
const updateProfile = async (req, res, next) => {
  try {
    const allowed = [
      'age', 'gender', 'height', 'weight',
      'medicalHistory', 'conditions', 'interestedIn',
      'isPregnant', 'preferredLanguage'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowed.includes(key)) {
        updates[`profile.${key}`] = req.body[key];
      }
    });

    // Prevent duplicates
    if (updates['profile.conditions']) {
      updates['profile.conditions'] = [...new Set(updates['profile.conditions'])];
    }
    if (updates['profile.interestedIn']) {
      updates['profile.interestedIn'] = [...new Set(updates['profile.interestedIn'])];
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user, msg: req.__('profile.updated') });
  } catch (err) {
    next(err);
  }
};
module.exports = { updateProfile }