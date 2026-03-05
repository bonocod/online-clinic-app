// FILE: frontend/src/pages/professional/CHWConsole.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../services/api'
import {
  AlertCircle,
  Clock,
  Activity,
  HelpCircle,
  ArrowUpCircle,
  Send,
} from 'lucide-react'

const CHWConsole = () => {
  const [tab, setTab] = useState('questions') // questions | attention | highlights | stats
  const [filter, setFilter] = useState('general') // general | myposts

  const [questions, setQuestions] = useState([])
  const [attentionPosts, setAttentionPosts] = useState([])
  const [highlights, setHighlights] = useState([])
  const [stats, setStats] = useState({ answeredQuestions: 0, avgResponseMinutes: 0 })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // answer UI
  const [answeringId, setAnsweringId] = useState(null)
  const [answerText, setAnswerText] = useState('')
  const [claiming, setClaiming] = useState(false)
  const [answering, setAnswering] = useState(false)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, filter])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      if (tab === 'questions') {
        const res = await api.get(`/professional/questions?filter=${filter}&status=unanswered`)
        setQuestions(Array.isArray(res.data) ? res.data : [])
      }
      if (tab === 'attention') {
        const res = await api.get('/professional/posts-needing-attention')
        setAttentionPosts(Array.isArray(res.data) ? res.data : [])
      }
      if (tab === 'highlights') {
        const res = await api.get('/professional/discussion-highlights')
        setHighlights(Array.isArray(res.data) ? res.data : [])
      }
      if (tab === 'stats') {
        const res = await api.get('/professional/stats')
        setStats(res.data || { answeredQuestions: 0, avgResponseMinutes: 0 })
      }
    } catch (e) {
      setError(e.response?.data?.msg || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const claimQuestion = async (id) => {
    setClaiming(true)
    try {
      await api.post(`/professional/questions/${id}/claim`)
      await fetchData()
    } catch (e) {
      alert(e.response?.data?.msg || 'Claim failed')
    } finally {
      setClaiming(false)
    }
  }

  const submitAnswer = async (id) => {
    if (!answerText.trim()) return
    setAnswering(true)
    try {
      await api.post(`/professional/questions/${id}/answer`, { answer: answerText })
      setAnswerText('')
      setAnsweringId(null)
      await fetchData()
      alert('Answered')
    } catch (e) {
      alert(e.response?.data?.msg || 'Answer failed')
    } finally {
      setAnswering(false)
    }
  }

  const escalateToDoctor = async (postId) => {
    try {
      await api.post(`/forum/posts/${postId}/escalate`)
      alert('Escalated to doctors')
      fetchData()
    } catch (e) {
      alert(e.response?.data?.msg || 'Escalation failed')
    }
  }

  const tabs = [
    { id: 'questions', label: 'Unanswered Questions', icon: HelpCircle },
    { id: 'attention', label: 'Posts Needing Attention', icon: AlertCircle },
    { id: 'highlights', label: 'Discussion Highlights', icon: Clock },
    { id: 'stats', label: 'Stats', icon: Activity },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">CHW Console</h1>
      <p>Professional dashboard</p>

      <div className="flex gap-3 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full flex items-center gap-2 ${
              tab === t.id ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            <t.icon size={18} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'questions' && (
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('general')}
            className={`px-4 py-2 rounded-full ${filter === 'general' ? 'bg-gray-900 text-white' : 'bg-gray-200'}`}
          >
            General
          </button>
          <button
            onClick={() => setFilter('myposts')}
            className={`px-4 py-2 rounded-full ${filter === 'myposts' ? 'bg-gray-900 text-white' : 'bg-gray-200'}`}
          >
            My Posts
          </button>
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Questions */}
      {tab === 'questions' && (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q._id} className="glass-card p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-bold">Question</p>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                  {q.claimActive ? 'claimed' : 'unclaimed'}
                </span>
              </div>

              {q.postId?._id ? (
                <p className="text-sm text-gray-600 mt-1">
                  On post:{' '}
                  <Link to={`/post/${q.postId._id}`} className="text-primary underline">
                    {q.postId.title}
                  </Link>
                </p>
              ) : (
                <p className="text-sm text-gray-600 mt-1">General queue</p>
              )}

              <p className="mt-3 text-gray-800 whitespace-pre-wrap">{q.body}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => claimQuestion(q._id)}
                  className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
                  disabled={claiming}
                >
                  {claiming ? 'Claiming...' : 'Claim'}
                </button>

                <button
                  onClick={() => setAnsweringId((v) => (v === q._id ? null : q._id))}
                  className="btn-primary"
                >
                  Answer
                </button>
              </div>

              {answeringId === q._id && (
                <div className="mt-4 border rounded-xl p-3 bg-white/60">
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    className="input-field w-full min-h-[120px]"
                    placeholder="Write your answer..."
                  />
                  <button
                    onClick={() => submitAnswer(q._id)}
                    className="btn-primary mt-3 flex items-center gap-2"
                    disabled={answering || !answerText.trim()}
                  >
                    <Send size={16} />
                    {answering ? 'Submitting...' : 'Submit Answer'}
                  </button>
                </div>
              )}
            </div>
          ))}
          {questions.length === 0 && !loading && <p>No unanswered questions.</p>}
        </div>
      )}

      {/* Attention posts */}
      {tab === 'attention' && (
        <div className="space-y-4">
          {attentionPosts.map((p) => (
            <div key={p._id} className="glass-card p-4">
              <h3 className="font-bold">{p.title}</h3>
              <p className="text-sm text-gray-600">
                Category: {p.category?.name || 'Unknown'} • {new Date(p.createdAt).toLocaleString()}
              </p>
              <p className="mt-2 text-gray-800 whitespace-pre-wrap">
                {p.body?.length > 200 ? `${p.body.slice(0, 200)}...` : p.body}
              </p>
              <div className="flex gap-2 mt-3">
                <Link to={`/post/${p._id}`} className="btn-primary">
                  Open
                </Link>
                <button onClick={() => escalateToDoctor(p._id)} className="btn-warning flex items-center gap-2">
                  <ArrowUpCircle size={16} /> Escalate to Doctor
                </button>
              </div>
            </div>
          ))}
          {attentionPosts.length === 0 && !loading && <p>No posts needing attention.</p>}
        </div>
      )}

      {/* Highlights */}
      {tab === 'highlights' && (
        <div className="space-y-4">
          {highlights.map((c) => (
            <div key={c._id} className="glass-card p-4">
              <p className="text-sm text-gray-600">
                Discussion:{' '}
                <Link to={`/discussion/${c.discussion?._id}`} className="text-primary underline">
                  {c.discussion?.title || 'Open'}
                </Link>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                By {c.author?.name || 'Unknown'} • {new Date(c.createdAt).toLocaleString()}
              </p>
              <p className="mt-2 text-gray-800 whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
          {highlights.length === 0 && !loading && <p>No highlights yet.</p>}
        </div>
      )}

      {/* Stats */}
      {tab === 'stats' && (
        <div className="glass-card p-4 space-y-2">
          <p>Answered questions: {stats.answeredQuestions}</p>
          <p>Average response time: {stats.avgResponseMinutes} minutes</p>
        </div>
      )}

      <Link to="/dashboard" className="btn-primary">
        Go to User Dashboard
      </Link>
    </motion.div>
  )
}

export default CHWConsole