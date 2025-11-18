import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Activity, AlertTriangle, Shield, HeartPulse, Pill, BookOpen } from 'lucide-react';

const DiseaseDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [disease, setDisease] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisease = async () => {
      try {
        const res = await api.get(`/diseases/${id}`);
        setDisease(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error fetching disease');
      } finally {
        setLoading(false);
      }
    };
    fetchDisease();
  }, [id]);

  const getTranslated = (field) => {
    return typeof field === 'object' ? field[i18n.language] || field.en : field;
  };

  const sections = [
    { title: 'symptoms', icon: Activity, content: (d) => Array.isArray(d.symptoms) ? d.symptoms.join(', ') : d.symptoms },
    { title: 'causes', icon: AlertTriangle, content: getTranslated },
    { title: 'effects', icon: HeartPulse, content: getTranslated },
    { title: 'prevention', icon: Shield, content: getTranslated },
    { title: 'behaviorGuidelines', icon: BookOpen, content: getTranslated },
    { title: 'treatment', icon: Pill, content: getTranslated },
  ];

  if (loading) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-center">Loading disease...</motion.div>;
  if (error) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-red-500 text-center">{error}</motion.div>;
  if (!disease) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-center">No disease found</motion.div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-3xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-dark">{getTranslated(disease.name)}</h1>
      <div className="space-y-6">
        {sections.map((sec, i) => (
          <motion.section
            key={sec.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card"
          >
            <h2 className="text-xl font-bold mb-3 flex items-center text-secondary">
              <sec.icon className="mr-2" />
              {t(`diseaseDetail.${sec.title}`)}
            </h2>
            <p className="text-gray-700">{sec.content(disease[sec.title])}</p>
          </motion.section>
        ))}
      </div>
    </motion.div>
  );
};

export default DiseaseDetail;