// backend/src/routes/videos.js

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Video = require('../models/Video');
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

const storage = multer.diskStorage({});
const upload = multer({ storage });

// =============================
// Upload Video (Admin Only)
// =============================
router.post(
  '/upload',
  authMiddleware,
  isAdmin,
  upload.single('video'),
  async (req, res) => {
    try {
      const { title, description, category } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video',
      });

      // Generate thumbnail
      const thumbnailUrl = cloudinary.url(`${result.public_id}.jpg`, {
        resource_type: 'video',
        width: 320,
        height: 180,
        crop: 'fill',
        quality: 'auto',
      });

      const video = await Video.create({
        title,
        description,
        videoUrl: result.secure_url,
        thumbnailUrl,
        category,
      });

      res.json(video);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// =============================
// Get All Videos
// =============================
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().populate('category');
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================
// Get Videos By Category
// =============================
router.get('/category/:id', async (req, res) => {
  try {
    const videos = await Video.find({ category: req.params.id })
      .populate('category');

    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;