// FILE: backend/src/controllers/forumController.js
const Post = require('../models/Post');
const Discussion = require('../models/Discussion');
const Comment = require('../models/Comment');
const Question = require('../models/Question');
const Category = require('../models/Category');
const User = require('../models/User');
const Group = require('../models/Group');
const Message = require('../models/Message');
const LiveSession = require('../models/LiveSession');
const SessionQuestion = require('../models/SessionQuestion');
const Report = require('../models/Report');

// ... (all your existing functions remain unchanged - I only added new ones below)

// ====================== LIVE Q&A SESSIONS ======================

const createLiveSession = async (req, res) => {
  try {
    const { title, description, categoryId, startTime } = req.body;
    if (!['doctor', 'chw'].includes(req.user.role) || !req.user.verified) {
      return res.status(403).json({ msg: 'Only verified professionals' });
    }
    const session = await LiveSession.create({
      title,
      description,
      host: req.user.id,
      category: categoryId || null,
      startTime: startTime || new Date(),
    });
    const io = req.app.get('io');
    io.to('professionals').emit('liveSessionCreated', session);
    if (categoryId) io.to(`category_${categoryId}`).emit('liveSessionCreated', session);
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const getLiveSessions = async (req, res) => {
  try {
    const { status = 'live' } = req.query;
    const sessions = await LiveSession.find({ status })
      .populate('host', 'name role')
      .populate('category', 'name')
      .sort({ startTime: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const getLiveSession = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id)
      .populate('host', 'name role')
      .populate('questions')
      .populate('currentQuestion');
    if (!session) return res.status(404).json({ msg: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const submitLiveQuestion = async (req, res) => {
  try {
    const { body, anonymous } = req.body;
    const session = await LiveSession.findById(req.params.id);
    if (!session || session.status !== 'live') {
      return res.status(400).json({ msg: 'Session not active' });
    }
    const q = await SessionQuestion.create({
      session: session._id,
      askedBy: req.user.id,
      body,
      anonymous: !!anonymous,
      position: (await SessionQuestion.countDocuments({ session: session._id })) + 1,
    });
    session.questions.push(q._id);
    await session.save();
    const io = req.app.get('io');
    io.to(`live_${session._id}`).emit('live:questionSubmitted', q);
    res.status(201).json(q);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const nextLiveQuestion = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id).populate('questions');
    if (!session || session.status !== 'live') return res.status(400).json({ msg: 'Invalid session' });
    if (req.user.id.toString() !== session.host.toString()) {
      return res.status(403).json({ msg: 'Only host can advance' });
    }
    // Find next queued
    const nextQ = await SessionQuestion.findOne({
      session: session._id,
      status: 'queued',
    }).sort({ position: 1 });
    if (!nextQ) return res.status(400).json({ msg: 'No more questions' });
    nextQ.status = 'current';
    await nextQ.save();
    session.currentQuestion = nextQ._id;
    await session.save();
    const io = req.app.get('io');
    io.to(`live_${session._id}`).emit('live:currentQuestion', nextQ);
    res.json(nextQ);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const answerLiveQuestion = async (req, res) => {
  try {
    const { answer } = req.body;
    const q = await SessionQuestion.findById(req.params.qid);
    if (!q || q.status !== 'current') return res.status(400).json({ msg: 'Invalid question' });
    q.answer = answer;
    q.status = 'answered';
    q.answeredBy = req.user.id;
    q.answeredAt = new Date();
    await q.save();
    const session = await LiveSession.findById(q.session);
    session.currentQuestion = null;
    await session.save();
    const io = req.app.get('io');
    io.to(`live_${session._id}`).emit('live:answer', { questionId: q._id, answer });
    res.json(q);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const endLiveSession = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session || session.host.toString() !== req.user.id.toString()) {
      return res.status(403).json({ msg: 'Only host can end' });
    }
    session.status = 'ended';
    session.endTime = new Date();
    session.archived = true;
    session.archivedAt = new Date();
    await session.save();
    const io = req.app.get('io');
    io.to(`live_${session._id}`).emit('live:ended', { sessionId: session._id });
    res.json({ msg: 'Session ended and archived' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const getPastSessions = async (req, res) => {
  try {
    const sessions = await LiveSession.find({ status: 'ended' })
      .populate('host', 'name')
      .populate('category', 'name')
      .sort({ endTime: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// ====================== SUPPORT CIRCLES ENHANCEMENTS ======================

const createGroup = async (req, res) => {
  try {
    const { name, description, privacy, conditionTag, topics } = req.body;
    const group = await Group.create({
      name,
      description,
      privacy: privacy || 'public',
      conditionTag,
      type: 'circle', // default new groups as circles
      topics: topics || [],
      moderators: [req.user.id],
    });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// ... (rest of your existing functions stay exactly as they were)

module.exports = {
  // === YOUR ORIGINAL EXPORTS (unchanged) ===
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
  approveDiscussion,
  // === NEW LIVE Q&A ===
  createLiveSession,
  getLiveSessions,
  getLiveSession,
  submitLiveQuestion,
  nextLiveQuestion,
  answerLiveQuestion,
  endLiveSession,
  getPastSessions,
  // === CIRCLE ENHANCEMENTS ===
  createGroup,
  // ... add any other you had
};