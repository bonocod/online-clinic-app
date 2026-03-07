const LiveSession = require('../models/LiveSession');
const LiveQuestion = require('../models/LiveSessionQuestion');
const { logAudit } = require('../utils/audit');
const { notifyUser } = require('../utils/notify');

// Helper to update queue positions
const reorderQueue = async (sessionId) => {
  const pending = await LiveQuestion.find({ session: sessionId, status: 'pending' }).sort({ askedAt: 1 });
  for (let i = 0; i < pending.length; i++) {
    pending[i].position = i + 1;
    await pending[i].save();
  }
  return pending;
};

// Start a new live session (doctor)
const startSession = async (req, res, next) => {
  try {
    const { title, description, scheduledEndTime, categoryId } = req.body;
    if (!title) return res.status(400).json({ msg: 'Title required' });

    const session = await LiveSession.create({
      title,
      description,
      doctor: req.user.id,
      status: 'active',
      startedAt: new Date(),
      scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : null,
      category: categoryId || null,
    });

    await logAudit(req, { action: 'live.start', targetType: 'livesession', targetId: session._id });

    const io = req.app.get('io');
    if (io) {
      io.to('doctors').emit('live:newSession', session);
      if (categoryId) io.to(`category_${categoryId}`).emit('live:newSession', session);
    }

    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
};

// End a live session (doctor)
const endSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { saveForLater } = req.body;

    const session = await LiveSession.findOne({ _id: id, doctor: req.user.id });
    if (!session) return res.status(404).json({ msg: 'Session not found or not your session' });

    session.status = 'ended';
    session.endedAt = new Date();
    session.isSaved = !!saveForLater;
    await session.save();

    await logAudit(req, { action: 'live.end', targetType: 'livesession', targetId: session._id });

    const io = req.app.get('io');
    if (io) {
      io.to(`live_${id}`).emit('live:sessionEnded', { sessionId: id, saved: session.isSaved });
    }

    res.json({ msg: 'Session ended', session });
  } catch (err) {
    next(err);
  }
};

// Get session details (including questions)
const getSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await LiveSession.findById(id).populate('doctor', 'name role verified');
    if (!session) return res.status(404).json({ msg: 'Session not found' });

    const questions = await LiveQuestion.find({ session: id })
      .populate('askedBy', 'name')
      .populate('answeredBy', 'name')
      .sort({ askedAt: 1 });

    res.json({ session, questions });
  } catch (err) {
    next(err);
  }
};

// List active sessions
const getActiveSessions = async (req, res, next) => {
  try {
    const sessions = await LiveSession.find({ status: 'active' })
      .populate('doctor', 'name role verified')
      .sort({ startedAt: -1 });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

// List past sessions (ended and saved)
const getPastSessions = async (req, res, next) => {
  try {
    const sessions = await LiveSession.find({ status: 'ended', isSaved: true })
      .populate('doctor', 'name role verified')
      .sort({ endedAt: -1 });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

// Submit a question to a live session (user)
const submitQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question } = req.body;
    if (!question || !question.trim()) return res.status(400).json({ msg: 'Question required' });

    const session = await LiveSession.findOne({ _id: id, status: 'active' });
    if (!session) return res.status(404).json({ msg: 'Active session not found' });

    const existing = await LiveQuestion.findOne({ session: id, askedBy: req.user.id, status: 'pending' });
    if (existing) return res.status(400).json({ msg: 'You already have a pending question in this session' });

    const pendingCount = await LiveQuestion.countDocuments({ session: id, status: 'pending' });
    const position = pendingCount + 1;

    const q = await LiveQuestion.create({
      session: id,
      askedBy: req.user.id,
      question: question.trim(),
      position,
    });

    await logAudit(req, { action: 'live.ask', targetType: 'livequestion', targetId: q._id, metadata: { sessionId: id } });

    const io = req.app.get('io');
    if (io) {
      io.to(`live_${id}`).emit('live:newQuestion', {
        questionId: q._id,
        position: q.position,
        askedBy: req.user.id,
        question: q.question,
      });
      io.to(`live_${id}`).emit('live:queueUpdated', { pendingCount: pendingCount + 1 });
    }

    res.status(201).json({ msg: 'Question submitted', position: q.position, questionId: q._id });
  } catch (err) {
    next(err);
  }
};

// Answer a question (doctor)
const answerQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    if (!answer || !answer.trim()) return res.status(400).json({ msg: 'Answer required' });

    const question = await LiveQuestion.findById(id).populate('session');
    if (!question) return res.status(404).json({ msg: 'Question not found' });
    if (question.session.doctor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ msg: 'Only the session doctor can answer' });
    }
    if (question.status !== 'pending') return res.status(400).json({ msg: 'Question already answered or skipped' });

    question.answer = answer.trim();
    question.answeredBy = req.user.id;
    question.status = 'answered';
    question.answeredAt = new Date();
    await question.save();

    const pending = await reorderQueue(question.session._id);

    await logAudit(req, { action: 'live.answer', targetType: 'livequestion', targetId: question._id });

    const io = req.app.get('io');
    if (io) {
      io.to(`live_${question.session._id}`).emit('live:questionAnswered', {
        questionId: question._id,
        answer: question.answer,
        answeredBy: req.user.name,
        position: question.position,
      });
      io.to(`live_${question.session._id}`).emit('live:queueUpdated', {
        pending: pending.map(q => ({ id: q._id, position: q.position })),
      });
      io.to(`user_${question.askedBy.toString()}`).emit('live:yourQuestionAnswered', {
        sessionId: question.session._id,
        questionId: question._id,
        answer: question.answer,
      });
    }

    res.json({ msg: 'Answered', question });
  } catch (err) {
    next(err);
  }
};

// Skip a question (doctor)
const skipQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await LiveQuestion.findById(id).populate('session');
    if (!question) return res.status(404).json({ msg: 'Question not found' });
    if (question.session.doctor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ msg: 'Only the session doctor can skip' });
    }
    if (question.status !== 'pending') return res.status(400).json({ msg: 'Question already processed' });

    question.status = 'skipped';
    await question.save();

    const pending = await reorderQueue(question.session._id);

    const io = req.app.get('io');
    if (io) {
      io.to(`live_${question.session._id}`).emit('live:questionSkipped', {
        questionId: question._id,
      });
      io.to(`live_${question.session._id}`).emit('live:queueUpdated', {
        pending: pending.map(q => ({ id: q._id, position: q.position })),
      });
    }

    res.json({ msg: 'Question skipped' });
  } catch (err) {
    next(err);
  }
};

// Get current queue for a session
const getQueue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pending = await LiveQuestion.find({ session: id, status: 'pending' })
      .sort({ position: 1 })
      .populate('askedBy', 'name');
    res.json(pending);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  startSession,
  endSession,
  getSession,
  getActiveSessions,
  getPastSessions,
  submitQuestion,
  answerQuestion,
  skipQuestion,
  getQueue,
};