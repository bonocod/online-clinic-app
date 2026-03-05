// FILE: frontend/src/pages/Post.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import {
  ArrowLeft,
  ArrowUp,
  MessageCircle,
  ThumbsUp,
  Flag,
  Send,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

const Post = () => {
  const { id } = useParams()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [commentAnon, setCommentAnon] = useState(false)

  const [user, setUser] = useState(null)

  // Ask on professional post
  const [asking, setAsking] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [questionAnon, setQuestionAnon] = useState(false)
  const [questionLoading, setQuestionLoading] = useState(false)

  // Replies list for this post
  const [replies, setReplies] = useState([])
  const [repliesLoading, setRepliesLoading] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isProfessionalUser = useMemo(() => !!user && ['doctor', 'chw'].includes(user.role) && user.verified, [user])
  const isPatientUser = useMemo(() => !!user && user.role === 'patient', [user])

  const isProfessionalPost = useMemo(() => {
    const a = post?.author
    if (!a) return false
    return ['doctor', 'chw'].includes(a.role) && !!a.verified
  }, [post])

  const canAskOnPost = isPatientUser && isProfessionalPost

  const postCategoryId = useMemo(() => {
    const c = post?.category
    if (!c) return null
    return typeof c === 'string' ? c : c?._id || null
  }, [post])

  const backToCategoryLink = postCategoryId ? `/category/${postCategoryId}` : '/forum'

  const fetchAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [resPost, resUser] = await Promise.all([api.get(`/forum/posts/${id}`), api.get('/auth/profile')])
      setPost(resPost.data)
      setComments(resPost.data.comments || [])
      setUser(resUser.data)
    } catch (e) {
      setError('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const fetchReplies = async () => {
    try {
      setRepliesLoading(true)
      const res = await api.get(`/forum/posts/${id}/replies`)
      setReplies(Array.isArray(res.data) ? res.data : [])
    } catch {
      setReplies([])
    } finally {
      setRepliesLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (post?._id) fetchReplies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?._id])

  const updatePostLocal = (updates) => setPost((prev) => (prev ? { ...prev, ...updates } : prev))

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      const res = await api.post(`/forum/posts/${id}/comments`, {
        content: newComment,
        anonymous: commentAnon,
      })
      setComments((prev) => [...prev, res.data])
      setNewComment('')
      setCommentAnon(false)
    } catch (e) {
      alert(e.response?.data?.msg || 'Failed to add comment')
    }
  }

  const handleUpvote = async () => {
    try {
      const res = await api.post(`/forum/posts/${id}/upvote`)
      updatePostLocal({ upvotes: res.data.upvotes })
    } catch {
      alert('Upvote failed')
    }
  }

  const handleHelpful = async () => {
    try {
      const res = await api.post(`/forum/posts/${id}/mark-helpful`)
      updatePostLocal({ helpful: res.data.helpful })
    } catch (e) {
      alert(e.response?.data?.msg || 'Failed to mark helpful')
    }
  }

  const handleHighlight = async () => {
    try {
      const res = await api.post(`/forum/posts/${id}/highlight`)
      updatePostLocal({ highlighted: res.data.highlighted })
    } catch (e) {
      alert(e.response?.data?.msg || 'Failed to highlight')
    }
  }

  const handleReport = async () => {
    const reason = window.prompt('Please provide a reason for reporting this post:')
    if (!reason) return
    try {
      const res = await api.post(`/forum/posts/${id}/report`, { reason })
      updatePostLocal({ reports: res.data.reports })
      alert('Report submitted successfully. An admin will review it.')
    } catch {
      alert('Failed to submit report.')
    }
  }

  const submitQuestion = async () => {
    if (!questionText.trim()) return
    try {
      setQuestionLoading(true)
      await api.post(`/forum/posts/${id}/question`, { body: questionText, anonymous: questionAnon })
      setQuestionText('')
      setQuestionAnon(false)
      setAsking(false)
      alert('Question sent. It will appear publicly after a professional answers it.')
    } catch (e) {
      alert(e.response?.data?.msg || 'Failed to submit question')
    } finally {
      setQuestionLoading(false)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!post) return <p>Post not found</p>

  const upvoted = user && post.upvotes?.some((pid) => pid?.toString?.() === user._id?.toString?.())
  const helpfulMarked = user && post.helpful?.some((pid) => pid?.toString?.() === user._id?.toString?.())

  const canMarkHelpful =
    isProfessionalUser && post?.author?._id?.toString?.() !== user?._id?.toString?.()
  const canHighlightOwn =
    isProfessionalUser && post?.author?._id?.toString?.() === user?._id?.toString?.()

  const authorLabel = post.anonymous
    ? 'Anonymous'
    : post.author
      ? `${post.author.name} (${post.author.role}${post.author.verified ? ' • Verified' : ''})`
      : 'Unknown User'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6 max-w-4xl mx-auto">
      <Link to={backToCategoryLink} className="flex items-center text-primary">
        <ArrowLeft className="mr-2" /> Back
      </Link>

      {/* Disclaimer */}
      <div className="bg-yellow-100 p-4 rounded-lg flex items-center">
        <AlertTriangle className="mr-2 text-yellow-600" />
        <p className="text-yellow-800">
          This platform is not a replacement for professional, in-person medical care.
        </p>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold break-words">{post.title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              By {authorLabel} • {new Date(post.createdAt).toLocaleString()}
              {post.proType ? (
                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  {String(post.proType).toUpperCase()}
                </span>
              ) : null}
              {post.highlighted ? (
                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                  Highlighted
                </span>
              ) : null}
              {(post.helpful?.length || 0) > 0 ? (
                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                  Helpful
                </span>
              ) : null}
            </p>
          </div>

          {canAskOnPost && (
            <button
              onClick={() => setAsking((v) => !v)}
              className="px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center gap-2 text-sm"
              title="Ask a question on this professional post"
            >
              <HelpCircle size={16} />
              Ask
            </button>
          )}
        </div>

        <p className="mt-4 whitespace-pre-wrap text-gray-800">{post.body}</p>

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-700 items-center">
          <button onClick={handleUpvote} className={`flex items-center gap-1 ${upvoted ? 'text-blue-500' : ''}`}>
            <ArrowUp size={16} /> {post.upvotes?.length || 0}
          </button>

          <span className="flex items-center gap-1">
            <MessageCircle size={16} /> {comments.length}
          </span>

          {canMarkHelpful && (
            <button onClick={handleHelpful} className={`flex items-center gap-1 ${helpfulMarked ? 'text-green-700' : ''}`}>
              <ThumbsUp size={16} /> Helpful ({post.helpful?.length || 0})
            </button>
          )}

          {canHighlightOwn && (
            <button onClick={handleHighlight} className="flex items-center gap-1 text-yellow-700">
              <Sparkles size={16} /> {post.highlighted ? 'Unhighlight' : 'Highlight'}
            </button>
          )}

          <button onClick={handleReport} className="flex items-center gap-1 text-red-500">
            <Flag size={16} /> Report
          </button>
        </div>

        {/* Ask panel */}
        {asking && canAskOnPost && (
          <div className="mt-5 border rounded-xl p-4 bg-white/60">
            <p className="text-sm text-gray-700 mb-2">
              Ask a question about this professional post. The answer becomes public once answered.
            </p>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="input-field w-full min-h-[90px]"
              placeholder="Type your question..."
            />
            <label className="flex items-center gap-2 mt-2 text-sm">
              <input
                type="checkbox"
                checked={questionAnon}
                onChange={(e) => setQuestionAnon(e.target.checked)}
              />
              Ask anonymously
            </label>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={submitQuestion}
                disabled={questionLoading || !questionText.trim()}
                className="btn-primary"
              >
                {questionLoading ? 'Sending...' : 'Send Question'}
              </button>
              <button
                type="button"
                onClick={() => setAsking(false)}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Replies on this post */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Replies (Answered Questions)</h2>

        {repliesLoading ? (
          <p>Loading...</p>
        ) : replies.length === 0 ? (
          <p className="text-gray-600">No answered replies yet.</p>
        ) : (
          <div className="space-y-4">
            {replies.map((q) => {
              const askedByLabel = q.anonymous
                ? 'Anonymous'
                : q.askedBy
                  ? `${q.askedBy.name} (${q.askedBy.role}${q.askedBy.verified ? ' • Verified' : ''})`
                  : 'Unknown'

              const answeredByLabel = q.answeredBy
                ? `${q.answeredBy.name} (${q.answeredBy.role}${q.answeredBy.verified ? ' • Verified' : ''})`
                : 'Professional'

              return (
                <div key={q._id} className="border rounded-xl p-4 bg-white/60">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 size={16} className="text-green-600" />
                      Answered
                    </span>
                    <span>• Asked by {askedByLabel}</span>
                    <span>• Answered by {answeredByLabel}</span>
                  </div>

                  <div className="mt-3">
                    <p className="font-semibold">Question</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{q.body}</p>
                  </div>

                  <div className="mt-3">
                    <p className="font-semibold">Answer</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{q.answer}</p>
                  </div>

                  {q.answeredAt ? (
                    <p className="text-xs text-gray-500 mt-2">
                      Answered on {new Date(q.answeredAt).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Comments</h2>

        {comments.length === 0 ? (
          <p className="text-gray-600">No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c._id} className="border rounded-xl p-4 bg-white/60">
                <p className="text-sm text-gray-600">
                  By {c.anonymous ? 'Anonymous' : c.author?.name || 'Unknown'} ({c.author?.role || 'user'}
                  {c.author?.verified ? ' • Verified' : ''}) • {new Date(c.createdAt).toLocaleString()}
                  {c.isProfessional ? (
                    <span className="ml-2 text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                      Professional opinion
                    </span>
                  ) : null}
                </p>
                <p className="text-gray-800 whitespace-pre-wrap mt-2">{c.content}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleCommentSubmit} className="space-y-3 mt-5">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="input-field w-full min-h-[100px]"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={commentAnon} onChange={(e) => setCommentAnon(e.target.checked)} />
            Comment anonymously
          </label>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Send size={16} /> Post Comment
          </button>
        </form>
      </div>
    </motion.div>
  )
}

export default Post