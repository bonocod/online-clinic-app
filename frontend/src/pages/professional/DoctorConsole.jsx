// FILE: frontend/src/pages/professional/DoctorConsole.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { AlertCircle, Clock, CheckCircle, Activity } from 'lucide-react';

const DoctorConsole = () => {
  const [tab, setTab] = useState('urgent');
  const [urgentCases, setUrgentCases] = useState([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [myResponses, setMyResponses] = useState([]);
  const [stats, setStats] = useState({ totalAnswers: 0, urgentHandled: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'urgent' || tab === 'all') {
        const res = await api.get('/forum/urgent-posts');
        setUrgentCases(res.data);
      }
      if (tab === 'questions' || tab === 'all') {
        const res = await api.get('/forum/unanswered-questions');
        setUnansweredQuestions(res.data);
      }
      if (tab === 'responses' || tab === 'all') {
        const res = await api.get('/forum/my-responses');
        setMyResponses(res.data);
      }
      if (tab === 'overview' || tab === 'all') {
        const res = await api.get('/forum/doctor-stats');
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
      fetchData(); // Refresh data
    } catch (err) {
      console.error(`${action} failed`);
    }
  };

  const tabs = [
    { id: 'urgent', label: 'Urgent Cases', icon: AlertCircle },
    { id: 'questions', label: 'Unanswered Questions', icon: Clock },
    { id: 'responses', label: 'My Responses', icon: CheckCircle },
    { id: 'overview', label: 'Activity Overview', icon: Activity },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">Doctor Console</h1>
      <p>Welcome to the Doctor's professional dashboard.</p>

      <div className="flex gap-4 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-full flex items-center gap-2 ${tab === t.id ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            <t.icon size={18} /> {t.label}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}

      {tab === 'urgent' && (
        <div className="space-y-4">
          {urgentCases.map(post => <CaseCard key={post._id} post={post} handleAction={handleAction} />)}
          {urgentCases.length === 0 && <p>No urgent cases.</p>}
        </div>
      )}

      {tab === 'questions' && (
        <div className="space-y-4">
          {unansweredQuestions.map(post => <CaseCard key={post._id} post={post} handleAction={handleAction} isQuestion />)}
          {unansweredQuestions.length === 0 && <p>No unanswered questions.</p>}
        </div>
      )}

      {tab === 'responses' && (
        <div className="space-y-4">
          {myResponses.map(post => <ResponseCard key={post._id} post={post} />)}
          {myResponses.length === 0 && <p>No responses yet.</p>}
        </div>
      )}

      {tab === 'overview' && (
        <div className="glass-card p-4 space-y-4">
          <p>Total Professional Answers: {stats.totalAnswers}</p>
          <p>Urgent Cases Handled: {stats.urgentHandled}</p>
        </div>
      )}

      <Link to="/dashboard" className="btn-primary">Go to User Dashboard</Link>
    </motion.div>
  );
};

const CaseCard = ({ post, handleAction, isQuestion = false }) => {
  return (
    <div className="glass-card p-4">
      <h3 className="font-bold">{post.title}</h3>
      <p className="text-sm text-gray-600">Category: {post.category.name} • {new Date(post.createdAt).toLocaleString()}</p>
      <p>{post.content.substring(0, 100)}...</p>
      <div className="flex gap-2 mt-2">
        <Link to={`/post/${post._id}`} className="btn-primary">Respond</Link>
        <button onClick={() => handleAction(post._id, 'mark-professional')} className="btn-secondary">Mark as Professional Answer</button>
        <button onClick={() => handleAction(post._id, 'recommend-care')} className="btn-warning">Recommend Immediate Care</button>
        <button onClick={() => handleAction(post._id, isQuestion ? 'mark-resolved' : 'mark-handled')} className="btn-success">{isQuestion ? 'Mark Resolved' : 'Mark Handled'}</button>
      </div>
    </div>
  );
};

const ResponseCard = ({ post }) => {
  return (
    <div className="glass-card p-4">
      <h3 className="font-bold">{post.title}</h3>
      <p className="text-sm text-gray-600">Status: {post.status} • Responded: {new Date(post.respondedAt).toLocaleString()}</p>
    </div>
  );
};

export default DoctorConsole;