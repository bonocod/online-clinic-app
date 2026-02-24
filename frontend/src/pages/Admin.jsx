// frontend/src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Upload, Film, AlertCircle } from 'lucide-react';

const Admin = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        setError('Failed to load categories');
      }
    };
    fetchCategories();
  }, [isAdmin, navigate]);

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!videoFile) {
      setError('Please select a video file');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('video', videoFile);

    try {
      await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Video uploaded successfully!');
      setTitle('');
      setDescription('');
      setCategory('');
      setVideoFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-2xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-8 text-center text-dark flex items-center justify-center">
        <Film className="mr-2" />
        Admin - Upload Video
      </h1>

      {error && <p className="text-red-500 mb-4 flex items-center"><AlertCircle className="mr-2" />{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="glass-card space-y-6">
        <input
          type="text"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          required
        />
        
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field min-h-[100px]"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-field"
          required
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>

        <div className="relative">
          <Upload className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={20} />
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="input-field pl-10"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </motion.div>
  );
};

export default Admin;