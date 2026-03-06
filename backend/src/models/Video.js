// FILE: backend/src/models/Video.js
const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    videoUrl: { type: String, required: true },

    // NEW (your upload route already generates it)
    thumbnailUrl: { type: String, default: '' },

    // NEW (so we can delete from cloudinary cleanly)
    cloudinaryPublicId: { type: String, default: '' },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Video', videoSchema)