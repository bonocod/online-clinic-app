import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Users, AlertCircle } from 'lucide-react';

const Forum = () => {
  const { t } = useTranslation();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get('/forum/groups');
        setGroups(res.data);
      } catch (err) {
        setError(t('forum.errorLoad'));
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [t]);

  const handleJoin = async (groupId) => {
    try {
      await api.post(`/forum/groups/${groupId}/join`);
      alert(t('forum.joinSuccess'));
    } catch (err) {
      alert(t('forum.joinFailed'));
    }
  };

  if (loading) return <p className="text-center">{t('forum.loading')}</p>;
  if (error) return <p className="text-red-500 text-center flex items-center"><AlertCircle className="mr-2" />{error}</p>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-4xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-dark flex items-center justify-center">
        <Users className="mr-2" />
        {t('forum.title')}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groups.map((group) => (
          <motion.div
            key={group._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 text-center"
          >
            <h2 className="text-xl font-bold mb-2">{group.name}</h2>
            <p className="text-gray-600 mb-4">{group.description}</p>
            <button
              onClick={() => handleJoin(group._id)}
              className="btn-primary inline-block mb-4"
            >
              {t('forum.joinGroup')}
            </button>
            <Link to={`/group/${group._id}`} className="block text-primary font-medium">
              {t('forum.viewGroup')}
            </Link>
          </motion.div>
        ))}
      </div>
      {groups.length === 0 && <p className="text-center text-gray-600 mt-8">{t('forum.noGroups')}</p>}
    </motion.div>
  );
};

export default Forum;