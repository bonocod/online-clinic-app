const express = require('express')
const { matchSymptoms, getDisease, listDiseases ,searchDiseases } = require('../controllers/diseaseController')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// @route   POST /api/diseases/symptoms
// @desc    Match symptoms to diseases
// @access  Private
router.post('/symptoms', authMiddleware, matchSymptoms)

// @route   GET /api/diseases/:id
// @desc    Get disease details
// @access  Public (for MVP; can restrict later)
router.get('/search', searchDiseases)
router.get('/:id', getDisease)

// @route   GET /api/diseases
// @desc    List all diseases
// @access  Public
router.get('/', listDiseases)


module.exports = router