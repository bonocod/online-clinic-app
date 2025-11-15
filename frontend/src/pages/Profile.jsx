// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Profile = () => {
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
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-yellow-600' };
    if (bmi < 25) return { text: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { text: 'Overweight', color: 'text-orange-600' };
    return { text: 'Obese', color: 'text-red-600' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (profile.age && (profile.age < 1 || profile.age > 120)) {
      setError('Age must be between 1 and 120');
      return;
    }
    if (profile.height && (profile.height < 100 || profile.height > 250)) {
      setError('Height must be between 100 and 250 cm');
      return;
    }
    if (profile.weight && (profile.weight < 20 || profile.weight > 300)) {
      setError('Weight must be between 20 and 300 kg');
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

  if (loading) return <div className="p-4 text-center">Loading profile...</div>;

  const bmi = calculateBMI();
  const bmiStatus = bmi ? getBMIStatus(bmi) : null;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">My Health Profile</h1>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm">

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Age</label>
            <input
              type="number"
              name="age"
              value={profile.age}
              onChange={handleChange}
              placeholder="e.g., 28"
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <div>
            <label className="block font-medium">Gender</label>
            <select
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-medium">Height (cm)</label>
            <input
              type="number"
              name="height"
              value={profile.height}
              onChange={handleChange}
              placeholder="e.g., 170"
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <div>
            <label className="block font-medium">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={profile.weight}
              onChange={handleChange}
              placeholder="e.g., 65"
              className="w-full p-2 border rounded mt-1"
            />
          </div>
        </div>

        {/* BMI Display */}
        {bmi && (
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-lg font-bold">BMI: {bmi}</p>
            <p className={`text-sm font-medium ${bmiStatus.color}`}>
              {bmiStatus.text}
            </p>
          </div>
        )}

        {/* Pregnancy */}
        {profile.gender === 'female' && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPregnant"
              checked={profile.isPregnant}
              onChange={handleChange}
              className="w-5 h-5"
            />
            <label className="font-medium">I am pregnant</label>
          </div>
        )}

        {/* Medical History */}
        <div>
          <label className="block font-medium">Medical History</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={newHistory}
              onChange={(e) => setNewHistory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedicalHistory())}
              placeholder="e.g., Asthma"
              className="flex-1 p-2 border rounded"
            />
            <button
              type="button"
              onClick={addMedicalHistory}
              className="bg-blue-600 text-white px-4 rounded"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.medicalHistory.map((item, i) => (
              <span
                key={i}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1"
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

        {/* Special Cases */}
        {(profile.conditions.length > 0 || profile.interestedIn.length > 0) && (
          <div>
            <label className="block font-medium">My Conditions</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.conditions.map((c) => (
                <span key={c} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                  {c.toUpperCase()} (I have)
                </span>
              ))}
              {profile.interestedIn.map((c) => (
                <span key={c} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {c.toUpperCase()} (Info)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Language */}
        <div>
          <label className="block font-medium">Preferred Language</label>
          <select
            name="preferredLanguage"
            value={profile.preferredLanguage}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          >
            <option value="en">English</option>
            <option value="rw">Kinyarwanda</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;