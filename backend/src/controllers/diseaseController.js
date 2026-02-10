const Disease = require('../models/Disease')

// POST /api/diseases/symptoms - Match symptoms to diseases

const matchSymptoms = async (req, res, next) => {
  try {
    const { symptoms } = req.body;

    // Validate input
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
      return res.status(400).json({ msg: 'Symptoms string is required' });
    }

    // Parse symptoms (sentence or comma-separated)
    const parsedSymptoms = symptoms
      .toLowerCase()
      .replace(/[.,!?]/g, '') // Remove punctuation
      .split(/\s+/) // Split by spaces
      .filter(s => s.length > 0); // Remove empty strings

    // Find diseases with at least one matching symptom
    const diseases = await Disease.find({
      symptoms: { $in: parsedSymptoms }
    }).select('name symptoms causes');

    if (diseases.length === 0) {
      console.log('No diseases found');
      return res.status(404).json({ msg: req.__('diseases.no_diseases_found') });
    }

    res.json({ diseases });

  } catch (err) {
    next(err);
  }
};


// GET /api/diseases/:id - Get single disease details
const getDisease = async (req, res, next) => {
  try {
    const disease = await Disease.findById(req.params.id)
    if (!disease) {
      return res.status(404).json({ msg: 'Disease not found' })
    }
    res.json(disease)
  } catch (err) {
    next(err)
  }
}
// GET /api/diseases - List all diseases
const listDiseases = async (req, res, next) => {
  try {
    const diseases = await Disease.find().select('name symptoms')
    res.json(diseases)
  } catch (err) {
    next(err)
  }
}
// GET /api/diseases/search?q=fever
const searchDiseases = async (req, res, next) => {
  try {
    const { q } = req.query
    const locale = req.getLocale() || 'en'
    if (!q || q.trim() === '') {
      return res.status(400).json({ msg: req.__('diseases.search_query_required') })
    }
    const query = q.trim()
    const diseases = await Disease.find({
      $or: [
        { 'name.en': { $regex: query, $options: 'i' } },
        { 'name.rw': { $regex: query, $options: 'i' } },
        { 'name.fr': { $regex: query, $options: 'i' } },
        { symptoms: { $regex: query, $options: 'i' } },
        { 'causes.en': { $regex: query, $options: 'i' } },
        { 'causes.rw': { $regex: query, $options: 'i' } },
        { 'causes.fr': { $regex: query, $options: 'i' } },
        { 'effects.en': { $regex: query, $options: 'i' } },
        { 'effects.rw': { $regex: query, $options: 'i' } },
        { 'effects.fr': { $regex: query, $options: 'i' } },
        { 'prevention.en': { $regex: query, $options: 'i' } },
        { 'prevention.rw': { $regex: query, $options: 'i' } },
        { 'prevention.fr': { $regex: query, $options: 'i' } },
        { 'behaviorGuidelines.en': { $regex: query, $options: 'i' } },
        { 'behaviorGuidelines.rw': { $regex: query, $options: 'i' } },
        { 'behaviorGuidelines.fr': { $regex: query, $options: 'i' } },
        { 'treatment.en': { $regex: query, $options: 'i' } },
        { 'treatment.rw': { $regex: query, $options: 'i' } },
        { 'treatment.fr': { $regex: query, $options: 'i' } }
      ]
    }).select('name symptoms')
    const translated = diseases.map(d => ({
      _id: d._id,
      name: d.name[locale] || d.name.en,
      symptoms: d.symptoms
    }))
    res.json({ diseases: translated, count: translated.length })
  } catch (err) {
    next(err)
  }
}
module.exports = { matchSymptoms, getDisease, listDiseases ,searchDiseases }