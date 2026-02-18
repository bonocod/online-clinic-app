const Feedback = require('../models/Feedback');

const addFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;  // ← Removed diseaseId from body
    const feedback = new Feedback({
      disease: req.params.diseaseId,  // ← Use from URL params
      user: req.user.id,
      rating,
      comment
    });
    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    next(err);
  }
};

const getFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ disease: req.params.diseaseId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    next(err);
  }
};

// ... (keep existing addFeedback and getFeedback)

const likeFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.tipId,
      { $inc: { helpful: 1 } },
      { new: true }
    );
    if (!feedback) return res.status(404).json({ msg: 'Feedback not found' });
    res.json(feedback);
  } catch (err) {
    next(err);
  }
};

const addReply = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const feedback = await Feedback.findById(req.params.tipId);
    if (!feedback) return res.status(404).json({ msg: 'Feedback not found' });
    
    feedback.replies.push({
      user: req.user.id,
      comment
    });
    
    await feedback.save();
    const newReply = feedback.replies[feedback.replies.length - 1];
    res.status(201).json(newReply);
  } catch (err) {
    next(err);
  }
};

module.exports = { addFeedback, getFeedback, likeFeedback, addReply };