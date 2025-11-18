import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const SpecialCaseModal = ({ isOpen, onClose, caseName, onSelect }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const caseKey = caseName === 'mental-health' ? 'mentalHealth' : caseName;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-dark">{t(`specialCases.${caseKey}`)}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <p className="mb-6 text-gray-600">{t('specialCaseModal.prompt')}</p>
        <div className="space-y-3">
          <button
            onClick={() => onSelect('has')}
            className="w-full bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-colors"
          >
            {t('specialCaseModal.optionHas')}
          </button>
          <button
            onClick={() => onSelect('info')}
            className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            {t('specialCaseModal.optionInfo')}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-neutral text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            {t('specialCaseModal.cancel')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SpecialCaseModal;