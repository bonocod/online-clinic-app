const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Behavior = require('../src/models/Behavior');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

const behaviors = [
  // Good Behaviors
  {
    type: 'good',
    title: { en: "Drink Enough Water", rw: "Nywa Amazi Ahagije", fr: "Boire suffisamment d'eau" },
    description: { en: "Drinking at least 8 glasses daily helps maintain energy, skin health and removes toxins.", rw: "Kunywa amazi menshi buri munsi bituma ufite imbaraga kandi uruhu rwiza.", fr: "Boire au moins 8 verres par jour améliore l'énergie et la santé de la peau." },
    emoji: "💧",
    imageUrl: "https://source.unsplash.com/600x400/?water,hydration"
  },
  {
    type: 'good',
    title: { en: "Exercise Daily", rw: "Kora Siporo Buri Munsi", fr: "Faire de l'exercice quotidien" },
    description: { en: "30 minutes of movement strengthens heart, improves mood and controls weight.", rw: "Iminota 30 y'ibikorwa by'umubiri bigarura umutima kandi bikongerera umunezero.", fr: "30 minutes d'exercice renforcent le cœur et améliorent l'humeur." },
    emoji: "🏃",
    imageUrl: "https://source.unsplash.com/600x400/?exercise,fitness"
  },
  {
    type: 'good',
    title: { en: "Eat Vegetables & Fruits", rw: "Rya Imboga n'Imbuto", fr: "Manger légumes et fruits" },
    description: { en: "Rich in vitamins and fiber. Boosts immunity and prevents diseases.", rw: "Bifite vitamine nyinshi kandi bikongera ubudahangarwa.", fr: "Riches en vitamines et fibres, renforce l'immunité." },
    emoji: "🥦",
    imageUrl: "https://source.unsplash.com/600x400/?vegetables,fruits"
  },
  {
    type: 'good',
    title: { en: "Sleep Well", rw: "Sinzira Neza", fr: "Bien dormir" },
    description: { en: "7-9 hours of quality sleep improves memory and mental health.", rw: "Kusinzira amasaha 7-9 biragarura ubwenge n'ubuzima bwo mu mutwe.", fr: "7-9 heures de sommeil améliorent la mémoire et la santé mentale." },
    emoji: "🛌",
    imageUrl: "https://source.unsplash.com/600x400/?sleep,bed"
  },
  {
    type: 'good',
    title: { en: "Practice Gratitude", rw: "Gushimira", fr: "Pratiquer la gratitude" },
    description: { en: "Daily gratitude reduces stress and increases happiness.", rw: "Gushimira buri munsi bigabanya umutwaro.", fr: "La gratitude quotidienne réduit le stress." },
    emoji: "🙏",
    imageUrl: "https://source.unsplash.com/600x400/?gratitude,peace"
  },

  // Bad Behaviors
  {
    type: 'bad',
    title: { en: "Smoking", rw: "Ifumuro", fr: "Fumer" },
    description: { en: "Smoking is the leading cause of lung cancer and heart disease.", rw: "Ifumuro ni yo itera kanseri y'impwemu n'indwara z'umutima.", fr: "Le tabac est la première cause de cancer du poumon." },
    emoji: "🚬",
    imageUrl: "https://source.unsplash.com/600x400/?smoking,cigarette"
  },
  {
    type: 'bad',
    title: { en: "Excessive Sugar", rw: "Isukari Nyinshi", fr: "Trop de sucre" },
    description: { en: "Too much sugar leads to obesity, diabetes and energy crashes.", rw: "Isukari nyinshi itera diabete n'ibiro byinshi.", fr: "Trop de sucre provoque obésité et diabète." },
    emoji: "🍭",
    imageUrl: "https://source.unsplash.com/600x400/?sugar,candy"
  },
  {
    type: 'bad',
    title: { en: "Sitting Too Long", rw: "Kwicara Cyane", fr: "Rester assis longtemps" },
    description: { en: "Prolonged sitting increases risk of heart disease and back pain.", rw: "Kwicara igihe kirekire byongera ibyago by'indwara z'umutima.", fr: "Rester assis longtemps augmente les risques cardiaques." },
    emoji: "🪑",
    imageUrl: "https://source.unsplash.com/600x400/?sitting,office"
  }
];

const seedBehaviors = async () => {
  await connectDB();
  try {
    await Behavior.deleteMany({});
    await Behavior.insertMany(behaviors);
    console.log(`🌱 Seeded ${behaviors.length} behaviors with images!`);
    process.exit();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedBehaviors();