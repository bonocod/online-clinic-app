import React, { useState } from 'react';
import api from '../services/api';

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const lang = localStorage.getItem('lang') || 'en'; // 👈 get current language

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/diseases/symptoms', { 
        symptoms: symptoms.split(',').map(s => s.trim()) 
      });
      setResults(res.data.diseases);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Symptom Checker</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter symptoms (comma separated, e.g., fever, cough)"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Check Symptoms
        </button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {results && (
        <div className="mt-4">
          <h2 className="text-xl">Possible Diseases:</h2>
          {results.map((d, i) => (
            <div key={i} className="border p-2 mt-2">
              <h3 className="font-bold">
                {/* Safely pick the right translation */}
                {typeof d.name === 'object' ? d.name[lang] : d.name}
              </h3>
              <p>
                Causes: {typeof d.causes === 'object' ? d.causes[lang] : d.causes}
              </p>
              <p>
                Symptoms:{' '}
                {Array.isArray(d.symptoms)
                  ? d.symptoms.join(', ')
                  : typeof d.symptoms === 'object'
                  ? (d.symptoms[lang] || []).join(', ')
                  : d.symptoms}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;
