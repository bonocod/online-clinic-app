const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Register a new user
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name) return res.status(400).json({ msg: req.__('auth.name_required') })
    if (!email) return res.status(400).json({ msg: req.__('auth.email_required') })
    if (!password) return res.status(400).json({ msg: req.__('auth.password_required') })

    let user = await User.findOne({ email })
    if (user) return res.status(400).json({ msg: req.__('auth.user_exists') })

    user = new User({ name, email, password: await bcrypt.hash(password, 10) })
    await user.save()

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })
    res.status(201).json({ token, msg: req.__('auth.register_success') })
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ msg: req.__('auth.invalid_credentials') })

    const user = await User.findOne({ email })
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ msg: req.__('auth.invalid_credentials') })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })
    res.json({ token, msg: req.__('auth.login_success') })
  } catch (err) {
    next(err)
  }
}

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ msg: req.__('profile.not_found') })
    res.json(user)
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, getProfile }
