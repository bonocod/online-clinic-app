// FILE: frontend/src/pages/CreatePost.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

const CreatePost = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const isGroup = location.pathname.includes('/group/')
  const qs = useMemo(() => new URLSearchParams(location.search), [location.search])
  const mode = (qs.get('mode') || 'post').toLowerCase() // post | discussion | ask

  const [user, setUser] = useState(null)
  const [category, setCategory] = useState(null)

  // Shared
  const [anonymous, setAnonymous] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Post
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [file, setFile] = useState(null)
  const [proType, setProType] = useState('general') // professionals only: advice|general|lesson

  // Discussion
  const [dTitle, setDTitle] = useState('')
  const [dBody, setDBody] = useState('')
  const [closeAt, setCloseAt] = useState('') // datetime-local

  // Ask-an-expert (general)
  const [qBody, setQBody] = useState('')

  const isProfessional = !!user && ['doctor', 'chw'].includes(user.role) && user.verified
  const isPatient = !!user && user.role === 'patient'

  const backLink = isGroup ? `/group/${id}` : `/category/${id}`

  useEffect(() => {
    api
      .get('/auth/profile')
      .then((res) => setUser(res.data))
      .catch(() => {})

    if (!isGroup) {
      api
        .get(`/forum/categories/${id}`)
        .then((res) => setCategory(res.data))
        .catch(() => {})
    }
  }, [id, isGroup])

  const categoryLocked = !!category?.isLocked

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (categoryLocked && !isGroup) {
        setError('This category is locked. You cannot create new content here.')
        return
      }

      // GROUP: only posts
      if (isGroup) {
        if (!title.trim() || !body.trim()) {
          setError('Title and content are required')
          return
        }

        const formData = new FormData()
        formData.append('title', title)
        formData.append('body', body)
        formData.append('groupId', id)
        formData.append('anonymous', anonymous)
        // professionals can still tag proType even in group feeds
        if (isProfessional) formData.append('proType', proType)
        if (file) formData.append('media', file)

        await api.post('/forum/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        navigate(`/group/${id}`)
        return
      }

      // CATEGORY modes
      if (mode === 'discussion') {
        if (!dTitle.trim() || !dBody.trim()) {
          setError('Title and description are required')
          return
        }

        const payload = {
          categoryId: id,
          title: dTitle,
          body: dBody,
          anonymous,
          closeAt: closeAt ? new Date(closeAt).toISOString() : null,
        }

        const res = await api.post('/forum/discussions', payload)
        setSuccess(res.data?.msg || 'Discussion submitted — waiting admin approval')
        // go back to category discussions tab
        setTimeout(() => navigate(`/category/${id}?tab=discussions`), 700)
        return
      }

      if (mode === 'ask') {
        if (!isPatient) {
          setError('Only normal users can submit general questions.')
          return
        }
        if (!qBody.trim()) {
          setError('Please type your question')
          return
        }

        const res = await api.post('/forum/questions', {
          categoryId: id,
          body: qBody,
          anonymous,
        })

        setSuccess(res.data?.msg || 'Question submitted')
        setTimeout(() => navigate(`/category/${id}?tab=replies`), 700)
        return
      }

      // default: mode === post
      if (!title.trim() || !body.trim()) {
        setError('Title and content are required')
        return
      }

      const formData = new FormData()
      formData.append('title', title)
      formData.append('body', body)
      formData.append('categoryId', id)
      formData.append('anonymous', anonymous)

      // professionals can choose proType (Advice/General/Lesson)
      if (isProfessional) formData.append('proType', proType)

      if (file) formData.append('media', file)

      await api.post('/forum/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      navigate(`/category/${id}?tab=posts`)
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to submit')
    }
  }

  const pageTitle = isGroup
    ? 'Create Post'
    : mode === 'discussion'
      ? 'Start a Discussion'
      : mode === 'ask'
        ? 'Ask an Expert'
        : 'Create Post'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6">
        <Link to={backLink} className="flex items-center text-primary">
          <ArrowLeft className="mr-2" />
          Back
        </Link>
        <h1 className="text-3xl font-bold text-dark">{pageTitle}</h1>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-100 p-4 rounded-lg flex items-center mb-6">
        <AlertTriangle className="mr-2 text-yellow-600" />
        <p className="text-yellow-800">
          This platform is not a replacement for professional, in-person medical care.
        </p>
      </div>

      {categoryLocked && !isGroup && (
        <div className="bg-red-100 p-4 rounded-lg mb-6">
          <p className="text-red-700 font-medium">
            This category is locked. New posts, discussions, and questions are disabled.
          </p>
        </div>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="glass-card space-y-4">
        {/* MODE SWITCH hint */}
        {!isGroup && (
          <div className="flex gap-2 flex-wrap">
            <Link
              to={`/category/${id}/create-post?mode=post`}
              className={`px-4 py-2 rounded-full ${mode === 'post' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              Post
            </Link>
            <Link
              to={`/category/${id}/create-post?mode=discussion`}
              className={`px-4 py-2 rounded-full ${mode === 'discussion' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              Discussion
            </Link>
            <Link
              to={`/category/${id}/create-post?mode=ask`}
              className={`px-4 py-2 rounded-full ${mode === 'ask' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              Ask
            </Link>
          </div>
        )}

        {/* POST */}
        {(isGroup || mode === 'post') && (
          <>
            {isProfessional && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Professional Post Type</label>
                <select
                  value={proType}
                  onChange={(e) => setProType(e.target.value)}
                  className="input-field"
                >
                  <option value="general">General</option>
                  <option value="advice">Advice</option>
                  <option value="lesson">Lesson</option>
                </select>
              </div>
            )}

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="input-field"
              required
              disabled={!isGroup && categoryLocked}
            />

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your post..."
              className="input-field min-h-[140px]"
              required
              disabled={!isGroup && categoryLocked}
            />

            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={!isGroup && categoryLocked}
            />
          </>
        )}

        {/* DISCUSSION */}
        {!isGroup && mode === 'discussion' && (
          <>
            <input
              value={dTitle}
              onChange={(e) => setDTitle(e.target.value)}
              placeholder="Discussion title"
              className="input-field"
              required
              disabled={categoryLocked}
            />

            <textarea
              value={dBody}
              onChange={(e) => setDBody(e.target.value)}
              placeholder="Describe the topic and what people should discuss..."
              className="input-field min-h-[160px]"
              required
              disabled={categoryLocked}
            />

            <div>
              <label className="block text-sm text-gray-600 mb-1">Close time (optional)</label>
              <input
                type="datetime-local"
                value={closeAt}
                onChange={(e) => setCloseAt(e.target.value)}
                className="input-field"
                disabled={categoryLocked}
              />
              <p className="text-xs text-gray-500 mt-1">
                If set, the discussion will auto-close at that time.
              </p>
            </div>

            <p className="text-sm text-gray-700">
              When you submit, the discussion enters <b>waiting</b> until an admin approves it.
            </p>
          </>
        )}

        {/* ASK (General Ask-an-Expert) */}
        {!isGroup && mode === 'ask' && (
          <>
            {!isPatient ? (
              <p className="text-sm text-red-600">
                Only normal users can submit general questions.
              </p>
            ) : (
              <>
                <textarea
                  value={qBody}
                  onChange={(e) => setQBody(e.target.value)}
                  placeholder="Ask a general health question (not tied to a post)..."
                  className="input-field min-h-[160px]"
                  required
                  disabled={categoryLocked}
                />
                <p className="text-xs text-gray-500">
                  Your question becomes visible to everyone once answered.
                </p>
              </>
            )}
          </>
        )}

        {/* Anonymous */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            disabled={!isGroup && categoryLocked}
          />
          Post anonymously
        </label>

        <button type="submit" className="btn-primary" disabled={!isGroup && categoryLocked}>
          Submit
        </button>
      </form>
    </motion.div>
  )
}

export default CreatePost