import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Baby, Apple, Dumbbell, AlertCircle, Stethoscope } from 'lucide-react';
const PregnancyManager = () => {
  const { t } = useTranslation();
  const sections = [
    { title: 'trimesterInfo', icon: Baby, content: 'Track your trimester progress and what to expect.' },
    { title: 'nutrition', icon: Apple, content: 'Eat folate-rich foods, iron, calcium. Avoid raw meat.' },
    { title: 'exercises', icon: Dumbbell, content: 'Walking, swimming, prenatal yoga. 30 min daily.' },
    { title: 'symptoms', icon: AlertCircle, content: 'Nausea, fatigue, back pain. Severe? See doctor.' },
    { title: 'doctor', icon: Stethoscope, content: 'Regular checkups. Urgent if bleeding or pain.' }
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-3xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-dark flex items-center justify-center">
        <Baby className="mr-2" />
        {t('pregnancyManager.title')}
      </h1>
      <div className="space-y-6">
        {sections.map((sec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card"
          >
            <h2 className="text-xl font-bold mb-2 flex items-center text-secondary">
              <sec.icon className="mr-2" />
              {t(`pregnancyManager.${sec.title}`)}
            </h2>
            <p className="text-gray-700">{sec.content}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
export default PregnancyManager;