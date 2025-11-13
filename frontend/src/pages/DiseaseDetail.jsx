import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const DiseaseDetail = () => {
  const { id } = useParams();
  const [disease, setDisease] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const lang = localStorage.getItem('lang') || 'en';

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
    return typeof field === 'object' ? field[lang] || field.en : field;
  };

  if (loading) return <div className="p-4">Loading disease...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!disease) return <div className="p-4">No disease found</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">{getTranslated(disease.name)}</h1>
      <div className="space-y-4">
        <section>
          <h2 className="text-xl font-bold">Symptoms</h2>
          <p>{disease.symptoms.join(', ')}</p>
        </section>
        <section>
          <h2 className="text-xl font-bold">Causes</h2>
          <p>{getTranslated(disease.causes)}</p>
        </section>
        <section>
          <h2 className="text-xl font-bold">Effects</h2>
          <p>{getTranslated(disease.effects)}</p>
        </section>
        <section>
          <h2 className="text-xl font-bold">Prevention</h2>
          <p>{getTranslated(disease.prevention)}</p>
        </section>
        <section>
          <h2 className="text-xl font-bold">Behavior Guidelines</h2>
          <p>{getTranslated(disease.behaviorGuidelines)}</p>
        </section>
        <section>
          <h2 className="text-xl font-bold">Treatment</h2>
          <p>{getTranslated(disease.treatment)}</p>
        </section>
      </div>
    </div>
  );
};

export default DiseaseDetail;