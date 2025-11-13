import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DiseaseList = () => {
  const [diseases, setDiseases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const lang = localStorage.getItem('lang') || 'en';

  const fetchDiseases = async (query = '') => {
    try {
      const endpoint = query ? `/diseases/search?q=${encodeURIComponent(query)}` : '/diseases';
      const res = await api.get(endpoint);
      setDiseases(res.data.diseases || res.data);  // Handle search vs list
    } catch (err) {
      setError(err.response?.data?.msg || 'Error fetching diseases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiseases(searchQuery);
  }, [searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading) return <div className="p-4">Loading diseases...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Disease List</h1>
      <input
        type="text"
        placeholder="Search (e.g., fever, umusonga)"
        value={searchQuery}
        onChange={handleSearch}
        className="w-full p-2 border rounded mb-4"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {diseases.map((d) => (
          <div key={d._id} className="border p-4 rounded shadow">
            <h3 className="font-bold text-lg">
              {typeof d.name === 'object' ? d.name[lang] || d.name.en : d.name}
            </h3>
            <p className="text-sm text-gray-600">
              Symptoms: {Array.isArray(d.symptoms) ? d.symptoms.join(', ') : d.symptoms}
            </p>
            <Link to={`/diseases/${d._id}`} className="text-blue-500">View Details</Link>
          </div>
        ))}
      </div>
      {diseases.length === 0 && <p>No diseases found.</p>}
    </div>
  );
};

export default DiseaseList;