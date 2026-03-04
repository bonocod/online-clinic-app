// FILE: frontend/src/pages/professional/CHWConsole.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { AlertCircle, ArrowUpCircle, Users, Activity } from 'lucide-react';

const CHWConsole = () => {
  const [tab, setTab] = useState('attention');
  const [attentionPosts, setAttentionPosts] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [circles, setCircles] = useState([]);
  const [stats, setStats] = useState({ postsSupported: 0, escalations: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'attention' || tab === 'all') {
        const res = await api.get('/forum/attention-posts');
        setAttentionPosts(res.data);
      }
      if (tab === 'escalations' || tab === 'all') {
        const res = await api.get('/forum/my-escalations');
        setEscalations(res.data);
      }
      if (tab === 'circles' || tab === 'all') {
        const res = await api.get('/forum/my-circles');
        setCircles(res.data);
      }
      if (tab === 'overview' || tab === 'all') {
        const res = await api.get('/forum/chw-stats');
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (postId, action) => {
    try {
      await api.post(`/forum/posts/${postId}/${action}`);
      fetchData();
    } catch (err) {
      console.error(`${action} failed`);
    }
  };

  const handleCircleAction = async (circleId, action, targetId) => {
    try {
      await api.post(`/forum/groups/${circleId}/${action}`, { targetId });
      fetchData();
    } catch (err) {
      console.error(`${action} failed`);
    }
  };

  const tabs = [
    { id: 'attention', label: 'Community Attention', icon: AlertCircle },
    { id: 'escalations', label: 'Escalations', icon: ArrowUpCircle },
    { id: 'circles', label: 'Support Circles', icon: Users },
    { id: 'overview', label: 'Activity Overview', icon: Activity },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">CHW Console</h1>
      <p>Welcome to the Community Health Worker's professional dashboard.</p>

      <div className="flex gap-4 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-full flex items-center gap-2 ${tab === t.id ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            <t.icon size={18} /> {t.label}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}

      {tab === 'attention' && (
        <div className="space-y-4">
          {attentionPosts.map(post => <AttentionCard key={post._id} post={post} handleAction={handleAction} />)}
          {attentionPosts.length === 0 && <p>No posts needing attention.</p>}
        </div>
      )}

      {tab === 'escalations' && (
        <div className="space-y-4">
          {escalations.map(post => <EscalationCard key={post._id} post={post} />)}
          {escalations.length === 0 && <p>No escalations.</p>}
        </div>
      )}

      {tab === 'circles' && (
        <div className="space-y-4">
          {circles.map(circle => <CircleCard key={circle._id} circle={circle} handleCircleAction={handleCircleAction} />)}
          {circles.length === 0 && <p>No circles managed.</p>}
        </div>
      )}

      {tab === 'overview' && (
        <div className="glass-card p-4 space-y-4">
          <p>Posts Supported: {stats.postsSupported}</p>
          <p>Escalations Made: {stats.escalations}</p>
        </div>
      )}

      <Link to="/dashboard" className="btn-primary">Go to User Dashboard</Link>
    </motion.div>
  );
};

const AttentionCard = ({ post, handleAction }) => {
  return (
    <div className="glass-card p-4">
      <h3 className="font-bold">{post.title}</h3>
      <p className="text-sm text-gray-600">Category: {post.category.name} • {new Date(post.createdAt).toLocaleString()}</p>
      <p>{post.content.substring(0, 100)}...</p>
      <div className="flex gap-2 mt-2">
        <Link to={`/post/${post._id}`} className="btn-primary">Reply</Link>
        <button onClick={() => handleAction(post._id, 'mark-supported')} className="btn-secondary">Mark as Community Supported</button>
        <button onClick={() => handleAction(post._id, 'escalate')} className="btn-warning">Escalate to Doctor</button>
      </div>
    </div>
  );
};

const EscalationCard = ({ post }) => {
  return (
    <div className="glass-card p-4">
      <h3 className="font-bold">{post.title}</h3>
      <p className="text-sm text-gray-600">Status: {post.escalationStatus}</p>
    </div>
  );
};

const CircleCard = ({ circle, handleCircleAction }) => {
  return (
    <div className="glass-card p-4">
      <h3 className="font-bold">{circle.name}</h3>
      {/* Assume pendingRequests, posts, comments fetched in circle */}
      {/* For MVP, placeholder actions */}
      <div className="space-y-2">
        <button onClick={() => handleCircleAction(circle._id, 'approve-join', 'requestId')} className="btn-primary">Approve Join Requests</button>
        <button onClick={() => handleCircleAction(circle._id, 'remove-comment', 'commentId')} className="btn-warning">Remove Comment</button>
        <button onClick={() => handleCircleAction(circle._id, 'pin-post', 'postId')} className="btn-secondary">Pin Post</button>
        <button onClick={() => handleCircleAction(circle._id, 'issue-warning', 'userId')} className="btn-danger">Issue Warning</button>
      </div>
    </div>
  );
};

export default CHWConsole;