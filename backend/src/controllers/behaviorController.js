const Behavior = require('../models/Behavior');

const getBehaviors = async (req, res, next) => {
  try {
    const { type } = req.query; // 'good' or 'bad'

    const filter = type && ['good', 'bad'].includes(type) 
      ? { type } 
      : {};

    const behaviors = await Behavior.find(filter).sort({ createdAt: -1 });

    res.json(behaviors);
  } catch (err) {
    next(err);
  }
};

module.exports = { getBehaviors };