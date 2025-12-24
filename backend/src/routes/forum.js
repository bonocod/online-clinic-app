// backend/src/routes/forum.js
const express = require('express');
const authMiddleware = require('../middleware/auth');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Group = require('../models/Group');
const Message = require('../models/Message');
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

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit (adjust as needed)
});

// ==================== ROUTES ====================

// Get all groups
router.get('/groups', authMiddleware, async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get specific group by ID
router.get('/groups/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ msg: 'Group not found' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Join group
router.post('/groups/:id/join', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    if (!group.members.includes(req.user.id)) {
      group.members.push(req.user.id);
      await group.save();
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create post with media upload
router.post('/posts', authMiddleware, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No media file uploaded' });
    }

    const io = req.app.get('io');
    const { groupId, caption, captionStyle } = req.body;

    const mediaUrl = `/uploads/posts/${req.file.filename}`; // Now includes extension
    const mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';

    const post = new Post({
      mediaUrl,
      mediaType,
      caption: caption || '',
      captionStyle: captionStyle ? JSON.parse(captionStyle) : null,
      author: req.user.id,
      group: groupId
    });

    await post.save();

    const populated = await Post.findById(post._id)
      .populate('author', 'name');

    // Emit to all in group
    io.to(groupId).emit('newPost', populated);

    res.status(201).json(populated);
  } catch (err) {
    console.error('Post creation error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get posts in group
router.get('/groups/:id/posts', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ group: req.params.id })
      .populate('author', 'name')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Toggle like on post
router.post('/posts/:id/like', authMiddleware, async (req, res) => {
  try {
    const io = req.app.get('io');
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    const userId = req.user.id;
    const index = post.likes.findIndex(id => id.toString() === userId);

    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();

    io.to(post.group.toString()).emit('postLiked', { postId: post._id, likes: post.likes });

    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create comment
router.post('/posts/:id/comments', authMiddleware, async (req, res) => {
  try {
    const io = req.app.get('io');
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ msg: 'Content required' });

    const comment = new Comment({
      content: content.trim(),
      author: req.user.id,
      post: req.params.id
    });

    await comment.save();

    const post = await Post.findById(req.params.id);
    post.comments.push(comment._id);
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate('author', 'name');

    io.to(post.group.toString()).emit('newComment', {
      ...populatedComment.toObject(),
      post: post._id
    });

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get comments for post (optional route)
router.get('/posts/:id/comments', authMiddleware, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'name')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get messages for group
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

// Post message to group
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

module.exports = router;