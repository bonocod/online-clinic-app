// FILE: frontend/src/pages/CreateDiscussion.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';

const CreateDiscussion = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [closeAt, setCloseAt] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/forum/discussions', { categoryId: id, title, body, closeAt });
      navigate(`/category/${id}`);
    } catch (err) {
      setError('Failed to create discussion');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      <h1 className="text-3xl font-bold mb-6">Create Discussion</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="input-field" required />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Description" className="input-field h-32" required />
        <input type="datetime-local" value={closeAt} onChange={e => setCloseAt(e.target.value)} className="input-field" />
        <button type="submit" className="btn-primary">Submit</button>
      </form>
    </motion.div>
  );
};

export default CreateDiscussion;