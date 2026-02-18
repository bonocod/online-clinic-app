import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Activity } from 'lucide-react';

const DiseaseCard = ({ disease, language, searchQuery = '' }) => {  // ← Added searchQuery prop
  const { t } = useTranslation();
  const lang = language || 'en';

  const name = typeof disease.name === 'object' 
    ? disease.name[lang] || disease.name.en 
    : disease.name;

  // Robust symptoms handling
  let symptomsList = [];
  if (disease.symptoms) {
    if (Array.isArray(disease.symptoms)) {
      symptomsList = disease.symptoms;
    } else if (typeof disease.symptoms === 'object') {
      symptomsList = disease.symptoms[lang] || disease.symptoms.en || [];
    }
  }

  // Highlight function
  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => (
      <span key={i} className={part.toLowerCase() === query.toLowerCase() ? 'bg-yellow-200 font-medium' : ''}>
        {part}
      </span>
    ));
  };

  const symptoms = symptomsList.length > 0 
    ? highlightText(symptomsList.join(', '), searchQuery) 
    : 'No symptoms listed';

  const severityKey = disease.severity || 'moderate';
  const severityText = t(`diseaseSeverity.${severityKey}`);

  const severityColor = {
    mild: 'bg-green-100 text-green-700',
    moderate: 'bg-yellow-100 text-yellow-700',
    serious: 'bg-red-100 text-red-700'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden group"
    >
      <div className="h-40 overflow-hidden">
        <img
          src={disease.imageUrl || 'https://via.placeholder.com/600x400?text=Disease'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-dark">{name}</h3>
          <span className={`text-xs px-3 py-1 rounded-full font-medium uppercase ${severityColor[severityKey] || 'bg-gray-100'}`}>
            {severityText}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {t('diseaseList.symptoms')}: {symptoms}
        </p>

        <Link
          to={`/diseases/${disease._id}`}
          className="text-primary hover:text-secondary font-medium flex items-center"
        >
          {t('diseaseList.viewDetails')} <span className="ml-1">→</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default DiseaseCard;