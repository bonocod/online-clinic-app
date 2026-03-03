//# FILE: frontend/src/pages/Post.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import { AlertCircle, ArrowLeft, ArrowUp, Bookmark, Flag, MessageCircle, ThumbsUp, AlertTriangle, Star } from 'lucide-react';

const Post = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [anonymousComment, setAnonymousComment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resPost = await api.get(`/forum/posts/${id}`);
        setPost(resPost.data);
        setComments(resPost.data.comments); // Already populated

        const resRelated = await api.get(`/forum/posts/related/${id}`);
        setRelatedPosts(resRelated.data);
      } catch (err) {
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/forum/posts/${id}/comments`, { content: newComment, anonymous: anonymousComment });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500 flex items-center"><AlertCircle className="mr-2" />{error}</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/category/${post.category._id}`} className="flex items-center text-primary"><ArrowLeft className="mr-2" />Back to Category</Link>
        <h1 className="text-3xl font-bold">{post.title}</h1>
      </div>
      <p className="text-sm text-gray-600">By {post.anonymous ? 'Anonymous' : post.author.name} ({post.author.role}) • {new Date(post.createdAt).toLocaleString()}</p>
      {post.urgency !== 'general' && <span className="bg-red-100 text-red-600 px-2 py-1 rounded">{post.urgency.toUpperCase()}</span>}

      {/* Safety Layer */}
      {post.urgency === 'urgent' && (
        <div className="bg-red-100 p-4 rounded-lg flex items-center">
          <AlertTriangle className="mr-2 text-red-600" />
          <p className="text-red-800">If you are in danger, contact emergency services immediately.</p>
        </div>
      )}
      <div className="bg-yellow-100 p-4 rounded-lg flex items-center">
        <AlertTriangle className="mr-2 text-yellow-600" />
        <p className="text-yellow-800">This is not a replacement for professional care.</p>
      </div>

      {/* Body */}
      <p>{post.body}</p>
      {post.attachments?.map((att, i) => <a key={i} href={att} target="_blank" rel="noopener noreferrer">Attachment {i+1}</a>)}

      {/* Actions Toolbar */}
      <div className="flex gap-4">
        <button className="flex items-center"><ArrowUp size={16} /> Upvote ({post.upvotes.length})</button>
        <button className="flex items-center"><Bookmark size={16} /> Bookmark</button>
        <button className="flex items-center"><Flag size={16} /> Report</button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-gray-600">
        <span>Views: {post.views}</span>
        <span>Upvotes: {post.upvotes.length}</span>
        <span>Comments: {post.comments.length}</span>
      </div>

      {/* Comments */}
      <h2 className="text-2xl font-bold">Comments</h2>
      {comments.map(comment => (
        <CommentCard key={comment._id} comment={comment} postId={id} />
      ))}
      {/* Add Comment Form */}
      <div className="space-y-2">
        <textarea value={newComment} onChange={e => setNewComment(e.target.value)} className="w-full p-2 border rounded" placeholder="Add a comment..." />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={anonymousComment} onChange={e => setAnonymousComment(e.target.checked)} />
          Post anonymously
        </label>
        <button onClick={handleAddComment} className="btn-primary">Submit</button>
      </div>

      {/* Related Posts */}
      <h2 className="text-2xl font-bold">Related Posts</h2>
      {relatedPosts.map(rpost => <PostCard key={rpost._id} post={rpost} />)}
    </motion.div>
  );
};

const CommentCard = ({ comment, postId }) => (
  <div className="glass-card p-4 mb-4">
    <p>{comment.content}</p>
    <p className="text-sm text-gray-600">By {comment.anonymous ? 'Anonymous' : comment.author.name} ({comment.author.role}) • {new Date(comment.createdAt).toLocaleString()}</p>
    {comment.isHighlighted && <span className="bg-green-100 text-green-600 px-2 py-1 rounded"><Star size={16} /> Professional Answer</span>}
    <div className="flex gap-4 mt-2 text-sm text-gray-600">
      <span><ThumbsUp size={16} /> {comment.helpful.length}</span>
      <span><Flag size={16} /> Report</span>
    </div>
    {/* Nested Replies (1 level) */}
    {comment.parent && <div className="ml-8 border-l-2 pl-4"><CommentCard comment={comment.parent} postId={postId} /></div>}
  </div>
);

const PostCard = ({ post }) => ( // Reused from Category
  <Link to={`/post/${post._id}`} className="glass-card p-4 block">
    <h3 className="font-bold">{post.title}</h3>
    <p className="text-sm text-gray-600">Upvotes: {post.upvotes.length} • Comments: {post.comments.length}</p>
  </Link>
);

export default Post;