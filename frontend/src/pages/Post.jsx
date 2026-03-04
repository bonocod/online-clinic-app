// FILE: frontend/src/pages/Post.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import { ArrowLeft, ArrowUp, MessageCircle, ThumbsUp, Flag, Send } from 'lucide-react';

const Post = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const resPost = await api.get(`/forum/posts/${id}`);
        setPost(resPost.data);
        setComments(resPost.data.comments || []);
        
        const resUser = await api.get('/auth/profile');
        setUser(resUser.data);
      } catch (err) {
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/forum/posts/${id}/comment`, { content: newComment });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch (err) {
      console.error('Comment failed');
    }
  };

  const updatePost = async (updates) => {
    setPost(prev => ({ ...prev, ...updates }));
    // Refresh comments if needed
    const resPost = await api.get(`/forum/posts/${id}`);
    setComments(resPost.data.comments || []);
  };

  const handleAction = async (action) => {
    try {
      const res = await api.post(`/forum/posts/${id}/${action}`);
      updatePost(res.data);
    } catch (err) {
      console.error(`${action} failed`);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!post) return <p>Post not found</p>;

  const upvoted = user && post.upvotes.includes(user._id);
  const helpfulMarked = user && post.helpful.includes(user._id);

  const handleUpvote = async () => {
    try {
      const res = await api.post(`/forum/posts/${id}/upvote`);
      updatePost({ upvotes: res.data.upvotes });
    } catch (err) {
      console.error('Upvote failed');
    }
  };

  const handleHelpful = async () => {
    try {
      const res = await api.post(`/forum/posts/${id}/helpful`);
      updatePost({ helpful: res.data.helpful });
    } catch (err) {
      console.error('Helpful failed');
    }
  };

  const handleReport = async () => {
    const reason = window.prompt('Please provide a reason for reporting this post:');
    if (reason) {
      try {
        const res = await api.post(`/forum/posts/${id}/report`, { reason });
        updatePost({ reports: res.data.reports });
        alert('Report submitted successfully. An admin will review it.');
      } catch (err) {
        console.error('Report failed');
        alert('Failed to submit report.');
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6">
      <Link to={`/category/${post.category._id}`} className="flex items-center text-primary"><ArrowLeft className="mr-2" />Back to Category</Link>
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="text-sm text-gray-600">By {post.anonymous ? 'Anonymous' : post.author.name} ({post.author.role}) • {new Date(post.createdAt).toLocaleString()}</p>
      <p>{post.content}</p>
      <div className="flex gap-4 text-sm text-gray-600">
        <button onClick={handleUpvote} className={`flex items-center ${upvoted ? 'text-blue-500' : ''}`}><ArrowUp size={16} /> {post.upvotes.length}</button>
        <span className="flex items-center"><MessageCircle size={16} /> {comments.length}</span>
        <button onClick={handleHelpful} className={`flex items-center ${helpfulMarked ? 'text-blue-500' : ''}`}><ThumbsUp size={16} /> {post.helpful.length}</button>
        <button onClick={handleReport} className="flex items-center"><Flag size={16} /> Report</button>
      </div>

      {/* Role-based actions */}
      {user?.role === 'doctor' && (
        <div className="flex gap-2">
          <button onClick={() => handleAction('mark-professional')} className="btn-secondary">Mark as Professional Answer</button>
          <button onClick={() => handleAction('recommend-care')} className="btn-warning">Recommend Immediate Care</button>
          <button onClick={() => handleAction('mark-handled')} className="btn-success">Mark as Handled</button>
        </div>
      )}
      {user?.role === 'chw' && (
        <div className="flex gap-2">
          <button onClick={() => handleAction('escalate')} className="btn-warning">Escalate to Doctor</button>
          <button onClick={() => handleAction('mark-supported')} className="btn-secondary">Mark as Community Supported</button>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Comments</h2>
        {comments.length === 0 ? <p>No comments yet.</p> : comments.map(comment => (
          <div key={comment._id} className="glass-card p-4">
            <p className="text-sm text-gray-600">By {comment.anonymous ? 'Anonymous' : comment.author.name} ({comment.author.role}) • {new Date(comment.createdAt).toLocaleString()}</p>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleCommentSubmit} className="space-y-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="input-field w-full h-24"
        />
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Send size={16} /> Post Comment
        </button>
      </form>
    </motion.div>
  );
};

export default Post;