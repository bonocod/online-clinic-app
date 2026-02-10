//frontend/src/pages/Group.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import io from 'socket.io-client';
import { AlertCircle, Send, Heart, MessageCircle } from 'lucide-react';

const socket = io('http://localhost:5000');
const BASE_URL = 'http://localhost:5000';

const Group = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComments, setNewComments] = useState({}); // { postId: 'content' }

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resGroup, resPosts, resMessages, resProfile] = await Promise.all([
          api.get(`/forum/groups/${id}`),
          api.get(`/forum/groups/${id}/posts`),
          api.get(`/forum/groups/${id}/messages`),
          api.get('/auth/profile')
        ]);
        setGroup(resGroup.data);
        setPosts(resPosts.data);
        setMessages(resMessages.data);
        setUser(resProfile.data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(t('forum.errorLoad'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    socket.emit('joinGroup', id);

    socket.on('message', (msg) => {
      console.log('New message received:', msg);
      setMessages(prev => [...prev, msg]);
    });

    socket.on('newPost', (post) => {
      console.log('New post received:', post);
      setPosts(prev => [post, ...prev]);
    });

    socket.on('postLiked', ({ postId, likes }) => {
      console.log('Like update:', { postId, likes });
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes } : p));
    });

    socket.on('newComment', (comment) => {
      console.log('New comment received:', comment);
      setPosts(prev => prev.map(p => 
        p._id === comment.post ? { ...p, comments: [...p.comments, comment] } : p
      ));
    });

    return () => {
      socket.off('message');
      socket.off('newPost');
      socket.off('postLiked');
      socket.off('newComment');
    };
  }, [id, t]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await api.post(`/forum/groups/${id}/messages`, { content: newMessage });
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/forum/posts/${postId}/like`);
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleAddComment = async (postId) => {
    const content = newComments[postId];
    if (!content?.trim()) return;
    try {
      await api.post(`/forum/posts/${postId}/comments`, { content });
      setNewComments(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  if (loading) return <p className="text-center text-lg py-10">{t('forum.loading')}</p>;
  if (error) return <p className="text-red-500 text-center flex items-center justify-center py-10"><AlertCircle className="mr-2" />{error}</p>;
  if (!group || !user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-5xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-4 text-center text-dark">{group.name}</h1>
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">{group.description}</p>

      <Link
        to={`/group/${id}/create-post`}
        className="btn-primary mb-10 block w-fit mx-auto px-8 py-3 text-lg"
      >
        + {t('forum.createPost')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Posts Feed - Instagram Style */}
        <div className="lg:col-span-2 glass-card overflow-y-auto max-h-[90vh] pb-4">
          <h2 className="text-2xl font-bold mb-6 px-4 pt-4">{t('forum.posts')}</h2>
          <div className="space-y-10 px-4">
            {posts.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No posts yet. Be the first to share!</p>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center p-4">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`}
                      alt="avatar"
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <span className="font-semibold text-lg">{post.author.name}</span>
                  </div>

                  {/* Media - Square like Instagram */}
                  <div className="relative aspect-square bg-black">
                    {post.mediaType === 'image' ? (
                      <img
                        src={`${BASE_URL}${post.mediaUrl}`}
                        alt="post"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', e.target.src);
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML += '<div class="flex items-center justify-center h-full text-white text-xl">Image failed to load</div>';
                        }}
                      />
                    ) : (
                      <video
                        src={`${BASE_URL}${post.mediaUrl}`}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        onError={(e) => {
                          console.error('Video failed to load:', e.target.src);
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML += '<div class="flex items-center justify-center h-full text-white text-xl">Video failed to load</div>';
                        }}
                      />
                    )}

                    {/* Caption Overlay */}
                    {post.caption && post.captionStyle && (
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          left: `${post.captionStyle.position.x}%`,
                          top: `${post.captionStyle.position.y}%`,
                          fontSize: `${post.captionStyle.fontSize}px`,
                          color: post.captionStyle.color || '#ffffff',
                          transform: 'translate(-50%, -50%)',
                          textShadow: '0 0 10px rgba(0,0,0,0.8)',
                          maxWidth: '90%',
                          textAlign: 'center',
                          fontWeight: 'bold'
                        }}
                      >
                        {post.caption}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-4">
                    <div className="flex items-center space-x-4 mb-3">
                      <button
                        onClick={() => handleLike(post._id)}
                        className="flex items-center space-x-1"
                      >
                        <Heart
                          className={`w-7 h-7 transition-colors ${
                            post.likes.some(l => l.toString() === user._id)
                              ? 'text-red-500 fill-red-500'
                              : 'text-gray-800 hover:text-red-500'
                          }`}
                        />
                        <span className="text-lg font-medium">{post.likes.length}</span>
                      </button>
                      <MessageCircle className="w-7 h-7 text-gray-800" />
                    </div>

                    {/* Comments */}
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">{t('post.comments')}</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {post.comments.length === 0 ? (
                          <p className="text-gray-500 italic">No comments yet</p>
                        ) : (
                          post.comments.map((c) => (
                            <div key={c._id} className="text-sm">
                              <span className="font-medium mr-2">{c.author.name}:</span>
                              <span>{c.content}</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Comment */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAddComment(post._id);
                        }}
                        className="flex gap-2 mt-4"
                      >
                        <input
                          type="text"
                          placeholder={t('post.addComment')}
                          value={newComments[post._id] || ''}
                          onChange={(e) =>
                            setNewComments(prev => ({ ...prev, [post._id]: e.target.value }))
                          }
                          className="input-field flex-1 text-sm"
                        />
                        <button type="submit" className="btn-primary px-4 py-2">
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Group Chat Sidebar */}
        <div className="glass-card h-[80vh] flex flex-col">
          <h2 className="text-2xl font-bold p-4 border-b">{t('forum.groupChat')}</h2>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.author._id === user._id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                    msg.author._id === user._id
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  {msg.author._id !== user._id && (
                    <div className="text-xs font-medium mb-1 opacity-80">
                      {msg.author.name}
                    </div>
                  )}
                  <div>{msg.content}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('forum.messagePlaceholder')}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="input-field flex-1"
              />
              <button
                onClick={handleSendMessage}
                className="btn-primary px-4 py-2 flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Group;