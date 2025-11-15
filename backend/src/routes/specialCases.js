// backend/src/routes/specialCases.js
const express = require('express');
const SpecialCase = require('../models/SpecialCase');
const router = express.Router();

// GET /api/special-cases/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const lang = req.getLocale() || 'en';
    const data = await SpecialCase.findOne({ id });
    if (!data) return res.status(404).json({ msg: 'Not found' });
    res.json(data.info[lang] || data.info.en);
  } catch (err) {
    next(err);
  }
});

module.exports = router;