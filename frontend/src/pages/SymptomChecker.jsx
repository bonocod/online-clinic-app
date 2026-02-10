import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Activity, AlertTriangle } from 'lucide-react';
const SymptomChecker = () => {
  const { t, i18n } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/diseases/symptoms', { symptoms });
      setResults(res.data.diseases);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error');
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-4xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-dark">{t('symptomChecker.title')}</h1>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card space-y-6"
      >
        <textarea
          placeholder={t('symptomChecker.placeholder')}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="input-field min-h-[100px] resize-y"
        />
        <button type="submit" className="btn-primary w-full">
          {t('symptomChecker.checkButton')}
        </button>
      </motion.form>
      {error && <p className="text-red-500 mt-4 text-center flex items-center justify-center"><AlertTriangle className="mr-2" />{error}</p>}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold mb-4 text-secondary flex items-center">
            <Activity className="mr-2" />
            {t('symptomChecker.possibleDiseases')}
          </h2>
          <div className="space-y-6">
            {results.map((d, i) => (
              <div key={i} className="glass-card">
                <h3 className="font-bold text-xl text-dark">
                  {typeof d.name === 'object' ? d.name[i18n.language] || d.name.en : d.name}
                </h3>
                <p className="mt-2">
                  <span className="font-medium">{t('symptomChecker.causes')}:</span> {typeof d.causes === 'object' ? d.causes[i18n.language] || d.causes.en : d.causes}
                </p>
                <p className="mt-2">
                  <span className="font-medium">{t('symptomChecker.symptoms')}:</span> {' '}
                  {Array.isArray(d.symptoms)
                    ? d.symptoms.join(', ')
                    : typeof d.symptoms === 'object'
                    ? (d.symptoms[i18n.language] || []).join(', ')
                    : d.symptoms}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
export default SymptomChecker;