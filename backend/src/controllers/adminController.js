// FILE: backend/src/controllers/adminController.js
// backend/src/controllers/adminController.js
const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!['patient', 'chw', 'doctor'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User exists' });
    user = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
      verified: role === 'doctor' ? false : true // Doctors need verification?
    });
    await user.save();
    res.status(201).json({ msg: 'User created' });
  } catch (err) {
    next(err);
  }
};



const getReportedPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ 'reports.0': { $exists: true } })
      .populate('author', 'name role')
      .populate('reports.user', 'name');

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Post deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const resolveReport = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    post.reports = [];
    await post.save();

    res.json({ msg: 'Reports cleared' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createUser,
  getReportedPosts,
  deletePost,
  resolveReport
};