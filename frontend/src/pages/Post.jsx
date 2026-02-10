import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import { AlertCircle } from 'lucide-react';

const Post = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resPost = await api.get(`/forum/posts/${id}`);
        setPost(resPost.data);
        const resComments = await api.get(`/forum/posts/${id}/comments`);
        setComments(resComments.data);
      } catch (err) {
        setError(t('post.errorLoad'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, t]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/forum/posts/${id}/comments`, { content: newComment });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch (err) {
      alert(t('post.commentFailed'));
    }
  };

  if (loading) return <p className="text-center">{t('post.loading')}</p>;
  if (error) return <p className="text-red-500 text-center flex items-center"><AlertCircle className="mr-2" />{error}</p>;
  if (!post) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-3xl mx-auto glass-card"
    >
      <h1 className="text-2xl font-bold mb-4 text-dark">{post.title}</h1>
      <p className="text-gray-700 mb-6">{post.content}</p>
      <h2 className="text-xl font-bold mb-4">{t('post.comments')}</h2>
      <div className="space-y-4 mb-6">
        {comments.map((comment) => (
          <div key={comment._id} className="bg-neutral p-4 rounded-xl">
            <p className="text-gray-700">{comment.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleAddComment} className="space-y-4">
        <textarea
          placeholder={t('post.addComment')}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="input-field min-h-[100px] resize-y"
          required
        />
        <button type="submit" className="btn-primary w-full">{t('post.postComment')}</button>
      </form>
    </motion.div>
  );
};

export default Post;