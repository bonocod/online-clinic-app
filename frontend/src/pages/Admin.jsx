// FILE: frontend/src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { AlertCircle, UserPlus, Flag, Video, Upload, Film } from 'lucide-react';

const Admin = () => {
  const [tab, setTab] = useState('reports');
  const [reportedPosts, setReportedPosts] = useState([]);
  const [newProf, setNewProf] = useState({ name: '', email: '', password: '', role: 'doctor' });
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newVideo, setNewVideo] = useState({ title: '', description: '', category: '', file: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewURL, setPreviewURL] = useState('');

  useEffect(() => {
    if (tab === 'reports') fetchReports();
    else if (tab === 'videos') {
      fetchVideos();
      fetchCategories();
    }
  }, [tab]);

  // ==================== FETCH FUNCTIONS ====================
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reported-posts');
      setReportedPosts(res.data);
    } catch {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/videos');
      setVideos(res.data);
    } catch {
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch {
      setError('Failed to load categories');
    }
  };

  // ==================== PROFESSIONAL CREATION ====================
  const handleCreateProf = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newProf);
      alert('Professional created');
      setNewProf({ name: '', email: '', password: '', role: 'doctor' });
    } catch (err) {
      alert(err.response?.data?.msg || 'Creation failed');
    }
  };

  // ==================== VIDEO MANAGEMENT ====================
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    setNewVideo({ ...newVideo, file });
    setPreviewURL(file ? URL.createObjectURL(file) : '');
  };

  const handleUploadVideo = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUploadProgress(0);

    if (!newVideo.file) {
      setError('Please select a video file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', newVideo.title);
    formData.append('description', newVideo.description);
    formData.append('category', newVideo.category);
    formData.append('video', newVideo.file);

    try {
      await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });
      setSuccess('Video uploaded successfully!');
      setNewVideo({ title: '', description: '', category: '', file: null });
      setPreviewURL('');
      setUploadProgress(0);
      fetchVideos();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await api.delete(`/videos/${videoId}`);
        fetchVideos();
      } catch {
        alert('Delete failed');
      }
    }
  };

  // ==================== REPORTED POSTS ACTIONS ====================
  const handleResolve = async (postId) => {
    try {
      await api.patch(`/admin/posts/${postId}/resolve`);
      fetchReports();
    } catch {
      console.error('Resolve failed');
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/admin/posts/${postId}`);
        fetchReports();
      } catch {
        console.error('Delete failed');
      }
    }
  };

  // ==================== UI TABS ====================
  const tabs = [
    { id: 'reports', label: 'Reported Posts', icon: Flag },
    { id: 'create-prof', label: 'Create Professional', icon: UserPlus },
    { id: 'videos', label: 'Manage Videos', icon: Video },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      <div className="flex gap-4 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full flex items-center gap-2 ${tab === t.id ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            <t.icon size={18} /> {t.label}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500 mb-4 flex items-center"><AlertCircle className="mr-2" />{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {/* ==================== REPORTED POSTS ==================== */}
      {tab === 'reports' && (
        <div className="space-y-4">
          {reportedPosts.map(post => (
            <div key={post._id} className="glass-card p-4">
              <h3 className="font-bold">{post.title}</h3>
              <p className="text-sm text-gray-600">Reports: {post.reports.length}</p>
              <div className="space-y-2">
                {post.reports.map((report, idx) => (
                  <p key={idx} className="text-sm">Reason: {report.reason} by {report.user.name}</p>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleResolve(post._id)} className="btn-success">Resolve</button>
                <button onClick={() => handleDeletePost(post._id)} className="btn-danger">Delete Post</button>
              </div>
            </div>
          ))}
          {reportedPosts.length === 0 && <p>No reported posts.</p>}
        </div>
      )}

      {/* ==================== CREATE PROFESSIONAL ==================== */}
      {tab === 'create-prof' && (
        <form onSubmit={handleCreateProf} className="glass-card p-4 space-y-4">
          <input type="text" placeholder="Name" value={newProf.name} onChange={e => setNewProf({ ...newProf, name: e.target.value })} className="input-field" required />
          <input type="email" placeholder="Email" value={newProf.email} onChange={e => setNewProf({ ...newProf, email: e.target.value })} className="input-field" required />
          <input type="password" placeholder="Password" value={newProf.password} onChange={e => setNewProf({ ...newProf, password: e.target.value })} className="input-field" required />
          <select value={newProf.role} onChange={e => setNewProf({ ...newProf, role: e.target.value })} className="input-field">
            <option value="doctor">Doctor</option>
            <option value="chw">CHW</option>
          </select>
          <button type="submit" className="btn-primary">Create</button>
        </form>
      )}

      {/* ==================== VIDEO MANAGEMENT ==================== */}
      {tab === 'videos' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold mb-8 text-center text-dark flex items-center justify-center">
            <Film className="mr-2" /> Admin - Upload Video
          </h1>

          <form onSubmit={handleUploadVideo} className="glass-card p-4 space-y-4">
            <input type="text" placeholder="Video Title" value={newVideo.title} onChange={e => setNewVideo({ ...newVideo, title: e.target.value })} className="input-field" required />
            <textarea placeholder="Description" value={newVideo.description} onChange={e => setNewVideo({ ...newVideo, description: e.target.value })} className="input-field min-h-[100px]" />
            <select value={newVideo.category} onChange={e => setNewVideo({ ...newVideo, category: e.target.value })} className="input-field" required>
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>

            <div className="relative">
              <Upload className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input type="file" accept="video/*" onChange={handleVideoSelect} className="input-field pl-10" required />
            </div>

            {previewURL && (
              <video controls className="w-full mt-2 rounded-md">
                <source src={previewURL} type={newVideo.file?.type} />
              </video>
            )}

            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div className="bg-primary h-3 rounded-full" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? `Uploading... ${uploadProgress}%` : 'Upload Video'}
            </button>
          </form>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Existing Videos</h2>
            {videos.map(video => (
              <div key={video._id} className="glass-card p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{video.title}</h3>
                  <p className="text-sm text-gray-600">{video.description}</p>
                </div>
                <button onClick={() => handleDeleteVideo(video._id)} className="btn-danger">Delete</button>
              </div>
            ))}
            {videos.length === 0 && <p>No videos yet.</p>}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Admin;