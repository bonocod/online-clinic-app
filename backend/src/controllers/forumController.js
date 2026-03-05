// FILE: backend/src/controllers/forumController.js
const Post = require('../models/Post');
const Discussion = require('../models/Discussion');
const Comment = require('../models/Comment');
const Question = require('../models/Question');
const Category = require('../models/Category');
const User = require('../models/User');

// Categories
const getCategories = async (req, res) => {
  const categories = await Category.find({ type: 'forum' });
  res.json(categories);
};

const getCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ msg: 'Category not found' });
  res.json(category);
};

// Posts in category with tabs
const getCategoryPosts = async (req, res) => {
  const { id } = req.params;
  const { tab = 'posts', page = 1, limit = 10 } = req.query;
  let query = { category: id };
  let model = Post;
  let sort = { createdAt: -1 };

  if (tab === 'discussions') {
    model = Discussion;
    query.status = 'open';
    sort = { createdAt: -1 };
  } else if (tab === 'replies') {
    // For replies, fetch questions answered
    const questions = await Question.find({ status: 'answered' }).sort({ answeredAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    return res.json(questions);
  }

  const items = await model.find(query).sort(sort).skip((page - 1) * limit).limit(parseInt(limit))
    .populate('author', 'name role')
    .populate('comments');

  res.json(items);
};

// Create Discussion
const createDiscussion = async (req, res) => {
  const { categoryId, title, body, closeAt } = req.body;
  const discussion = new Discussion({
    categoryId,
    title,
    body,
    createdBy: req.user.id,
    closeAt
  });
  await discussion.save();
  res.status(201).json(discussion);
};

// Create Post
const createPost = async (req, res) => {
  const { categoryId, title, body, type, anonymous, attachments } = req.body;
  const post = new Post({
    categoryId,
    title,
    body,
    author: req.user.id,
    type: req.user.role !== 'patient' ? type : undefined,
    anonymous,
    attachments
  });
  await post.save();
  const populated = await Post.findById(post._id).populate('author', 'name role');
  res.status(201).json(populated);
};

// Ask Question on Post
const askQuestionOnPost = async (req, res) => {
  const { id } = req.params;
  const { body, anonymous } = req.body;
  const post = await Post.findById(id);
  if (!post || post.author.role === 'patient') return res.status(403).json({ msg: 'Can only ask on professional posts' });
  const question = new Question({
    postId: id,
    askedBy: req.user.id,
    body,
    anonymous
  });
  await question.save();
  res.status(201).json(question);
};

// Get Professional Questions
const getProfessionalQuestions = async (req, res) => {
  const { filter = 'general' } = req.query;
  let query = { status: 'unanswered' };
  if (filter === 'myposts') {
    const myPosts = await Post.find({ author: req.user.id }).select('_id');
    query.postId = { $in: myPosts.map(p => p._id) };
  } else {
    query.postId = null;
  }
  const questions = await Question.find(query).populate('askedBy', 'name').sort({ askedAt: -1 });
  res.json(questions);
};

// Answer Question
const answerQuestion = async (req, res) => {
  const { id } = req.params;
  const { answer } = req.body;
  const question = await Question.findById(id);
  if (!question || question.status === 'answered') return res.status(400).json({ msg: 'Invalid question' });
  question.answer = answer;
  question.answeredBy = req.user.id;
  question.status = 'answered';
  question.answeredAt = Date.now();
  await question.save();
  res.json(question);
};

// Mark Post Helpful
const markHelpful = async (req, res) => {
  if (req.user.role === 'patient') return res.status(403).json({ msg: 'Professionals only' });
  const post = await Post.findById(req.params.id);
  const index = post.helpful.indexOf(req.user.id);
  if (index === -1) post.helpful.push(req.user.id);
  else post.helpful.splice(index, 1);
  await post.save();
  res.json(post);
};

// Highlight Post
const highlightPost = async (req, res) => {
  if (req.user.role === 'patient') return res.status(403).json({ msg: 'Professionals only' });
  const post = await Post.findById(req.params.id);
  if (post.author.toString() !== req.user.id) return res.status(403).json({ msg: 'Own posts only' });
  post.highlighted = !post.highlighted;
  await post.save();
  res.json(post);
};

// Report Content
const reportContent = async (req, res) => {
  const { contentId, contentType, reason } = req.body;
  let model;
  if (contentType === 'post') model = Post;
  else if (contentType === 'discussion') model = Discussion;
  else if (contentType === 'comment') model = Comment;
  else return res.status(400).json({ msg: 'Invalid type' });
  const content = await model.findById(contentId);
  content.reports.push({ user: req.user.id, reason });
  await content.save();
  res.json({ msg: 'Reported' });
};

// Admin: Get Waiting Discussions
const getWaitingDiscussions = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  const discussions = await Discussion.find({ status: 'waiting' }).populate('createdBy', 'name');
  res.json(discussions);
};

// Admin: Approve Discussion
const approveDiscussion = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  const discussion = await Discussion.findById(req.params.id);
  discussion.status = 'open';
  discussion.approvedBy = req.user.id;
  await discussion.save();
  res.json(discussion);
};

module.exports = {
  getCategories,
  getCategory,
  getCategoryPosts,
  createDiscussion,
  createPost,
  askQuestionOnPost,
  getProfessionalQuestions,
  answerQuestion,
  markHelpful,
  highlightPost,
  reportContent,
  getWaitingDiscussions,
  approveDiscussion
};