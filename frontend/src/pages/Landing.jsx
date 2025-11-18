import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';

const Landing = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl"
      >
        <HeartPulse className="w-20 h-20 text-primary mx-auto mb-6 animate-pulse" />
        <h1 className="text-5xl font-bold mb-4 text-dark">{t('landing.title')}</h1>
        <p className="text-2xl mb-6 text-gray-700">{t('landing.subtitle')}</p>
        <p className="text-lg mb-10 text-gray-600">{t('landing.description')}</p>
        <div className="space-x-6">
          <Link to="/login" className="btn-primary inline-block">
            {t('landing.cta1')}
          </Link>
          <Link to="/register" className="bg-accent text-white py-3 px-6 rounded-full font-semibold shadow-md hover:bg-green-600 transition-all duration-300 transform hover:-translate-y-1 inline-block">
            {t('landing.cta2')}
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Landing;