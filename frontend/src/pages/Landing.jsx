import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Landing = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4 bg-blue-50">
      <h1 className="text-4xl font-bold mb-4">{t('landing.title')}</h1>
      <p className="text-xl mb-8">{t('landing.subtitle')}</p>
      <p className="text-lg mb-8">{t('landing.description')}</p>
      <div className="space-x-4">
        <Link to="/login" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
          {t('landing.cta1')}
        </Link>
        <Link to="/register" className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700">
          {t('landing.cta2')}
        </Link>
      </div>
    </div>
  );
};

export default Landing;
