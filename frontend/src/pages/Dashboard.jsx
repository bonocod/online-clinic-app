import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import { LayoutDashboard, Activity, Stethoscope, Heart, User, AlertCircle, CheckCircle, XCircle, Clock, Baby, Apple, Pill, Users } from 'lucide-react';
const Dashboard = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reminders, setReminders] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setProfile(res.data);
        setReminders(res.data.profile?.reminders || []);
      } catch (err) {
        setError('Error loading profile');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);
  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      reminders.forEach(r => {
        if (r.time === currentTime && Notification.permission === 'granted') {
          new Notification(`Reminder: Time for ${r.disease} medicine`);
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [reminders]);
  if (loading) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-center text-gray-600">Loading...</motion.div>;
  if (error) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-red-500 text-center">{error}</motion.div>;
  const cards = [
    { to: "/symptom-checker", icon: Stethoscope, label: t('dashboard.symptomChecker'), color: "bg-blue-100 text-blue-600" },
    { to: "/diseases", icon: Activity, label: t('dashboard.diseases'), color: "bg-green-100 text-green-600" },
    //{ to: "/health-tracker", icon: Heart, label: t('dashboard.healthTracker'), color: "bg-yellow-100 text-yellow-600" },
    { to: "/mental-health", icon: AlertCircle, label: t('dashboard.mentalHealth'), color: "bg-indigo-100 text-indigo-600" },
    { to: "/health-behaviors", icon: Apple, label: t('dashboard.healthBehaviors'), color: "bg-orange-100 text-orange-600" },
    { to: "/my-diseases", icon: Pill, label: t('dashboard.myDiseases'), color: "bg-red-100 text-red-600" },
    { to: "/forum", icon: Users, label: t('dashboard.forum'), color: "bg-purple-100 text-purple-600" },
    { to: "/profile", icon: User, label: t('dashboard.profile'), color: "bg-purple-100 text-purple-600", colSpan: "col-span-2" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-4xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-dark flex items-center justify-center">
        <LayoutDashboard className="mr-2" />
        {t('dashboard.welcome', { name: profile.name })}
      </h1>
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={card.to}
              className={`glass-card flex flex-col items-center justify-center text-center ${card.color} hover:bg-opacity-80 transition-all ${card.colSpan || ''}`}
            >
              <card.icon className="w-12 h-12 mb-2" />
              <span className="font-medium">{card.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
      {profile.profile?.isPregnant && (
        <Link to="/pregnancy-manager" className="glass-card block text-center py-4 mt-8 bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors">
          <Baby className="w-8 h-8 mx-auto mb-2" />
          {t('dashboard.pregnancyManager')}
        </Link>
      )}
      {(profile.profile?.conditions?.length > 0 || profile.profile?.interestedIn?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 glass-card"
        >
          <h3 className="font-bold text-lg mb-2 flex items-center">
            <AlertCircle className="mr-2 text-red-500" />
            {t('dashboard.healthStatus')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.profile.conditions?.map((c) => (
              <span
                key={c}
                className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {c.toUpperCase()} {t('dashboard.ihave')}
              </span>
            ))}
            {profile.profile.interestedIn?.map((c) => (
              <span
                key={c}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {c.toUpperCase()} {t('dashboard.info')}
              </span>
            ))}
          </div>
        </motion.div>
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
export default Dashboard;