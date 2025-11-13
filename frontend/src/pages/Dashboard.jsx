import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setProfile(res.data);
      } catch (err) {
        setError('Error fetching profile');
        console.error('Profile error:', err.response);  // For debugging
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}
      {profile ? (
        <p>Welcome, {profile.name}! ({profile.email})</p>
      ) : (
        <p>Loading...</p>
      )}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Link to="/symptom-checker" className="bg-blue-500 text-white p-4 rounded">Symptom Checker</Link>
        <Link to="/diseases" className="bg-green-500 text-white p-4 rounded">Diseases</Link>
        <Link to="/health-tracker" className="bg-yellow-500 text-white p-4 rounded">Health Tracker</Link>
        <Link to="/profile" className="bg-purple-500 text-white p-4 rounded">Profile</Link>
      </div>
    </div>
  );
};

export default Dashboard;