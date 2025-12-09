import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
const HealthBehaviors = () => {
  const { t } = useTranslation();
  const goodBehaviors = t('behaviors.good', { returnObjects: true });
  const badBehaviors = t('behaviors.bad', { returnObjects: true });
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-4xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-dark">{t('healthBehaviors.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center text-green-600">
            <CheckCircle className="mr-2" />
            {t('dashboard.goodBehaviors')}
          </h2>
          <ul className="space-y-2">
            {goodBehaviors.map((b, i) => (
              <li key={i} className="flex items-center text-gray-700"><CheckCircle className="mr-2 text-green-500 w-4 h-4" />{b}</li>
            ))}
          </ul>
        </div>
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center text-red-600">
            <XCircle className="mr-2" />
            {t('dashboard.badBehaviors')}
          </h2>
          <ul className="space-y-2">
            {badBehaviors.map((b, i) => (
              <li key={i} className="flex items-center text-gray-700"><XCircle className="mr-2 text-red-500 w-4 h-4" />{b}</li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};
export default HealthBehaviors;