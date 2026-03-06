// FILE: backend/src/routes/categories.js
const express = require('express')
const Category = require('../models/Category')
const authMiddleware = require('../middleware/auth')
const isAdmin = require('../middleware/isAdmin')
const { logAudit } = require('../utils/audit')

const router = express.Router()

// Create Category (Admin only)
router.post('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, description, type } = req.body
    if (!name || !type) return res.status(400).json({ error: 'name and type are required' })
    if (!['video', 'forum'].includes(type)) return res.status(400).json({ error: 'Invalid type' })

    const category = await Category.create({ name, description: description || '', type })
    await logAudit(req, { action: 'category.create', targetType: 'category', targetId: category._id })

    const io = req.app.get('io')
    if (io) io.to('admin').emit('categoryUpdated', category)

    res.json(category)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get All Categories
router.get('/', async (req, res) => {
  const categories = await Category.find().sort({ type: 1, name: 1 })
  res.json(categories)
})

module.exports = router