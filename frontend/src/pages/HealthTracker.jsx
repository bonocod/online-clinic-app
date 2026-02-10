import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import HealthLogForm from '../components/HealthLogForm';
import HealthChart from '../components/HealthChart';
import { Clock, Activity } from 'lucide-react';

const HealthTracker = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [vitals, setVitals] = useState({ bp: '', temp: '', heartRate: '' });
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/logs');
      setLogs(res.data.logs);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error fetching logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/logs', { vitals, notes });
      setVitals({ bp: '', temp: '', heartRate: '' });
      setNotes('');
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.msg || 'Error adding log');
    }
  };

  if (loading) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-center">Loading logs...</motion.div>;
  if (error) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-red-500 text-center">{error}</motion.div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-4xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-dark">{t('healthTracker.title')}</h1>
      <HealthLogForm
        vitals={vitals}
        setVitals={setVitals}
        notes={notes}
        setNotes={setNotes}
        handleSubmit={handleSubmit}
        error={error}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 glass-card"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center text-secondary">
          <Clock className="mr-2" />
          {t('healthTracker.recentLogs')}
        </h2>
        <div className="space-y-4">
          {logs.slice(0, 5).map((log) => (
            <div key={log._id} className="bg-neutral p-4 rounded-xl">
              <p className="font-medium">{t('healthTracker.date')}: {new Date(log.date).toLocaleDateString()}</p>
              <p>{t('healthTracker.bp')}: {log.vitals.bp}</p>
              <p>{t('healthTracker.temp')}: {log.vitals.temp}°C</p>
              <p>{t('healthTracker.heartRateLabel')}: {log.vitals.heartRate} bpm</p>
              <p>{t('healthTracker.notesLabel')}: {log.notes}</p>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <HealthChart logs={logs} />
      </motion.div>
    </motion.div>
  );
};

export default HealthTracker;