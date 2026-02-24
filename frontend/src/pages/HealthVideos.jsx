// frontend/src/pages/HealthVideos.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Film, Play, X } from 'lucide-react';

const BASE_URL = 'http://localhost:5000/api';

const HealthVideos = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [videosByCategory, setVideosByCategory] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const catRes = await axios.get(`${BASE_URL}/categories`);
        setCategories(catRes.data);
        
        const videoData = {};
        for (let cat of catRes.data) {
          const videoRes = await axios.get(`${BASE_URL}/videos/category/${cat._id}`);
          videoData[cat._id] = videoRes.data.map(video => ({
            ...video,
            thumbnailUrl: video.thumbnailUrl || getDefaultThumbnail(video.videoUrl)
          }));
        }
        setVideosByCategory(videoData);
      } catch (err) {
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Fallback thumbnail approach: extract from video URL if thumbnail missing
  const getDefaultThumbnail = (videoUrl) => {
    // Assuming Cloudinary URL, replace .mp4 with .jpg for thumbnail
    if (videoUrl.includes('cloudinary')) {
      return videoUrl.replace(/\.[^/.]+$/, ".jpg"); // Replace extension with .jpg
    }
    return 'https://via.placeholder.com/320x180?text=Video';
  };

  if (loading) return <div className="text-center py-10 flex items-center justify-center"><Film className="animate-spin mr-2" />Loading videos...</div>;
  if (error) return <p className="text-red-500 text-center py-10">{error}</p>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-6xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-8 text-center text-dark flex items-center justify-center">
        <Film className="mr-2" />
        Health Videos
      </h1>
      
      {categories.map((category) => (
        <div key={category._id} className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-secondary">{category.name}</h2>
          <p className="text-gray-600 mb-6">{category.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videosByCategory[category._id]?.map((video) => (
              <motion.div
                key={video._id}
                whileHover={{ scale: 1.05 }}
                className="glass-card cursor-pointer overflow-hidden relative"
                onClick={() => setSelectedVideo(video)}
              >
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title}
                  className="w-full aspect-video object-cover"
                  onError={(e) => {
                    e.target.src = getDefaultThumbnail(video.videoUrl);
                  }}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-all hover:bg-black/40">
                  <Play className="w-16 h-16 text-white opacity-80 hover:opacity-100 transition-opacity" fill="white" />
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2 line-clamp-1">{video.title}</h4>
                  <p className="text-gray-600 text-sm line-clamp-2">{video.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-white/80 rounded-full p-1 hover:bg-white transition-all"
            >
              <X size={24} />
            </button>
            
            <video
              src={selectedVideo.videoUrl}
              controls
              autoPlay
              className="w-full rounded-lg mb-6 max-h-[60vh] shadow-md"
            />
            
            <h3 className="text-2xl font-bold mb-2 text-dark">{selectedVideo.title}</h3>
            <p className="text-gray-600">{selectedVideo.description}</p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HealthVideos;