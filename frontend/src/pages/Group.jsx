import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import io from 'socket.io-client';
import { AlertCircle, Send } from 'lucide-react';

const socket = io('http://localhost:5000');

const Group = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resGroup = await api.get(`/forum/groups/${id}`);
        setGroup(resGroup.data);
        const resPosts = await api.get(`/forum/groups/${id}/posts`);
        setPosts(resPosts.data);
        await api.post(`/forum/groups/${id}/join`); // Auto-join if not already
      } catch (err) {
        setError(t('forum.errorLoad'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    socket.emit('joinGroup', id);
    socket.on('message', (msg) => setMessages(prev => [...prev, msg]));

    return () => socket.off('message');
  }, [id, t]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/forum/posts', { ...newPost, groupId: id });
      setPosts(prev => [res.data, ...prev]);
      setNewPost({ title: '', content: '' });
    } catch (err) {
      alert(t('forum.createPostFailed'));
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    socket.emit('newMessage', { groupId: id, text: newMessage });
    setNewMessage('');
  };

  if (loading) return <p className="text-center">{t('forum.loading')}</p>;
  if (error) return <p className="text-red-500 text-center flex items-center"><AlertCircle className="mr-2" />{error}</p>;
  if (!group) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-4xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-dark">{group.name}</h1>
      <p className="text-center text-gray-600 mb-8">{group.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4">{t('forum.posts')}</h2>
          <form onSubmit={handleCreatePost} className="space-y-4 mb-6">
            <input
              type="text"
              placeholder={t('forum.postTitle')}
              value={newPost.title}
              onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
              className="input-field"
              required
            />
            <textarea
              placeholder={t('forum.postContent')}
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              className="input-field min-h-[100px] resize-y"
              required
            />
            <button type="submit" className="btn-primary w-full">{t('forum.createPost')}</button>
          </form>
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post._id} className="bg-neutral p-4 rounded-xl">
                <h3 className="font-bold text-lg">{post.title}</h3>
                <p className="text-gray-700">{post.content}</p>
                <Link to={`/post/${post._id}`} className="text-primary hover:underline mt-2 inline-block">
                  {t('forum.viewThread')} ({post.replies} {t('forum.replies')})
                </Link>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4">{t('forum.groupChat')}</h2>
          <div className="h-64 overflow-y-auto bg-neutral p-4 rounded-xl mb-4 space-y-2">
            {messages.map((msg, i) => (
              <p key={i} className="text-gray-700">{msg.text}</p>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t('forum.messagePlaceholder')}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="input-field flex-1"
            />
            <button onClick={handleSendMessage} className="btn-primary px-4 flex items-center">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Group;