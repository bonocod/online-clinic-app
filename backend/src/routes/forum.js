//# FILE: backend/src/routes/forum.js
// backend/src/routes/forum.js
const express = require('express');
const authMiddleware = require('../middleware/auth');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Group = require('../models/Group');
const Message = require('../models/Message');
const Category = require('../models/Category');
const User = require('../models/User');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// ==================== MULTER CONFIGURATION ====================
// Define upload directory
const uploadDir = path.join(process.cwd(), 'uploads/posts');
// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Custom storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save all post media here
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // e.g., .jpg, .mp4, .png
    const filename = `post-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// File filter (optional: restrict to images/videos only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB limit (adjust as needed)

// ==================== CATEGORIES ====================
// Get all forum categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ type: 'forum' });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single category
router.get('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ msg: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get posts in category with enhanced filters
router.get('/categories/:id/posts', authMiddleware, async (req, res) => {
  try {
    const { tab, page = 1, limit = 20, pinned } = req.query;
    const skip = (page - 1) * limit;
    let query = { category: new mongoose.Types.ObjectId(req.params.id) };
    if (pinned === 'true') query.isPinned = true;
    if (tab === 'questions') query.type = 'question';
    if (tab === 'discussions') query.type = 'general';

    let sortObj = { createdAt: -1 }; // recent
    if (tab === 'popular') sortObj = { engagement: -1 }; // Need to compute engagement

    const posts = await Post.aggregate([
      { $match: query },
      { $addFields: { engagement: { $add: [{ $size: '$upvotes' }, { $size: '$comments' }] } } },
      { $sort: sortObj },
      { $skip: skip },
      { $limit: parseInt(limit) },
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
      { $unwind: '$author' }
    ]);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get related circles for category (by conditionTag)
router.get('/categories/:id/circles', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    const circles = await Group.find({ conditionTag: category.name.toLowerCase().replace(' ', '-'), type: 'circle' });
    res.json(circles);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ==================== GROUPS/CIRCLES ====================
// Get all groups/circles
router.get('/groups', authMiddleware, async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get specific group/circle by ID
router.get('/groups/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ msg: 'Group not found' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Join group/circle
router.post('/groups/:id/join', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ msg: 'Group not found' });
    if (group.approvalRequired) {
      // For private circles, perhaps add to pending, but for MVP, auto-join if public
      if (group.privacy === 'private') {
        // Logic for request sent
        return res.json({ msg: 'Request sent for approval' });
      }
    }
    if (!group.members.includes(req.user.id)) {
      group.members.push(req.user.id);
      await group.save();
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get posts in group/circle/category
router.get('/groups/:id/posts', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ group: req.params.id })
      .populate('author', 'name role')
      .populate({ path: 'comments', populate: { path: 'author', select: 'name role' } })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ==================== POSTS ====================
// Get posts (global, with filters)
router.get('/posts', authMiddleware, async (req, res) => {
  try {
    const { type, sort, limit } = req.query;
    let query = {};
    if (type) query.type = type;
    let sortObj = { createdAt: -1 };
    if (sort === 'upvoted') sortObj = { 'upvotes.length': -1 };
    const posts = await Post.find(query)
      .sort(sortObj)
      .limit(parseInt(limit) || 10)
      .populate('author', 'name role')
      .populate({ path: 'comments', populate: { path: 'author', select: 'name role' } });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create post with media upload
router.post('/posts', authMiddleware, upload.single('media'), async (req, res) => {
  try {
    if (!req.body.title || !req.body.body) {
      return res.status(400).json({ msg: 'Title and body required' });
    }
    const io = req.app.get('io');
    const { title, body, groupId, categoryId, urgency, anonymous, type } = req.body;
    const postData = {
      title,
      body,
      author: req.user.id,
      group: groupId || null,
      category: categoryId || null,
      urgency: urgency || 'general',
      anonymous: anonymous === 'true',
      type: type || (groupId ? 'general' : 'question') // Use provided type or default
    };

    if (req.file) {
      postData.mediaUrl = `/uploads/posts/${req.file.filename}`;
      postData.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
    }

    const post = new Post(postData);
    await post.save();

    const populated = await Post.findById(post._id)
      .populate('author', 'name role');

    if (groupId) {
      io.to(groupId).emit('newPost', populated);
    } else if (categoryId) {
      io.to(`category_${categoryId}`).emit('newPost', populated);
    }

    res.status(201).json(populated);
  } catch (err) {
    console.error('Post creation error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single post and increment views
router.get('/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('author', 'name role')
      .populate({ path: 'comments', populate: { path: 'author', select: 'name role', path: 'parent' } });
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get related posts
router.get('/posts/related/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    const related = await Post.aggregate([
      { $match: { category: post.category, _id: { $ne: post._id } } },
      { $addFields: { engagement: { $add: [{ $size: '$upvotes' }, { $size: '$comments' }] } } },
      { $sort: { engagement: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
      { $unwind: '$author' }
    ]);
    res.json(related);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Pin post (mod/admin only)
router.post('/posts/:id/pin', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!['moderator', 'admin'].includes(user.role)) return res.status(403).json({ msg: 'Unauthorized' });
    const post = await Post.findByIdAndUpdate(req.params.id, { isPinned: true }, { new: true });
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Unpin post (similar to pin, but set isPinned: false)
router.post('/posts/:id/unpin', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!['moderator', 'admin'].includes(user.role)) return res.status(403).json({ msg: 'Unauthorized' });
    const post = await Post.findByIdAndUpdate(req.params.id, { isPinned: false }, { new: true });
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get trending posts (top 5 last 7 days)
router.get('/posts/trending', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const posts = await Post.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $addFields: { activity: { $add: [{ $size: '$upvotes' }, { $size: '$comments' }] } } },
      { $sort: { activity: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
      { $unwind: '$author' },
      { $project: { title: 1, category: 1, comments: { $size: '$comments' }, upvotes: { $size: '$upvotes' }, author: { name: 1, role: 1 } } }
    ]);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Upvote post
router.post('/posts/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const io = req.app.get('io');
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    const userId = req.user.id;
    const index = post.upvotes.findIndex(id => id.toString() === userId);
    if (index === -1) {
      post.upvotes.push(userId);
      // Increase author reputation
      await User.findByIdAndUpdate(post.author, { $inc: { reputation: 1 } });
    } else {
      post.upvotes.splice(index, 1);
      await User.findByIdAndUpdate(post.author, { $inc: { reputation: -1 } });
    }
    await post.save();
    io.to(post.group?.toString() || `category_${post.category?.toString()}`).emit('postUpvoted', { postId: post._id, upvotes: post.upvotes });
    res.json({ upvotes: post.upvotes.length });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Mark helpful (only verified/doctor)
router.post('/posts/:id/helpful', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'doctor' && !user.verified) return res.status(403).json({ msg: 'Only verified doctors can mark helpful' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    const index = post.helpful.findIndex(id => id.toString() === req.user.id);
    if (index === -1) post.helpful.push(req.user.id);
    else post.helpful.splice(index, 1);
    await post.save();
    res.json({ helpful: post.helpful.length });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Report post
router.post('/posts/:id/report', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (!post.reports.includes(req.user.id)) {
      post.reports.push(req.user.id);
      await post.save();
      // Trigger moderation if reports > threshold, e.g., 5
      if (post.reports.length >= 5) {
        // Notify moderators or auto-hide
      }
    }
    res.json({ reports: post.reports.length });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ==================== COMMENTS ====================
// Create comment
router.post('/posts/:id/comments', authMiddleware, async (req, res) => {
  try {
    const io = req.app.get('io');
    const { content, anonymous } = req.body;
    if (!content?.trim()) return res.status(400).json({ msg: 'Content required' });
    const comment = new Comment({
      content: content.trim(),
      author: req.user.id,
      post: req.params.id,
      anonymous: anonymous === 'true'
    });
    await comment.save();
    const post = await Post.findById(req.params.id);
    post.comments.push(comment._id);
    await post.save();
    const populatedComment = await Comment.findById(comment._id).populate('author', 'name role');
    io.to(post.group?.toString() || `category_${post.category?.toString()}`).emit('newComment', { ...populatedComment.toObject(), post: post._id });
    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get comments for post
router.get('/posts/:id/comments', authMiddleware, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'name role')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Highlight comment (doctor only)
router.post('/comments/:id/highlight', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'doctor' || !user.verified) return res.status(403).json({ msg: 'Only verified doctors can highlight' });
    const comment = await Comment.findByIdAndUpdate(req.params.id, { isHighlighted: true }, { new: true });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ==================== MESSAGES ====================
// Get messages for group/circle
router.get('/groups/:id/messages', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.id })
      .populate('author', 'name')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Post message to group/circle
router.post('/groups/:id/messages', authMiddleware, async (req, res) => {
  try {
    const io = req.app.get('io');
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ msg: 'Message content required' });
    const message = new Message({
      content: content.trim(),
      author: req.user.id,
      group: req.params.id
    });
    await message.save();
    const populated = await Message.findById(message._id).populate('author', 'name');
    io.to(req.params.id).emit('message', populated);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Additional endpoints for MVP features like challenges, live Q&A can be added as optional

module.exports = router;