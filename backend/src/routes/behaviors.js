const express = require('express');
const { getBehaviors } = require('../controllers/behaviorController');

const router = express.Router();

// GET /api/behaviors?type=good   or   ?type=bad
router.get('/', getBehaviors);

module.exports = router;