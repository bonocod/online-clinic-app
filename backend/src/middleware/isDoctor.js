// FILE: backend/src/middleware/isDoctor.js
// backend/src/middleware/isDoctor.js
const isDoctor = (req, res, next) => {
  if (!req.user || req.user.role !== 'doctor') {
    return res.status(403).json({ msg: 'Doctor access required' });
  }
  next();
};

module.exports = isDoctor;