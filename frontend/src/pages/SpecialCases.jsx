import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import SpecialCaseModal from '../components/SpecialCaseModal';
import { ArrowLeft, Loader2, AlertCircle, X, Info } from 'lucide-react';

const SpecialCases = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [infoData, setInfoData] = useState(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoError, setInfoError] = useState('');
  const navigate = useNavigate();

  const specialCases = [
    { id: 'pregnancy', label: t('specialCases.pregnancy'), icon: '🤰' },
    { id: 'mental-health', label: t('specialCases.mentalHealth'), icon: '🧠' },
    { id: 'hiv', label: t('specialCases.hiv'), icon: '🦠' },
    { id: 'cancer', label: t('specialCases.cancer'), icon: '🧫' },
    { id: 'diabetes', label: t('specialCases.diabetes'), icon: '💉' },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

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

  const openModal = (caseId) => {
    setSelectedCase(caseId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCase(null);
  };

  const saveCondition = async (type) => {
    try {
      const updates = { ...profile.profile };
      if (type === 'has') {
        if (!updates.conditions) updates.conditions = [];
        if (!updates.conditions.includes(selectedCase)) {
          updates.conditions.push(selectedCase);
        }
        if (selectedCase === 'pregnancy') updates.isPregnant = true;
      } else if (type === 'info') {
        if (!updates.interestedIn) updates.interestedIn = [];
        if (!updates.interestedIn.includes(selectedCase)) {
          updates.interestedIn.push(selectedCase);
        }
      }
      await api.put('/users/profile', updates);
      await fetchProfile();
      closeModal();
      if (type === 'info') {
        fetchInfo(selectedCase);
      }
    } catch (err) {
      setError('Failed to save condition');
    }
  };

  const fetchInfo = async (caseId) => {
    setInfoLoading(true);
    setInfoError('');
    setInfoData(null);
    try {
      const res = await api.get(`/special-cases/${caseId}`);
      setInfoData(res.data);
    } catch (err) {
      setInfoError(err.response?.data?.msg || 'Failed to load info');
    } finally {
      setInfoLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-red-500 flex items-center justify-center"><AlertCircle className="mr-2" />{error}</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-4xl mx-auto"
    >
      <button onClick={() => navigate('/dashboard')} className="flex items-center mb-6 text-primary hover:text-blue-700 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" />
        {t('specialCases.back')}
      </button>
      <h1 className="text-3xl font-bold mb-6 text-center text-dark">{t('specialCases.title')}</h1>
      {infoLoading && (
        <div className="glass-card mb-6 flex items-center justify-center">
          <Loader2 className="animate-spin mr-2" />
          {t('specialCases.loadingInfo')}
        </div>
      )}
      {infoError && (
        <div className="glass-card mb-6 text-red-500 flex items-center">
          <AlertCircle className="mr-2" />
          {t('specialCases.errorLoad')}
        </div>
      )}
      {infoData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-dark">{infoData.title}</h2>
            <button onClick={() => setInfoData(null)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          {infoData.sections.map((sec, i) => (
            <div key={i} className="mb-4">
              <h3 className="font-bold text-secondary flex items-center"><Info className="mr-2" size={18} />{sec.title}</h3>
              <p className="text-gray-700 mt-1">{sec.content}</p>
            </div>
          ))}
        </motion.div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {specialCases.map((sc, i) => (
          <motion.button
            key={sc.id}
            onClick={() => openModal(sc.id)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card text-center py-6"
          >
            <span className="text-4xl mb-2 block">{sc.icon}</span>
            <p className="font-medium text-dark">{sc.label}</p>
          </motion.button>
        ))}
      </div>
      {(profile.profile?.conditions?.length > 0 || profile.profile?.interestedIn?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 glass-card"
        >
          <h2 className="text-xl font-bold mb-4 text-secondary">{t('specialCases.myStatus')}</h2>
          <div className="flex flex-wrap gap-2">
            {profile.profile.conditions?.map((c) => (
              <span key={c} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                {c.toUpperCase()} {t('specialCases.ihave')}
              </span>
            ))}
            {profile.profile.interestedIn?.map((c) => (
              <span key={c} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                {c.toUpperCase()} {t('specialCases.info')}
              </span>
            ))}
          </div>
        </motion.div>
      )}
      <SpecialCaseModal
        isOpen={modalOpen}
        onClose={closeModal}
        caseName={selectedCase}
        onSelect={saveCondition}
      />
    </motion.div>
  );
};

export default SpecialCases;