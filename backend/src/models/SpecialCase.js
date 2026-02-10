// backend/src/models/SpecialCase.js
const mongoose = require('mongoose');

const specialCaseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // hiv, pregnancy, etc.
  info: {
    en: {
      title: String,
      sections: [{ title: String, content: String }]
    },
    rw: {
      title: String,
      sections: [{ title: String, content: String }]
    },
    fr: {
      title: String,
      sections: [{ title: String, content: String }]
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('SpecialCase', specialCaseSchema);