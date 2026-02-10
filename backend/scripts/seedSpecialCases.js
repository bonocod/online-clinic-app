// backend/scripts/seedSpecialCases.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SpecialCase = require('../src/models/SpecialCase');
dotenv.config();

const specialCases = [
  {
    id: 'hiv',
    info: {
      en: {
        title: "HIV Information",
        sections: [
          { title: "What is HIV?", content: "HIV attacks the immune system and can lead to AIDS if untreated." },
          { title: "Prevention", content: "Use protection, get tested regularly, avoid sharing needles." },
          { title: "Support in Rwanda", content: "Free testing at health centers. Contact CHUK or local clinic." }
        ]
      },
      rw: {
        title: "Amakuru ku VIH",
        sections: [
          { title: "VIH ni iki?", content: "VIH igabanya ubudahangarwa bw'umubiri kandi ishobora gutera SIDA niba ititabwaho." },
          { title: "Kuzirinda", content: "Koresha agakingirizo, kwipimisha buri gihe, kwirinda kunywana ibyuma." },
          { title: "Inkunga mu Rwanda", content: "Kwipimisha kubuntu mu bitaro. Hamagara CHUK cyangwa ikigo cy'ubuzima cyegereye." }
        ]
      },
      fr: {
        title: "Informations sur le VIH",
        sections: [
          { title: "Qu'est-ce que le VIH?", content: "Le VIH attaque le système immunitaire et peut mener au SIDA s'il n'est pas traité." },
          { title: "Prévention", content: "Utilisez des préservatifs, faites des tests réguliers, évitez les aiguilles partagées." },
          { title: "Soutien au Rwanda", content: "Dépistage gratuit dans les centres de santé. Contactez CHUK ou votre clinique locale." }
        ]
      }
    }
  },
  // ... Add cancer, diabetes, mental-health, pregnancy (same as before)
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await SpecialCase.deleteMany({});
  await SpecialCase.insertMany(specialCases);
  console.log('Special cases seeded!');
  process.exit();
};

seed();