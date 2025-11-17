import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const SymptomChecker = () => {
  const { t, i18n } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/diseases/symptoms', { 
        symptoms: symptoms.split(',').map(s => s.trim()) 
      });
      setResults(res.data.diseases);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">{t('symptomChecker.title')}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder={t('symptomChecker.placeholder')}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          {t('symptomChecker.checkButton')}
        </button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {results && (
        <div className="mt-4">
          <h2 className="text-xl">{t('symptomChecker.possibleDiseases')}</h2>
          {results.map((d, i) => (
            <div key={i} className="border p-2 mt-2">
              <h3 className="font-bold">
                {typeof d.name === 'object' ? d.name[i18n.language] || d.name.en : d.name}
              </h3>
              <p>
                {t('symptomChecker.causes')}: {typeof d.causes === 'object' ? d.causes[i18n.language] || d.causes.en : d.causes}
              </p>
              <p>
                {t('symptomChecker.symptoms')}: {' '}
                {Array.isArray(d.symptoms)
                  ? d.symptoms.join(', ')
                  : typeof d.symptoms === 'object'
                  ? (d.symptoms[i18n.language] || []).join(', ')
                  : d.symptoms}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;
