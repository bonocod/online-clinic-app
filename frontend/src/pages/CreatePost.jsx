//frontend/src/pages/CreatePost.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Upload, Eye } from 'lucide-react';
const CreatePost = () => {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [fontSize, setFontSize] = useState(20);
  const [color, setColor] = useState('#000000');
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [error, setError] = useState('');
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('media', media);
    formData.append('groupId', groupId);
    formData.append('caption', caption);
    formData.append('captionStyle', JSON.stringify({ fontSize, color, position }));
    try {
      await api.post('/forum/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/group/${groupId}`);
    } catch (err) {
      setError('Failed to create post');
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-md mx-auto glass-card"
    >
      <h1 className="text-2xl font-bold mb-6 text-center">{t('forum.createPost')}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
          <input type="file" accept="image/*,video/*" onChange={handleMediaChange} className="input-field pl-10" required />
        </div>
        {previewUrl && (
          <div className="relative mb-4">
            {media.type.startsWith('image/') ? (
              <img src={previewUrl} alt="preview" className="w-full rounded-lg" />
            ) : (
              <video src={previewUrl} controls className="w-full rounded-lg" />
            )}
            {caption && (
              <div
                style={{
                  position: 'absolute',
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  fontSize: `${fontSize}px`,
                  color,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {caption}
              </div>
            )}
          </div>
        )}
        <input
          type="text"
          placeholder="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="input-field"
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Font Size</label>
            <input type="number" value={fontSize} onChange={(e) => setFontSize(e.target.value)} min="10" max="50" className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Color</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="input-field p-1 h-10" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">X (%)</label>
            <input type="number" value={position.x} onChange={(e) => setPosition(prev => ({ ...prev, x: e.target.value }))} min="0" max="100" className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Y (%)</label>
            <input type="number" value={position.y} onChange={(e) => setPosition(prev => ({ ...prev, y: e.target.value }))} min="0" max="100" className="input-field" />
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="btn-primary w-full flex items-center justify-center">
          <Eye className="mr-2" /> Submit Post
        </button>
      </form>
    </motion.div>
  );
};
export default CreatePost;