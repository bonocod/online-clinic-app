import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Heart, Thermometer, Activity, FileText } from 'lucide-react';

const HealthLogForm = ({ vitals, setVitals, notes, setNotes, handleSubmit, error }) => {
  const { t } = useTranslation();

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card space-y-6"
    >
      <div className="relative">
        <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
        <input
          type="text"
          placeholder={t('healthTracker.bpPlaceholder')}
          value={vitals.bp}
          onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
          className="input-field pl-10"
        />
      </div>
      <div className="relative">
        <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
        <input
          type="number"
          placeholder={t('healthTracker.tempPlaceholder')}
          value={vitals.temp}
          onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
          className="input-field pl-10"
        />
      </div>
      <div className="relative">
        <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
        <input
          type="number"
          placeholder={t('healthTracker.heartRatePlaceholder')}
          value={vitals.heartRate}
          onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
          className="input-field pl-10"
        />
      </div>
      <div className="relative">
        <FileText className="absolute left-3 top-3 text-primary w-5 h-5" />
        <textarea
          placeholder={t('healthTracker.notesPlaceholder')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field pl-10 pt-3 min-h-[100px] resize-y"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="btn-primary w-full">
        {t('healthTracker.addLog')}
      </button>
    </motion.form>
  );
};

export default HealthLogForm;