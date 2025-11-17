import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

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

  if (loading) return <div className="p-4">Loading disease...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!disease) return <div className="p-4">No disease found</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">{getTranslated(disease.name)}</h1>
      <div className="space-y-4">
        <section>
          <h2 className="text-xl font-bold">{t('diseaseDetail.symptoms')}</h2>
          <p>{Array.isArray(disease.symptoms) ? disease.symptoms.join(', ') : disease.symptoms}</p>
        </section>
        <section>
          <h2 className="text-xl font-bold">{t('diseaseDetail.causes')}</h2>
          <p>{getTranslated(disease.causes)}</p>
        </section>
        <section>
          <h2 className="text-xl font-bold">{t('diseaseDetail.effects')}</h2>
          <p>{getTranslated(disease.effects)}</p>
        </section>
        <section>
          <h2 className="text-xl font-bold">{t('diseaseDetail.prevention')}</h2>
          <p>{getTranslated(disease.prevention)}</p>
        </section>
        <section>
          <h2 className="text-xl font-bold">{t('diseaseDetail.behaviorGuidelines')}</h2>
          <p>{getTranslated(disease.behaviorGuidelines)}</p>
        </section>
        <section>
          <h2 className="text-xl font-bold">{t('diseaseDetail.treatment')}</h2>
          <p>{getTranslated(disease.treatment)}</p>
        </section>
      </div>
    </div>
  );
};

export default DiseaseDetail;
