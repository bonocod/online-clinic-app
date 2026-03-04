// FILE: backend/src/middleware/isCHW.js
// backend/src/middleware/isCHW.js
const isCHW = (req, res, next) => {
  if (!req.user || req.user.role !== 'chw') {
    return res.status(403).json({ msg: 'CHW access required' });
  }
  next();
};

module.exports = isCHW;