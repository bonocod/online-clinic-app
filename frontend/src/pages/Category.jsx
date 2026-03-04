// FILE: frontend/src/pages/Category.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import {
  AlertCircle,
  ArrowLeft,
  ArrowUp,
  MessageCircle,
  ThumbsUp,
  Flag,
  Plus,
  AlertTriangle
} from 'lucide-react';

const Category = () => {
  const { id } = useParams();

  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [pinnedPosts, setPinnedPosts] = useState([]);
  const [relatedCircles, setRelatedCircles] = useState([]);
  const [tab, setTab] = useState('recent');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  const limit = 10;

  // Fetch current user
  useEffect(() => {
    api.get('/auth/profile')
      .then(res => setUser(res.data))
      .catch(() => {});
  }, []);

  // Fetch category + posts + pinned + circles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const resCat = await api.get(`/forum/categories/${id}`);
        setCategory(resCat.data);

        const resPinned = await api.get(`/forum/categories/${id}/posts?pinned=true`);
        setPinnedPosts(resPinned.data);

        const resPosts = await api.get(
          `/forum/categories/${id}/posts?tab=${tab}&page=${page}&limit=${limit}`
        );

        setPosts(prev =>
          page === 1 ? resPosts.data : [...prev, ...resPosts.data]
        );

        setHasMore(resPosts.data.length === limit);

        const resCircles = await api.get(`/forum/categories/${id}/circles`);
        setRelatedCircles(resCircles.data);

      } catch (err) {
        setError('Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, tab, page]);

  const changeTab = (newTab) => {
    setTab(newTab);
    setPage(1);
    setPosts([]);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const handleJoinCircle = async (circleId) => {
    try {
      await api.post(`/forum/groups/${circleId}/join`);
      alert('Joined successfully');
    } catch {
      alert('Failed to join');
    }
  };

  const updatePost = (postId, updates) => {
    setPosts(prev =>
      prev.map(p => p._id === postId ? { ...p, ...updates } : p)
    );
    setPinnedPosts(prev =>
      prev.map(p => p._id === postId ? { ...p, ...updates } : p)
    );
  };

  // ---------------------------
  // NEW PostCard (your new logic)
  // ---------------------------
  const PostCard = ({ post }) => {
    const upvoted = user && post.upvotes?.some(
      id => id.toString() === user._id.toString()
    );

    const helpfulMarked = user && post.helpful?.some(
      id => id.toString() === user._id.toString()
    );

    const [comments, setComments] = useState(post.comments || []);
    const [commentText, setCommentText] = useState('');

    const handleUpvote = async () => {
      const res = await api.post(`/forum/posts/${post._id}/upvote`);
      updatePost(post._id, { upvotes: res.data.upvotes });
    };

    const handleHelpful = async () => {
      const res = await api.post(`/forum/posts/${post._id}/helpful`);
      updatePost(post._id, { helpful: res.data.helpful });
    };

    const handleReport = async () => {
      const reason = window.prompt('Reason for reporting?');
      if (!reason) return;

      await api.post(`/forum/posts/${post._id}/report`, { reason });
      alert('Reported successfully');
    };

    const handleComment = async (e) => {
      e.preventDefault();
      if (!commentText.trim()) return;

      const res = await api.post(`/forum/posts/${post._id}/comments`, {
        content: commentText
      });

      setComments([...comments, res.data]);
      setCommentText('');
    };

    return (
      <div className="glass-card p-4">
        <Link
          to={`/post/${post._id}`}
          className="text-xl font-bold hover:text-primary"
        >
          {post.title}
        </Link>

        <p className="text-sm text-gray-600">
          {post.anonymous
            ? 'Anonymous'
            : post.author
              ? `${post.author.name} (${post.author.role})`
              : 'Unknown User'}
        </p>

        {post.urgency !== 'general' && (
          <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
            {post.urgency?.toUpperCase()}
          </span>
        )}

        <div className="flex gap-4 mt-2 text-sm">
          <button
            onClick={handleUpvote}
            className={upvoted ? 'text-blue-500 flex items-center gap-1' : 'flex items-center gap-1'}
          >
            <ArrowUp size={16} />
            {post.upvotes?.length || 0}
          </button>

          <button
            onClick={handleHelpful}
            className={helpfulMarked ? 'text-green-600 flex items-center gap-1' : 'flex items-center gap-1'}
          >
            <ThumbsUp size={16} />
            {post.helpful?.length || 0}
          </button>

          <span className="flex items-center gap-1">
            <MessageCircle size={16} />
            {comments.length}
          </span>

          <button
            onClick={handleReport}
            className="flex items-center gap-1 text-red-500"
          >
            <Flag size={16} />
            Report
          </button>
        </div>

        <div className="mt-4">
          {comments.map(c => (
            <div key={c._id} className="border-l pl-3 mt-2">
              <p className="text-sm">
                {c.anonymous
                  ? 'Anonymous'
                  : c.author
                    ? `${c.author.name} (${c.author.role})`
                    : 'Unknown User'}
              </p>
              <p>{c.content}</p>
            </div>
          ))}

          <form onSubmit={handleComment} className="flex gap-2 mt-2">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="border px-2 py-1 flex-1"
              placeholder="Write comment..."
            />
            <button className="btn-primary px-4">
              Send
            </button>
          </form>
        </div>
      </div>
    );
  };

  if (loading && page === 1) return <p>Loading...</p>;

  if (error)
    return (
      <p className="text-red-500 flex items-center">
        <AlertCircle className="mr-2" />
        {error}
      </p>
    );

  const emptyState = {
    recent: 'No recent posts yet.',
    popular: 'No popular posts yet.',
    questions: 'No questions yet.',
    discussions: 'No discussions yet.'
  }[tab];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/forum" className="flex items-center text-primary">
          <ArrowLeft className="mr-2" />
          Back to Forum
        </Link>
        <h1 className="text-3xl font-bold">{category?.name}</h1>
      </div>

      <p>{category?.description}</p>
      <p className="text-sm text-gray-600">
        Posts: {posts.length + pinnedPosts.length}
      </p>

      {/* Safety Disclaimer */}
      <div className="bg-yellow-100 p-4 rounded-lg flex items-center">
        <AlertTriangle className="mr-2 text-yellow-600" />
        <p className="text-yellow-800">
          This is not a replacement for professional care. For emergencies, contact services immediately.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 overflow-x-auto">
        {['recent', 'popular', 'questions', 'discussions'].map(t => (
          <button
            key={t}
            onClick={() => changeTab(t)}
            className={`px-4 py-2 rounded-full ${
              tab === t ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Create Post */}
      <Link
        to={`/category/${id}/create-post`}
        className="btn-primary flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        Create New Post
      </Link>

      {/* Pinned Posts */}
      {pinnedPosts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Pinned Posts</h2>
          {pinnedPosts.map(p => (
            <PostCard key={p._id} post={p} />
          ))}
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0
          ? <p className="text-center text-gray-600">{emptyState}</p>
          : posts.map(p => (
              <PostCard key={p._id} post={p} />
            ))}

        {loading && <p>Loading more...</p>}

        {hasMore && !loading && (
          <button
            onClick={loadMore}
            className="btn-primary mx-auto block"
          >
            Load More
          </button>
        )}
      </div>

      {/* Support Circles */}
      <div className="glass-card p-4">
        <h2 className="text-xl font-bold mb-4">
          Related Support Circles
        </h2>

        {relatedCircles.map(circle => (
          <div key={circle._id} className="mb-4">
            <Link
              to={`/group/${circle._id}`}
              className="font-medium"
            >
              {circle.name}
            </Link>
            <p className="text-sm">
              {circle.members?.length || 0} members
            </p>
            <button
              onClick={() => handleJoinCircle(circle._id)}
              className="text-primary"
            >
              Join
            </button>
          </div>
        ))}

        {relatedCircles.length === 0 && (
          <p>No related circles yet.</p>
        )}
      </div>

      {/* Insights */}
      <div className="glass-card p-4">
        <h2 className="text-xl font-bold mb-4">
          Category Insights
        </h2>
        <p>Total Posts: {posts.length + pinnedPosts.length}</p>
        <p>Active Discussions: 5</p>
        <p>Popular Tags: Mental Health, Support</p>
        <p>Top Contributors: Dr. Smith (10 pts)</p>
      </div>

    </motion.div>
  );
};

export default Category;