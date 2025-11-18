import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

const SymptomInput = ({ symptoms, setSymptoms, handleSubmit }) => {
  const { t } = useTranslation();

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card space-y-6"
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
        <input
          type="text"
          placeholder={t('symptomChecker.placeholder')}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="input-field pl-10"
        />
      </div>
      <button type="submit" className="btn-primary w-full">
        {t('symptomChecker.checkButton')}
      </button>
    </motion.form>
  );
};

export default SymptomInput;