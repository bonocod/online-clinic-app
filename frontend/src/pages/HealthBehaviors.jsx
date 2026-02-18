import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2, Search, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import BehaviorCard from '../components/BehaviorCard';

const HealthBehaviors = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('good');
  const [behaviors, setBehaviors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBehaviors = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/behaviors?type=${activeTab}`);
        setBehaviors(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBehaviors();
  }, [activeTab]);

  // Filter behaviors by search
  const filteredBehaviors = useMemo(() => {
    if (!searchTerm) return behaviors;
    const term = searchTerm.toLowerCase();
    return behaviors.filter(b =>
      b.title[i18n.language]?.toLowerCase().includes(term) ||
      b.description[i18n.language]?.toLowerCase().includes(term)
    );
  }, [behaviors, searchTerm, i18n.language]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-6xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-8 text-center text-dark">
        {t('healthBehaviors.title')}
      </h1>

      {/* Search Bar */}
      <div className="relative mb-8 max-w-md mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder={t('healthBehaviors.searchPlaceholder') || "Search behaviors..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-12 py-3"
        />
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-10">
        <div className="bg-white rounded-full p-1 shadow-md flex">
          <button
            onClick={() => { setActiveTab('good'); setSearchTerm(''); }}
            disabled={isLoading}
            className={`px-8 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
              activeTab === 'good' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ✅ {t('healthBehaviors.recommended')}
          </button>
          <button
            onClick={() => { setActiveTab('bad'); setSearchTerm(''); }}
            disabled={isLoading}
            className={`px-8 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
              activeTab === 'bad' ? 'bg-red-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ⛔ {t('healthBehaviors.restricted')}
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-gray-500">{t('healthBehaviors.loading')}</p>
        </div>
      ) : (
        <>
          {filteredBehaviors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-6xl mb-4">🤔</p>
              <p className="text-gray-500 text-lg">No behaviors found matching your search.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBehaviors.map((behavior) => (
                <BehaviorCard
                  key={behavior._id}
                  behavior={behavior}
                  language={i18n.language}
                />
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default HealthBehaviors;