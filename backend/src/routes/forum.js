const express = require('express');
const authMiddleware = require('../middleware/auth');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Group = require('../models/Group');
const router = express.Router();

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
    if (!group.members.includes(req.user.id)) {
      group.members.push(req.user.id);
      await group.save();
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

//get specific post
router.get('/posts/:id', authMiddleware , async (req,res) => {

  try{
    const post = await Post.findById(req.params.id);
    res.status(201).json(post);


  }catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
})

// Create post
router.post('/posts', authMiddleware, async (req, res) => {
  try {
    const { title, content, groupId } = req.body;
    const post = new Post({ title, content, author: req.user.id, group: groupId });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get posts in group
router.get('/groups/:id/posts', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ group: req.params.id }).populate('author', 'name');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create comment
router.post('/posts/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { content, parent } = req.body;
    const comment = new Comment({ content, author: req.user.id, post: req.params.id, parent });
    await comment.save();
    const post = await Post.findById(req.params.id);
    post.replies += 1;
    post.comments.push(comment._id);
    await post.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get comments for post
router.get('/posts/:id/comments', authMiddleware, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id }).populate('author', 'name');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;