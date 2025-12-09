import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import { User, Mail, Lock } from 'lucide-react';
const Register = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/profile-setup');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-20 p-4"
    >
      <h1 className="text-3xl font-bold mb-8 text-center text-dark">{t('register.title')}</h1>
      <form onSubmit={handleSubmit} className="glass-card space-y-6">
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
          <input
            type="text"
            placeholder={t('register.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
          <input
            type="email"
            placeholder={t('register.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
          <input
            type="password"
            placeholder={t('register.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button type="submit" className="btn-primary w-full">
          {t('register.button')}
        </button>
      </form>
    </motion.div>
  );
};
export default Register;