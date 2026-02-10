import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
const ProfileSetup = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    isPregnant: false,
    conditions: ''
  });
  const navigate = useNavigate();
  const questions = [
    { key: 'age', type: 'number', placeholder: 'e.g., 28' },
    { key: 'gender', type: 'select', options: ['male', 'female', 'other'] },
    { key: 'height', type: 'number', placeholder: 'e.g., 170' },
    { key: 'weight', type: 'number', placeholder: 'e.g., 65' },
    { key: 'pregnant', type: 'checkbox', condition: profile.gender === 'female' },
    { key: 'conditions', type: 'text', placeholder: 'e.g., diabetes, hypertension' }
  ].filter(q => !q.condition || q.condition);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const nextStep = () => {
    if (step < questions.length - 1) setStep(step + 1);
    else saveProfile();
  };
  const skipStep = () => nextStep();
  const saveProfile = async () => {
    try {
      const updates = {
        age: profile.age || null,
        gender: profile.gender,
        height: profile.height || null,
        weight: profile.weight || null,
        isPregnant: profile.isPregnant,
        conditions: profile.conditions ? profile.conditions.split(',').map(c => c.trim()) : []
      };
      await api.put('/users/profile', updates);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save profile');
    }
  };
  const currentQ = questions[step];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto mt-20 p-4 glass-card"
    >
      <h1 className="text-2xl font-bold mb-6 text-center">{t('profileSetup.title')}</h1>
      <p className="mb-4">{t(`profileSetup.questions.${currentQ.key}`)}</p>
      {currentQ.type === 'select' ? (
        <select name={currentQ.key} value={profile[currentQ.key]} onChange={handleChange} className="input-field">
          <option value="">{t('profile.select')}</option>
          {currentQ.options.map(opt => <option key={opt} value={opt}>{t(`profile.${opt}`)}</option>)}
        </select>
      ) : currentQ.type === 'checkbox' ? (
        <div className="flex items-center gap-2">
          <input type="checkbox" name={currentQ.key} checked={profile[currentQ.key]} onChange={handleChange} className="w-5 h-5 accent-primary" />
          <label>{t('profile.pregnant')}</label>
        </div>
      ) : (
        <input
          type={currentQ.type}
          name={currentQ.key}
          value={profile[currentQ.key]}
          onChange={handleChange}
          placeholder={currentQ.placeholder}
          className="input-field"
        />
      )}
      <div className="flex gap-4 mt-6">
        <button onClick={skipStep} className="btn-primary flex-1 bg-gray-500 hover:bg-gray-600">
          {t('profileSetup.skip')}
        </button>
        <button onClick={nextStep} className="btn-primary flex-1">
          {step === questions.length - 1 ? t('profileSetup.finish') : t('profileSetup.next')}
        </button>
      </div>
    </motion.div>
  );
};
export default ProfileSetup;