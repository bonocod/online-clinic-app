import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import { AlertCircle, Clock } from 'lucide-react';
const MyDiseases = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({});
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setProfile(res.data);
        setReminders(res.data.profile?.reminders || []);
      } catch (err) {
        setError(t('myDiseases.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [t]);
  const handleSetReminder = async (disease) => {
    const time = newReminder[disease];
    if (!time) return;
    try {
      const updatedReminders = [...reminders, { disease, time }];
      await api.put('/users/profile', { reminders: updatedReminders });
      setReminders(updatedReminders);
      setNewReminder(prev => ({ ...prev, [disease]: '' }));
    } catch (err) {
      setError('Failed to set reminder');
    }
  };
  if (loading) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-center">{t('myDiseases.loading')}</motion.div>;
  if (error) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-red-500 text-center">{error}</motion.div>;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-4xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-dark">{t('myDiseases.title')}</h1>
      {profile.profile?.conditions?.length > 0 ? (
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center text-red-600">
            <AlertCircle className="mr-2" />
            {t('dashboard.diseasesIHave')}
          </h2>
          <div className="space-y-4">
            {profile.profile.conditions.map((disease) => (
              <div key={disease} className="bg-neutral p-4 rounded-xl">
                <p className="font-bold">{disease}</p>
                <input
                  type="time"
                  value={newReminder[disease] || ''}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, [disease]: e.target.value }))}
                  className="input-field mt-2"
                />
                <button onClick={() => handleSetReminder(disease)} className="btn-primary mt-2">
                  {t('dashboard.setReminder')}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-600">No diseases added yet.</p>
      )}
      {reminders.length > 0 && (
        <div className="glass-card mt-8">
          <h2 className="text-xl font-bold mb-4 flex items-center text-blue-600">
            <Clock className="mr-2" />
            {t('dashboard.reminders')}
          </h2>
          <ul className="space-y-2">
            {reminders.map((r, i) => (
              <li key={i} className="flex items-center text-gray-700">
                <Clock className="mr-2 text-blue-500 w-4 h-4" />
                {r.disease} at {r.time}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};
export default MyDiseases;