import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Activity } from 'lucide-react';

const DiseaseCard = ({ disease, language }) => {
  const { t } = useTranslation();
  const name = typeof disease.name === 'object' ? disease.name[language] || disease.name.en : disease.name;
  const symptoms = Array.isArray(disease.symptoms) ? disease.symptoms.join(', ') : disease.symptoms;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card overflow-hidden"
    >
      <div className="flex items-center mb-4">
        <Activity className="w-8 h-8 text-primary mr-3" />
        <h3 className="text-xl font-bold text-dark">{name}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {t('diseaseList.symptoms')}: {symptoms}
      </p>
      <Link
        to={`/diseases/${disease._id}`}
        className="text-primary hover:text-secondary transition-colors font-medium flex items-center"
      >
        {t('diseaseList.viewDetails')}
        <span className="ml-1">&rarr;</span>
      </Link>
    </motion.div>
  );
};

export default DiseaseCard;