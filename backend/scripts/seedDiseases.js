const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Disease = require('../src/models/Disease')

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  }
}

const diseases = [
  {
    name: { en: "Influenza", rw: "Influenza", fr: "Grippe" },
    symptoms: ["fever", "cough", "sore throat", "fatigue", "body aches"],
    causes: {
      en: "Influenza virus, spread through droplets",
      rw: "Virusi ya Influenza, itandukira binyuze mu matembabuzi",
      fr: "Virus de la grippe, propagé par les gouttelettes"
    },
    effects: {
      en: "Fever, muscle pain, fatigue",
      rw: "Umusonga, ububabare bwo mu mubiri, kunanirwa",
      fr: "Fièvre, douleurs musculaires, fatigue"
    },
    prevention: {
      en: "Vaccination, hand washing, avoid crowds",
      rw: "Gutera urushinge, kwiyuhagira intoki, kwirinda ingo nyinshi",
      fr: "Vaccination, lavage des mains, éviter les foules"
    },
    behaviorGuidelines: {
      en: "Rest, stay hydrated, avoid contact",
      rw: "Kuzimura, kunywa amazi menshi, kwirinda abandi",
      fr: "Repos, hydratation, éviter le contact"
    },
    treatment: {
      en: "Antivirals, rest, fluids",
      rw: "Imiti y'ivirusi, kuzimura, kunywa amazi",
      fr: "Antiviraux, repos, hydratation"
    }
  },
  {
    name: { en: "Common Cold", rw: "Icyorezo gisanzwe", fr: "Rhume" },
    symptoms: ["cough", "runny nose", "sore throat", "sneezing"],
    causes: {
      en: "Rhinoviruses, spread through contact",
      rw: "Virusi ya Rhinovirus, itandukira binyuze mu gukurikiranwa",
      fr: "Rhinovirus, propagé par contact"
    },
    effects: {
      en: "Nasal congestion, mild fever",
      rw: "Umunwa uturuka, umusonga muto",
      fr: "Nez bouché, légère fièvre"
    },
    prevention: {
      en: "Hand washing, avoid touching face",
      rw: "Kumesa intoki, kwirinda gukora mu maso",
      fr: "Lavage des mains, éviter de toucher le visage"
    },
    behaviorGuidelines: {
      en: "Rest, use tissues",
      rw: "Kuzimura, gukoresha amakarita",
      fr: "Repos, utiliser des mouchoirs"
    },
    treatment: {
      en: "Over-the-counter meds, hydration",
      rw: "Imiti yo mu duka, kunywa amazi",
      fr: "Médicaments en vente libre, hydratation"
    }
  }
]

const seedDiseases = async () => {
  await connectDB()
  try {
    await Disease.deleteMany()
    await Disease.insertMany(diseases)
    console.log('Diseases seeded with multilingual support!')
    process.exit()
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

seedDiseases()