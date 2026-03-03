// backend/src/models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // ❌ remove unique: true
  description: String,
  type: { 
    type: String, 
    enum: ['video', 'forum'], 
    required: true 
  }
});

// ✅ Make name unique per type
categorySchema.index({ name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);