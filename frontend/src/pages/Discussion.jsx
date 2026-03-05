// FILE: frontend/src/pages/Discussion.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import { ArrowLeft, AlertTriangle, Clock, Send, AlertCircle } from 'lucide-react'

const Discussion = () => {
  const { id } = useParams()

  const [user, setUser] = useState(null)
  const [discussion, setDiscussion] = useState(null)
  const [comments, setComments] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [commentText, setCommentText] = useState('')
  const [anon, setAnon] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const isAdmin = useMemo(() => !!user && user.role === 'admin', [user])
  const isCreator = useMemo(() => {
    if (!user || !discussion) return false
    return discussion?.createdBy?._id && discussion.createdBy._id.toString() === user._id.toString()
  }, [user, discussion])

  const canClose = isAdmin || isCreator
  const canComment = discussion?.status === 'open'

  const categoryId = useMemo(() => {
    const cid = discussion?.categoryId
    if (!cid) return null
    return typeof cid === 'string' ? cid : cid?._id || null
  }, [discussion])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [resUser, res] = await Promise.all([api.get('/auth/profile'), api.get(`/forum/discussions/${id}`)])
      setUser(resUser.data)
      setDiscussion(res.data.discussion)
      setComments(res.data.comments || [])
    } catch (e) {
      setError(e.response?.data?.msg || 'Failed to load discussion')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const submitComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    try {
      setSubmitting(true)
      const res = await api.post(`/forum/discussions/${id}/comments`, {
        content: commentText,
        anonymous: anon,
      })
      setComments((prev) => [...prev, res.data])
      setCommentText('')
      setAnon(false)
    } catch (e) {
      alert(e.response?.data?.msg || 'Failed to comment')
    } finally {
      setSubmitting(false)
    }
  }

  const closeDiscussion = async () => {
    if (!window.confirm('Close this discussion? It will become read-only.')) return
    try {
      await api.post(`/forum/discussions/${id}/close`)
      fetchData()
    } catch (e) {
      alert(e.response?.data?.msg || 'Failed to close discussion')
    }
  }

  const statusBadge =
    discussion?.status === 'waiting'
      ? 'Waiting approval'
      : discussion?.status === 'open'
        ? 'Open'
        : 'Closed'

  if (loading) return <p>Loading...</p>
  if (error)
    return (
      <p className="text-red-500 flex items-center">
        <AlertCircle className="mr-2" />
        {error}
      </p>
    )
  if (!discussion) return <p>Discussion not found</p>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6 max-w-4xl mx-auto">
      <Link to={categoryId ? `/category/${categoryId}?tab=discussions` : '/forum'} className="flex items-center text-primary">
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold break-words">{discussion.title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Status: <span className="font-medium">{statusBadge}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              By{' '}
              {discussion.anonymous
                ? 'Anonymous'
                : discussion.createdBy?.name
                  ? `${discussion.createdBy.name} (${discussion.createdBy.role}${discussion.createdBy.verified ? ' • Verified' : ''})`
                  : 'Unknown'}
              {' • '}
              {new Date(discussion.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {discussion.closeAt ? (
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <Clock size={14} />
                Closes: {new Date(discussion.closeAt).toLocaleString()}
              </div>
            ) : null}

            {canClose && discussion.status === 'open' && (
              <button onClick={closeDiscussion} className="btn-warning">
                Close discussion
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-gray-800">{discussion.body}</p>

        {discussion.status === 'waiting' && (
          <p className="text-sm text-yellow-700 mt-4">
            This discussion is waiting for admin approval.
          </p>
        )}
        {discussion.status === 'closed' && (
          <p className="text-sm text-gray-600 mt-4">
            This discussion is closed and read-only.
          </p>
        )}
      </div>

      {/* Comments */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Opinions / Comments</h2>

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

        {/* Comment form */}
        {canComment ? (
          <form onSubmit={submitComment} className="space-y-3 mt-5">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your opinion..."
              className="input-field w-full min-h-[110px]"
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
              Comment anonymously
            </label>
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={submitting || !commentText.trim()}>
              <Send size={16} />
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-600 mt-4">Comments are disabled for closed or waiting discussions.</p>
        )}
      </div>
    </motion.div>
  )
}

export default Discussion