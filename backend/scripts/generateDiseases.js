// scripts/generateDiseases.js
const fs = require('fs');
const axios = require('axios');
const translate = require('translate-google');

// Candidate diseases to add (new diseases not in your original file)
const candidateDiseases = [
  'Hepatitis C', 'Polio', 'Whooping Cough', 'Tetanus', 'Smallpox',
  'Chikungunya', 'Leishmaniasis', 'Schistosomiasis', 'Lyme Disease', 'SARS',
  'MERS', 'Cystic Fibrosis', 'Alzheimer\'s Disease', 'Parkinson\'s Disease', 'Epilepsy',
  'Dengue Fever', 'Rabies', 'Zika Virus', 'Yellow Fever', 'Meningitis'
];

// Function to fetch Wikipedia summary and translate
async function fetchDiseaseInfo(name) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;

    // Add User-Agent to avoid 403 errors
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'DiseaseSeeder/1.0 (contact: your-email@example.com)'
      }
    });

    const englishSummary = res.data.extract || 'No description found.';

    // Translate summary into French and Kinyarwanda
    const [fr, rw] = await Promise.all([
      translate(englishSummary, { to: 'fr' }),
      translate(englishSummary, { to: 'rw' })
    ]);

    return {
      name: { en: name, fr: name, rw: name },
      symptoms: [], // optional, can fill manually later
      causes: { en: englishSummary, fr, rw },
      effects: { en: englishSummary, fr, rw },
      prevention: {
        en: 'Consult medical experts.',
        fr: 'Consulter des experts médicaux.',
        rw: 'Gisha inama abaganga.'
      },
      behaviorGuidelines: {
        en: 'Follow medical advice.',
        fr: 'Suivre les conseils médicaux.',
        rw: 'Kurikiza inama z’abaganga.'
      },
      treatment: {
        en: 'Treatment varies per disease.',
        fr: 'Le traitement varie selon la maladie.',
        rw: 'Ubuvuzi butandukanye bitewe n’indwara.'
      }
    };
  } catch (err) {
    console.error(`Failed for ${name}:`, err.message);
    return null;
  }
}

(async () => {
  let existingNames = [];

  // Read existing diseases.json if it exists
  if (fs.existsSync('diseases.json')) {
    const existingData = JSON.parse(fs.readFileSync('diseases.json', 'utf-8'));
    existingNames = existingData.map(d => d.name.en);
  }

  // Filter candidate diseases to avoid duplicates
  const newDiseasesList = candidateDiseases.filter(d => !existingNames.includes(d));

  console.log(`🌱 Generating ${newDiseasesList.length} new diseases...`);

  const results = [];
  for (const name of newDiseasesList) {
    const info = await fetchDiseaseInfo(name);
    if (info) results.push(info);
  }

  // Append new diseases to existing diseases.json
  const finalData = fs.existsSync('diseases.json')
    ? [...JSON.parse(fs.readFileSync('diseases.json', 'utf-8')), ...results]
    : results;

  fs.writeFileSync('diseases.json', JSON.stringify(finalData, null, 2));
  console.log(`✅ Updated diseases.json with ${results.length} new diseases`);
})();
