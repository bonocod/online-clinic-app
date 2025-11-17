import React from 'react';
import { useTranslation } from 'react-i18next';

const SpecialCaseModal = ({ isOpen, onClose, caseName, onSelect }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const caseKey = caseName === 'mental-health' ? 'mentalHealth' : caseName;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4">{t(`specialCases.${caseKey}`)}</h3>
        <p className="mb-6 text-sm text-gray-600">
          {t('specialCaseModal.prompt')}
        </p>
        <div className="space-y-3">
          <button
            onClick={() => onSelect('has')}
            className="w-full bg-red-500 text-white p-3 rounded font-medium"
          >
            {t('specialCaseModal.optionHas')}
          </button>
          <button
            onClick={() => onSelect('info')}
            className="w-full bg-blue-500 text-white p-3 rounded font-medium"
          >
            {t('specialCaseModal.optionInfo')}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-300 text-gray-700 p-3 rounded"
          >
            {t('specialCaseModal.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecialCaseModal;
