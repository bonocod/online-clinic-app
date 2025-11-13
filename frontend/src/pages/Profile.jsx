import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    isPregnant: false,
    preferredLanguage: localStorage.getItem('lang') || 'en'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setProfile({
          age: res.data.profile?.age || '',
          gender: res.data.profile?.gender || '',
          height: res.data.profile?.height || '',
          weight: res.data.profile?.weight || '',
          isPregnant: res.data.profile?.isPregnant || false,
          preferredLanguage: res.data.profile?.preferredLanguage || localStorage.getItem('lang') || 'en'
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.put('/users/profile', profile);
      localStorage.setItem('lang', profile.preferredLanguage);  // Update language immediately
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.msg || 'Update failed');
    }
  };

  if (loading) return <div className="p-4">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl mb-4">My Profile</h1>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Age</label>
          <input
            type="number"
            name="age"
            value={profile.age}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block">Gender</label>
          <select
            name="gender"
            value={profile.gender}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block">Height (cm)</label>
          <input
            type="number"
            name="height"
            value={profile.height}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block">Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={profile.weight}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPregnant"
              checked={profile.isPregnant}
              onChange={handleChange}
            />
            Pregnant
          </label>
        </div>

        <div>
          <label className="block">Preferred Language</label>
          <select
            name="preferredLanguage"
            value={profile.preferredLanguage}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="en">English</option>
            <option value="rw">Kinyarwanda</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;