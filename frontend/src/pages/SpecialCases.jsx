// frontend/src/pages/SpecialCases.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SpecialCaseModal from '../components/SpecialCaseModal';

const SpecialCases = () => {
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
    { id: 'pregnancy', label: 'Pregnancy', icon: '🤰' }, // Use emoji or replace with SVG icon
    { id: 'mental-health', label: 'Mental Health', icon: '🧠' },
    { id: 'hiv', label: 'HIV', icon: '🦠' },
    { id: 'cancer', label: 'Cancer', icon: '🧫' },
    { id: 'diabetes', label: 'Diabetes', icon: '💉' },
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
      await fetchProfile(); // Refresh profile after save
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

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      {/* Back Button */}
      <button onClick={() => navigate('/dashboard')} className="flex items-center mb-6 text-blue-600 hover:underline">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      <h1 className="text-2xl mb-6">Special Cases</h1>

      {/* Info Card */}
      {infoLoading && <div className="p-4 bg-gray-100 rounded mb-4">Loading information...</div>}

      {infoError && <div className="p-4 text-red-500 bg-red-100 rounded mb-4">{infoError}</div>}

      {infoData && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="text-xl mb-2">{infoData.title}</h2>
          {infoData.sections.map((sec, i) => (
            <div key={i} className="mb-2">
              <h3 className="font-bold">{sec.title}</h3>
              <p>{sec.content}</p>
            </div>
          ))}
          <button onClick={() => setInfoData(null)} className="text-blue-600 hover:underline">
            Close
          </button>
        </div>
      )}

      {/* Grid of Cases */}
      <div className="grid grid-cols-2 gap-4">
        {specialCases.map((sc) => (
          <button
            key={sc.id}
            onClick={() => openModal(sc.id)}
            className="bg-gray-100 p-4 rounded text-center"
          >
            <span className="text-4xl">{sc.icon}</span>
            <p>{sc.label}</p>
          </button>
        ))}
      </div>

      {/* Badges */}
      {(profile.profile?.conditions?.length > 0 || profile.profile?.interestedIn?.length > 0) && (
        <div className="mt-6">
          <h2 className="text-xl mb-2">My Status</h2>
          <div className="flex flex-wrap gap-2">
            {profile.profile.conditions?.map((c) => (
              <span key={c} className="bg-red-200 p-2 rounded">{c.toUpperCase()} (I have)</span>
            ))}
            {profile.profile.interestedIn?.map((c) => (
              <span key={c} className="bg-blue-200 p-2 rounded">{c.toUpperCase()} (Info)</span>
            ))}
          </div>
        </div>
      )}

      <SpecialCaseModal
        isOpen={modalOpen}
        onClose={closeModal}
        caseName={specialCases.find(sc => sc.id === selectedCase)?.label || ''}
        onSelect={saveCondition}
      />
    </div>
  );
};

export default SpecialCases;