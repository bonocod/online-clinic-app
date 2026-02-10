import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import DiseaseCard from '../components/DiseaseCard';
import { Search } from 'lucide-react';

const DiseaseList = () => {
  const { t, i18n } = useTranslation();
  const [diseases, setDiseases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDiseases = async (query = '') => {
    try {
      const endpoint = query ? `/diseases/search?q=${encodeURIComponent(query)}` : '/diseases';
      const res = await api.get(endpoint);
      setDiseases(res.data.diseases || res.data);
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

  if (loading) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-center">Loading diseases...</motion.div>;
  if (error) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-red-500 text-center">{error}</motion.div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-6xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-dark">{t('diseaseList.title')}</h1>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t('diseaseList.searchPlaceholder')}
          value={searchQuery}
          onChange={handleSearch}
          className="input-field pl-10"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {diseases.map((d, i) => (
          <DiseaseCard key={d._id} disease={d} language={i18n.language} />
        ))}
      </div>
      {diseases.length === 0 && <p className="text-center text-gray-600 mt-8">{t('diseaseList.noResults')}</p>}
    </motion.div>
  );
};

export default DiseaseList;