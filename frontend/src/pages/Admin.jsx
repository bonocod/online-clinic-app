// FILE: frontend/src/pages/Admin.jsx
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import {
  AlertCircle,
  UserPlus,
  Flag,
  Video,
  Upload,
  Film,
  CheckCircle2,
  XCircle,
  Shield,
  Lock,
  Unlock,
  MessageSquare,
} from 'lucide-react'

const Admin = () => {
  const [tab, setTab] = useState('reported-posts')

  // Existing (legacy)
  const [reportedPosts, setReportedPosts] = useState([])

  // New moderation queue
  const [reports, setReports] = useState([])

  // Professionals
  const [newProf, setNewProf] = useState({ name: '', email: '', password: '', role: 'doctor' })
  const [pendingPros, setPendingPros] = useState([])

  // Discussions approval
  const [pendingDiscussions, setPendingDiscussions] = useState([])

  // Category lock/unlock
  const [forumCategories, setForumCategories] = useState([])

  // Videos (existing)
  const [videos, setVideos] = useState([])
  const [categories, setCategories] = useState([])
  const [newVideo, setNewVideo] = useState({ title: '', description: '', category: '', file: null })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewURL, setPreviewURL] = useState('')

  // UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setError('')
    setSuccess('')
    if (tab === 'reported-posts') fetchReportedPosts()
    if (tab === 'reports') fetchReports()
    if (tab === 'professionals') fetchPendingProfessionals()
    if (tab === 'discussions') fetchPendingDiscussions()
    if (tab === 'categories') fetchForumCategories()
    if (tab === 'videos') {
      fetchVideos()
      fetchVideoCategories()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  // ----------------- Fetchers -----------------
  const fetchReportedPosts = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/reported-posts')
      setReportedPosts(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Failed to load reported posts')
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/reports?resolved=false')
      setReports(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Failed to load moderation reports')
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingProfessionals = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/professionals/pending')
      setPendingPros(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Failed to load pending professionals')
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingDiscussions = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/discussions?status=waiting')
      setPendingDiscussions(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Failed to load pending discussions')
    } finally {
      setLoading(false)
    }
  }

  const fetchForumCategories = async () => {
    setLoading(true)
    try {
      const res = await api.get('/forum/categories')
      setForumCategories(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Failed to load forum categories')
    } finally {
      setLoading(false)
    }
  }

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const res = await api.get('/videos')
      setVideos(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  const fetchVideoCategories = async () => {
    try {
      const res = await api.get('/categories')
      setCategories(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Failed to load video categories')
    }
  }

  // ----------------- Actions -----------------
  const handleCreateProf = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.post('/admin/users', newProf)
      setSuccess('Professional created. Verification is required before access.')
      setNewProf({ name: '', email: '', password: '', role: 'doctor' })
      fetchPendingProfessionals()
    } catch (err) {
      setError(err.response?.data?.msg || 'Creation failed')
    }
  }

  const verifyProfessional = async (id) => {
    setError('')
    setSuccess('')
    try {
      await api.patch(`/admin/professionals/${id}/verify`)
      setSuccess('Professional verified')
      fetchPendingProfessionals()
    } catch (err) {
      setError(err.response?.data?.msg || 'Verification failed')
    }
  }

  const approveDiscussion = async (id) => {
    setError('')
    setSuccess('')
    try {
      await api.post(`/admin/discussions/${id}/approve`)
      setSuccess('Discussion approved')
      fetchPendingDiscussions()
    } catch (err) {
      setError(err.response?.data?.msg || 'Approve failed')
    }
  }

  const rejectDiscussion = async (id) => {
    setError('')
    setSuccess('')
    if (!window.confirm('Reject and remove this discussion request?')) return
    try {
      await api.post(`/admin/discussions/${id}/reject`)
      setSuccess('Discussion rejected')
      fetchPendingDiscussions()
    } catch (err) {
      setError(err.response?.data?.msg || 'Reject failed')
    }
  }

  const resolveModerationReport = async (id) => {
    const note = window.prompt('Resolution note (optional):') || ''
    setError('')
    setSuccess('')
    try {
      await api.patch(`/admin/reports/${id}/resolve`, { note })
      setSuccess('Report resolved')
      fetchReports()
    } catch (err) {
      setError(err.response?.data?.msg || 'Resolve failed')
    }
  }

  const lockCategory = async (id) => {
    setError('')
    setSuccess('')
    try {
      await api.patch(`/admin/categories/${id}/lock`)
      setSuccess('Category locked')
      fetchForumCategories()
    } catch (err) {
      setError(err.response?.data?.msg || 'Lock failed')
    }
  }

  const unlockCategory = async (id) => {
    setError('')
    setSuccess('')
    try {
      await api.patch(`/admin/categories/${id}/unlock`)
      setSuccess('Category unlocked')
      fetchForumCategories()
    } catch (err) {
      setError(err.response?.data?.msg || 'Unlock failed')
    }
  }

  // Legacy reported posts actions
  const handleResolveLegacy = async (postId) => {
    try {
      await api.patch(`/admin/posts/${postId}/resolve`)
      fetchReportedPosts()
    } catch {
      setError('Resolve failed')
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    try {
      await api.delete(`/admin/posts/${postId}`)
      fetchReportedPosts()
    } catch {
      setError('Delete failed')
    }
  }

  // Videos
  const handleVideoSelect = (e) => {
    const file = e.target.files[0]
    setNewVideo({ ...newVideo, file })
    setPreviewURL(file ? URL.createObjectURL(file) : '')
  }

  const handleUploadVideo = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setUploadProgress(0)

    if (!newVideo.file) {
      setError('Please select a video file')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('title', newVideo.title)
    formData.append('description', newVideo.description)
    formData.append('category', newVideo.category)
    formData.append('video', newVideo.file)

    try {
      await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percent)
        },
      })
      setSuccess('Video uploaded successfully!')
      setNewVideo({ title: '', description: '', category: '', file: null })
      setPreviewURL('')
      setUploadProgress(0)
      fetchVideos()
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return
    try {
      await api.delete(`/videos/${videoId}`)
      fetchVideos()
    } catch {
      setError('Delete failed')
    }
  }

  const tabs = [
    { id: 'reported-posts', label: 'Reported Posts (Legacy)', icon: Flag },
    { id: 'reports', label: 'Moderation Queue', icon: MessageSquare },
    { id: 'discussions', label: 'Pending Discussions', icon: CheckCircle2 },
    { id: 'professionals', label: 'Verify Professionals', icon: Shield },
    { id: 'categories', label: 'Lock Categories', icon: Lock },
    { id: 'create-prof', label: 'Create Professional', icon: UserPlus },
    { id: 'videos', label: 'Manage Videos', icon: Video },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

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

      {loading && <p>Loading...</p>}
      {error && (
        <p className="text-red-500 mb-4 flex items-center">
          <AlertCircle className="mr-2" />
          {error}
        </p>
      )}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      {/* ----------------- REPORTED POSTS (Legacy) ----------------- */}
      {tab === 'reported-posts' && (
        <div className="space-y-4">
          {reportedPosts.map((post) => (
            <div key={post._id} className="glass-card p-4">
              <h3 className="font-bold">{post.title}</h3>
              <p className="text-sm text-gray-600">Reports: {post.reports.length}</p>
              <div className="space-y-2">
                {post.reports.map((r, idx) => (
                  <p key={idx} className="text-sm">
                    Reason: {r.reason} by {r.user?.name || 'Unknown'}
                  </p>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleResolveLegacy(post._id)} className="btn-success">
                  Resolve
                </button>
                <button onClick={() => handleDeletePost(post._id)} className="btn-danger">
                  Delete Post
                </button>
              </div>
            </div>
          ))}
          {reportedPosts.length === 0 && <p>No reported posts.</p>}
        </div>
      )}

      {/* ----------------- MODERATION QUEUE (Unified) ----------------- */}
      {tab === 'reports' && (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r._id} className="glass-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold">
                  {r.contentType.toUpperCase()} • {String(r.contentId)}
                </p>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                  unresolved
                </span>
              </div>

              <p className="text-sm text-gray-700 mt-2">{r.reason}</p>
              <p className="text-xs text-gray-500 mt-2">
                Reported by: {r.reportedBy?.name || 'Unknown'} • {new Date(r.createdAt).toLocaleString()}
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => resolveModerationReport(r._id)}
                  className="btn-success flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> Resolve
                </button>
              </div>
            </div>
          ))}
          {reports.length === 0 && <p>No moderation reports in queue.</p>}
        </div>
      )}

      {/* ----------------- PENDING DISCUSSIONS ----------------- */}
      {tab === 'discussions' && (
        <div className="space-y-4">
          {pendingDiscussions.map((d) => (
            <div key={d._id} className="glass-card p-4">
              <h3 className="font-bold">{d.title}</h3>
              <p className="text-sm text-gray-600">
                Category: {d.categoryId} • By {d.createdBy?.name || 'Unknown'} • {new Date(d.createdAt).toLocaleString()}
              </p>
              <p className="mt-2 text-gray-800 whitespace-pre-wrap">{d.body}</p>

              {d.closeAt ? (
                <p className="text-xs text-gray-500 mt-2">
                  CloseAt: {new Date(d.closeAt).toLocaleString()}
                </p>
              ) : null}

              <div className="flex gap-2 mt-3">
                <button onClick={() => approveDiscussion(d._id)} className="btn-success flex items-center gap-2">
                  <CheckCircle2 size={16} /> Approve
                </button>
                <button onClick={() => rejectDiscussion(d._id)} className="btn-danger flex items-center gap-2">
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
          {pendingDiscussions.length === 0 && <p>No pending discussions.</p>}
        </div>
      )}

      {/* ----------------- VERIFY PROFESSIONALS ----------------- */}
      {tab === 'professionals' && (
        <div className="space-y-4">
          {pendingPros.map((p) => (
            <div key={p._id} className="glass-card p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold">{p.name}</p>
                <p className="text-sm text-gray-600">
                  {p.email} • role: {p.role} • created: {new Date(p.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => verifyProfessional(p._id)} className="btn-primary flex items-center gap-2">
                <Shield size={16} /> Verify
              </button>
            </div>
          ))}
          {pendingPros.length === 0 && <p>No pending professionals.</p>}
        </div>
      )}

      {/* ----------------- LOCK / UNLOCK CATEGORIES ----------------- */}
      {tab === 'categories' && (
        <div className="space-y-4">
          {forumCategories.map((c) => (
            <div key={c._id} className="glass-card p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold">{c.name}</p>
                <p className="text-sm text-gray-600">{c.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Locked: {c.isLocked ? 'Yes' : 'No'}
                </p>
              </div>

              {c.isLocked ? (
                <button onClick={() => unlockCategory(c._id)} className="btn-primary flex items-center gap-2">
                  <Unlock size={16} /> Unlock
                </button>
              ) : (
                <button onClick={() => lockCategory(c._id)} className="btn-danger flex items-center gap-2">
                  <Lock size={16} /> Lock
                </button>
              )}
            </div>
          ))}
          {forumCategories.length === 0 && <p>No forum categories found.</p>}
        </div>
      )}

      {/* ----------------- CREATE PROFESSIONAL ----------------- */}
      {tab === 'create-prof' && (
        <form onSubmit={handleCreateProf} className="glass-card p-4 space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={newProf.name}
            onChange={(e) => setNewProf({ ...newProf, name: e.target.value })}
            className="input-field"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newProf.email}
            onChange={(e) => setNewProf({ ...newProf, email: e.target.value })}
            className="input-field"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newProf.password}
            onChange={(e) => setNewProf({ ...newProf, password: e.target.value })}
            className="input-field"
            required
          />
          <select
            value={newProf.role}
            onChange={(e) => setNewProf({ ...newProf, role: e.target.value })}
            className="input-field"
          >
            <option value="doctor">Doctor</option>
            <option value="chw">CHW</option>
          </select>
          <button type="submit" className="btn-primary">
            Create
          </button>
        </form>
      )}

      {/* ----------------- VIDEO MANAGEMENT ----------------- */}
      {tab === 'videos' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold mb-4 text-center text-dark flex items-center justify-center">
            <Film className="mr-2" /> Admin - Upload Video
          </h1>

          <form onSubmit={handleUploadVideo} className="glass-card p-4 space-y-4">
            <input
              type="text"
              placeholder="Video Title"
              value={newVideo.title}
              onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
              className="input-field"
              required
            />
            <textarea
              placeholder="Description"
              value={newVideo.description}
              onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
              className="input-field min-h-[100px]"
            />
            <select
              value={newVideo.category}
              onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <div className="relative">
              <Upload className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input type="file" accept="video/*" onChange={handleVideoSelect} className="input-field pl-10" required />
            </div>

            {previewURL && (
              <video controls className="w-full mt-2 rounded-md">
                <source src={previewURL} type={newVideo.file?.type} />
              </video>
            )}

            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div className="bg-primary h-3 rounded-full" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? `Uploading... ${uploadProgress}%` : 'Upload Video'}
            </button>
          </form>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Existing Videos</h2>
            {videos.map((video) => (
              <div key={video._id} className="glass-card p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{video.title}</h3>
                  <p className="text-sm text-gray-600">{video.description}</p>
                </div>
                <button onClick={() => handleDeleteVideo(video._id)} className="btn-danger">
                  Delete
                </button>
              </div>
            ))}
            {videos.length === 0 && <p>No videos yet.</p>}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default Admin