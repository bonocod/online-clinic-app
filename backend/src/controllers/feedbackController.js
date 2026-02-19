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
      .populate('replies.user', 'name')  // ← Add this to populate reply users
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    next(err);
  }
};

// ... (keep existing addFeedback and getFeedback)



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
const likeFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.tipId);
    if (!feedback) return res.status(404).json({ msg: 'Feedback not found' });

    const userId = req.user.id.toString();
    const index = feedback.helpfulUsers.findIndex(u => u.toString() === userId);

    if (index === -1) {
      // Like
      feedback.helpfulUsers.push(userId);
    } else {
      // Unlike
      feedback.helpfulUsers.splice(index, 1);
    }

    feedback.helpful = feedback.helpfulUsers.length;
    await feedback.save();

    res.json(feedback);
  } catch (err) {
    next(err);
  }
};

module.exports = { addFeedback, getFeedback, likeFeedback, addReply };