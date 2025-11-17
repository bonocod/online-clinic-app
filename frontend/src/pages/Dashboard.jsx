import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Dashboard = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setProfile(res.data);
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

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {t('dashboard.welcome', { name: profile.name })}
      </h1>

      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/symptom-checker"
          className="bg-blue-600 text-white p-6 rounded-xl text-center font-medium hover:bg-blue-700 transition shadow-md"
        >
          {t('dashboard.symptomChecker')}
        </Link>
        <Link
          to="/diseases"
          className="bg-green-600 text-white p-6 rounded-xl text-center font-medium hover:bg-green-700 transition shadow-md"
        >
          {t('dashboard.diseases')}
        </Link>
        <Link
          to="/health-tracker"
          className="bg-yellow-600 text-white p-6 rounded-xl text-center font-medium hover:bg-yellow-700 transition shadow-md"
        >
          {t('dashboard.healthTracker')}
        </Link>
        <Link
          to="/special-cases"
          className="bg-indigo-600 text-white p-6 rounded-xl text-center font-medium hover:bg-indigo-700 transition shadow-md"
        >
          {t('dashboard.specialCases')}
        </Link>
        <Link
          to="/profile"
          className="bg-purple-600 text-white p-6 rounded-xl text-center font-medium hover:bg-purple-700 transition shadow-md col-span-2"
        >
          {t('dashboard.profile')}
        </Link>
      </div>

      {(profile.profile?.conditions?.length > 0 || profile.profile?.interestedIn?.length > 0) && (
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-bold text-lg mb-2">{t('dashboard.healthStatus')}</h3>
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
        </div>
      )}
    </div>
  );
};

export default Dashboard;
