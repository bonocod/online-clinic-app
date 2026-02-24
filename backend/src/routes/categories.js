// backend/src/routes/categories.js
const express = require('express');
const Category = require('../models/Category');

const router = express.Router();

// Create Category
router.post('/', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Categories
router.get('/', async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

module.exports = router;