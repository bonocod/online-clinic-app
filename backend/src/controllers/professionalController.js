// FILE: backend/src/controllers/professionalController.js
const Post = require('../models/Post');
const Question = require('../models/Question');
const getUnansweredQuestions = async (req, res) => {
  try {
    const { filter } = req.query; // general or myposts
    const query = { status: 'unanswered' };
    if (filter === 'myposts') {
      query.postId = { $exists: true };
      query['post.author'] = req.user.id;
    } else {
      query.postId = { $exists: false };
    }
    const questions = await Question.find(query)
      .populate('askedBy', 'name')
      .populate('post', 'title');
    res.json(questions);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
const answerQuestion = async (req, res) => {
  try {
    const { answer } = req.body;
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ msg: 'Question not found' });
    question.status = 'answered';
    question.answeredBy = req.user.id;
    question.answer = answer;
    question.answeredAt = Date.now();
    await question.save();
    res.json(question);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
const getPostsNeedingAttention = async (req, res) => {
  try {
    const posts = await Post.find({ escalatedBy: { $exists: true, $ne: [] } })
      .populate('author', 'name role')
      .populate('escalatedBy', 'name');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
const getDiscussionHighlights = async (req, res) => {
  try {
    // Assuming highlights are comments waiting for review
    const comments = await Comment.find({ isHighlighted: true, discussionId: { $exists: true } })
      .populate('author', 'name role')
      .populate('discussionId', 'title');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
const getStats = async (req, res) => {
  try {
    const answeredCount = await Question.countDocuments({ answeredBy: req.user.id });
    const avgTime = await Question.aggregate([
      { $match: { answeredBy: req.user.id } },
      { $group: { _id: null, avgTime: { $avg: { $subtract: ['$answeredAt', '$askedAt'] } } } }
    ]);
    res.json({
      answeredQuestions: answeredCount,
      avgResponseTime: avgTime[0]?.avgTime / (1000 * 60 * 60) || 0 // in hours
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
module.exports = {
  getUnansweredQuestions,
  answerQuestion,
  getPostsNeedingAttention,
  getDiscussionHighlights,
  getStats
};