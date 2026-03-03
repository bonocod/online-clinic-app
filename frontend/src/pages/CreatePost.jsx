//# FILE: frontend/src/pages/CreatePost.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';

const CreatePost = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isGroup = location.pathname.includes('/group/');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [file, setFile] = useState(null);
  const [urgency, setUrgency] = useState('general');
  const [anonymous, setAnonymous] = useState(false);
  const [type, setType] = useState('general'); // question or general
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('body', body);
    if (isGroup) {
      formData.append('groupId', id);
    } else {
      formData.append('categoryId', id);
    }
    formData.append('urgency', urgency);
    formData.append('anonymous', anonymous);
    formData.append('type', type);
    if (file) formData.append('media', file);

    try {
      const res = await api.post('/forum/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (isGroup) {
        navigate(`/group/${id}`);
      } else {
        navigate(`/category/${id}`);
      }
    } catch (err) {
      setError('Failed to create post');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2 border rounded">
          <option value="general">Discussion</option>
          <option value="question">Question</option>
        </select>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded" required />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Content" className="w-full p-2 border rounded h-32" required />
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <select value={urgency} onChange={e => setUrgency(e.target.value)} className="w-full p-2 border rounded">
          <option value="general">General</option>
          <option value="advice">Advice</option>
          <option value="urgent">Urgent</option>
        </select>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
          Post anonymously
        </label>
        <button type="submit" className="btn-primary">Submit</button>
      </form>
    </motion.div>
  );
};

export default CreatePost;