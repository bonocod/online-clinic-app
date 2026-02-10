import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import { User, Calendar, Ruler, Scale, Activity, Globe, Save, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    medicalHistory: [],
    isPregnant: false,
    preferredLanguage: localStorage.getItem('lang') || 'en',
    conditions: [],
    interestedIn: []
  });
  const [newHistory, setNewHistory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        const p = res.data.profile || {};
        setProfile({
          age: p.age || '',
          gender: p.gender || '',
          height: p.height || '',
          weight: p.weight || '',
          medicalHistory: p.medicalHistory || [],
          isPregnant: p.isPregnant || false,
          preferredLanguage: p.preferredLanguage || localStorage.getItem('lang') || 'en',
          conditions: p.conditions || [],
          interestedIn: p.interestedIn || []
        });
      } catch (err) {
        setError('Error loading profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addMedicalHistory = () => {
    if (newHistory.trim()) {
      setProfile(prev => ({
        ...prev,
        medicalHistory: [...prev.medicalHistory, newHistory.trim()]
      }));
      setNewHistory('');
    }
  };

  const removeMedicalHistory = (index) => {
    setProfile(prev => ({
      ...prev,
      medicalHistory: prev.medicalHistory.filter((_, i) => i !== index)
    }));
  };

  const calculateBMI = () => {
    if (profile.height && profile.weight) {
      const heightM = profile.height / 100;
      const bmi = (profile.weight / (heightM * heightM)).toFixed(1);
      return bmi;
    }
    return null;
  };

  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-yellow-600 bg-yellow-100' };
    if (bmi < 25) return { text: 'Normal', color: 'text-green-600 bg-green-100' };
    if (bmi < 30) return { text: 'Overweight', color: 'text-orange-600 bg-orange-100' };
    return { text: 'Obese', color: 'text-red-600 bg-red-100' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (profile.age && (profile.age < 1 || profile.age > 120)) {
      setError(t('profile.errorAge'));
      return;
    }
    if (profile.height && (profile.height < 100 || profile.height > 250)) {
      setError(t('profile.errorHeight'));
      return;
    }
    if (profile.weight && (profile.weight < 20 || profile.weight > 300)) {
      setError(t('profile.errorWeight'));
      return;
    }
    try {
      await api.put('/users/profile', {
        age: profile.age || null,
        gender: profile.gender,
        height: profile.height || null,
        weight: profile.weight || null,
        medicalHistory: profile.medicalHistory,
        isPregnant: profile.isPregnant,
        preferredLanguage: profile.preferredLanguage
      });
      localStorage.setItem('lang', profile.preferredLanguage);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.msg || 'Update failed');
    }
  };

  if (loading) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-center">{t('profile.loading')}</motion.div>;

  const bmi = calculateBMI();
  const bmiStatus = bmi ? getBMIStatus(bmi) : null;
  const bmiStatusKey = bmiStatus ? `profile.bmi${bmiStatus.text}` : '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto p-4"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-dark flex items-center justify-center">
        <User className="mr-2" />
        {t('profile.title')}
      </h1>
      {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 mb-4 text-center flex items-center justify-center"><AlertCircle className="mr-2" />{error}</motion.p>}
      {success && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-500 mb-4 text-center">{success}</motion.p>}
      <form onSubmit={handleSubmit} className="glass-card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
            <input
              type="number"
              name="age"
              value={profile.age}
              onChange={handleChange}
              placeholder="e.g., 28"
              className="input-field pl-10"
            />
            <label className="absolute -top-2 left-4 bg-white px-1 text-sm text-gray-600">{t('profile.age')}</label>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('profile.gender')}</label>
            <select
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">{t('profile.select')}</option>
              <option value="male">{t('profile.male')}</option>
              <option value="female">{t('profile.female')}</option>
              <option value="other">{t('profile.other')}</option>
            </select>
          </div>
          <div className="relative">
            <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
            <input
              type="number"
              name="height"
              value={profile.height}
              onChange={handleChange}
              placeholder="e.g., 170"
              className="input-field pl-10"
            />
            <label className="absolute -top-2 left-4 bg-white px-1 text-sm text-gray-600">{t('profile.height')}</label>
          </div>
          <div className="relative">
            <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
            <input
              type="number"
              name="weight"
              value={profile.weight}
              onChange={handleChange}
              placeholder="e.g., 65"
              className="input-field pl-10"
            />
            <label className="absolute -top-2 left-4 bg-white px-1 text-sm text-gray-600">{t('profile.weight')}</label>
          </div>
        </div>
        {bmi && (
          <div className="glass-card p-4 text-center">
            <p className="text-lg font-bold text-dark">{t('profile.bmi', { bmi })}</p>
            <p className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${bmiStatus.color}`}>
              {t(bmiStatusKey)}
            </p>
          </div>
        )}
        {profile.gender === 'female' && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPregnant"
              checked={profile.isPregnant}
              onChange={handleChange}
              className="w-5 h-5 accent-primary"
            />
            <label className="text-gray-700">{t('profile.pregnant')}</label>
          </div>
        )}
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('profile.medicalHistory')}</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
              <input
                type="text"
                value={newHistory}
                onChange={(e) => setNewHistory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedicalHistory())}
                placeholder="e.g., Asthma"
                className="input-field pl-10"
              />
            </div>
            <button
              type="button"
              onClick={addMedicalHistory}
              className="btn-primary px-4"
            >
              {t('profile.addButton')}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.medicalHistory.map((item, i) => (
              <span
                key={i}
                className="bg-neutral px-3 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeMedicalHistory(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('profile.preferredLanguage')}</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
            <select
              name="preferredLanguage"
              value={profile.preferredLanguage}
              onChange={handleChange}
              className="input-field pl-10"
            >
              <option value="en">English</option>
              <option value="rw">Kinyarwanda</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center"
        >
          <Save className="mr-2" size={18} />
          {t('profile.saveButton')}
        </button>
      </form>
    </motion.div>
  );
};

export default Profile;