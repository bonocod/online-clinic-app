// FILE: frontend/src/pages/Category.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import {
  AlertCircle,
  ArrowLeft,
  ArrowUp,
  MessageCircle,
  ThumbsUp,
  Flag,
  Plus,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react'

const Category = () => {
  const { id } = useParams()
  const location = useLocation()

  const qs = useMemo(() => new URLSearchParams(location.search), [location.search])
  const initialTab = qs.get('tab') || 'posts'

  const [category, setCategory] = useState(null)
  const [user, setUser] = useState(null)

  // Tabs required: Posts / Discussions / Replies
  const [tab, setTab] = useState(['posts', 'discussions', 'replies'].includes(initialTab) ? initialTab : 'posts')

  // Posts list state
  const [postSort, setPostSort] = useState('recent') // recent | popular
  const [posts, setPosts] = useState([])
  const [pinnedPosts, setPinnedPosts] = useState([])
  const [postsPage, setPostsPage] = useState(1)
  const [postsHasMore, setPostsHasMore] = useState(true)

  // Discussions state
  const [openDiscussions, setOpenDiscussions] = useState([])
  const [closedDiscussions, setClosedDiscussions] = useState([])

  // Replies state
  const [replies, setReplies] = useState([])
  const [repliesPage, setRepliesPage] = useState(1)
  const [repliesHasMore, setRepliesHasMore] = useState(true)

  // Common
  const [relatedCircles, setRelatedCircles] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const limit = 10

  useEffect(() => {
    api
      .get('/auth/profile')
      .then((res) => setUser(res.data))
      .catch(() => {})
  }, [])

  // Fetch category + circles once
  useEffect(() => {
    const fetchBase = async () => {
      try {
        setLoading(true)
        setError('')

        const resCat = await api.get(`/forum/categories/${id}`)
        setCategory(resCat.data)

        const resCircles = await api.get(`/forum/categories/${id}/circles`)
        setRelatedCircles(resCircles.data || [])
      } catch (e) {
        setError('Failed to load category')
      } finally {
        setLoading(false)
      }
    }
    fetchBase()
  }, [id])

  // Fetch tab data
  useEffect(() => {
    if (!id) return
    if (tab === 'posts') fetchPosts(true)
    if (tab === 'discussions') fetchDiscussions()
    if (tab === 'replies') fetchReplies(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, tab, postSort])

  const changeTab = (newTab) => {
    setTab(newTab)
    setError('')
  }

  const fetchPosts = async (reset = false) => {
    try {
      if (reset) {
        setPosts([])
        setPinnedPosts([])
        setPostsPage(1)
        setPostsHasMore(true)
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      // pinned posts (admin pinned)
      const resPinned = await api.get(`/forum/categories/${id}/posts?pinned=true`)
      setPinnedPosts(Array.isArray(resPinned.data) ? resPinned.data : [])

      // main list
      const page = reset ? 1 : postsPage
      const sortTab = postSort === 'popular' ? 'popular' : 'recent'
      const resPosts = await api.get(`/forum/categories/${id}/posts?tab=${sortTab}&page=${page}&limit=${limit}`)

      const data = Array.isArray(resPosts.data) ? resPosts.data : []
      setPosts((prev) => (reset ? data : [...prev, ...data]))
      setPostsHasMore(data.length === limit)
    } catch (e) {
      setError('Failed to load posts')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMorePosts = async () => {
    if (!postsHasMore || loadingMore) return
    const next = postsPage + 1
    setPostsPage(next)
    try {
      setLoadingMore(true)
      const sortTab = postSort === 'popular' ? 'popular' : 'recent'
      const resPosts = await api.get(`/forum/categories/${id}/posts?tab=${sortTab}&page=${next}&limit=${limit}`)
      const data = Array.isArray(resPosts.data) ? resPosts.data : []
      setPosts((prev) => [...prev, ...data])
      setPostsHasMore(data.length === limit)
    } catch (e) {
      setError('Failed to load more posts')
    } finally {
      setLoadingMore(false)
    }
  }

  const fetchDiscussions = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get(`/forum/categories/${id}/discussions`)
      setOpenDiscussions(Array.isArray(res.data?.open) ? res.data.open : [])
      setClosedDiscussions(Array.isArray(res.data?.closed) ? res.data.closed : [])
    } catch (e) {
      setError('Failed to load discussions')
    } finally {
      setLoading(false)
    }
  }

  const fetchReplies = async (reset = false) => {
    try {
      if (reset) {
        setReplies([])
        setRepliesPage(1)
        setRepliesHasMore(true)
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const page = reset ? 1 : repliesPage
      const res = await api.get(`/forum/categories/${id}/replies?page=${page}&limit=${limit}`)
      const data = Array.isArray(res.data) ? res.data : []
      setReplies((prev) => (reset ? data : [...prev, ...data]))
      setRepliesHasMore(data.length === limit)
    } catch (e) {
      setError('Failed to load replies')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreReplies = async () => {
    if (!repliesHasMore || loadingMore) return
    const next = repliesPage + 1
    setRepliesPage(next)
    try {
      setLoadingMore(true)
      const res = await api.get(`/forum/categories/${id}/replies?page=${next}&limit=${limit}`)
      const data = Array.isArray(res.data) ? res.data : []
      setReplies((prev) => [...prev, ...data])
      setRepliesHasMore(data.length === limit)
    } catch (e) {
      setError('Failed to load more replies')
    } finally {
      setLoadingMore(false)
    }
  }

  const handleJoinCircle = async (circleId) => {
    try {
      await api.post(`/forum/groups/${circleId}/join`)
      alert('Joined successfully')
    } catch {
      alert('Failed to join')
    }
  }

  const updatePost = (postId, updates) => {
    setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, ...updates } : p)))
    setPinnedPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, ...updates } : p)))
  }

  const isProfessionalUser = !!user && ['doctor', 'chw'].includes(user.role) && user.verified
  const isPatientUser = !!user && user.role === 'patient'
  const categoryLocked = !!category?.isLocked

  const isProfessionalPost = (post) => {
    const a = post?.author
    if (!a) return false
    return ['doctor', 'chw'].includes(a.role) && !!a.verified
  }

  const PostCard = ({ post }) => {
    const upvoted = user && post.upvotes?.some((pid) => pid?.toString?.() === user._id?.toString?.())
    const helpfulMarked = user && post.helpful?.some((pid) => pid?.toString?.() === user._id?.toString?.())

    const [comments, setComments] = useState(post.comments || [])
    const [commentText, setCommentText] = useState('')
    const [asking, setAsking] = useState(false)
    const [questionText, setQuestionText] = useState('')
    const [questionAnon, setQuestionAnon] = useState(false)
    const [questionLoading, setQuestionLoading] = useState(false)

    const proPost = isProfessionalPost(post)

    const canAskOnPost = isPatientUser && proPost
    const canMarkHelpful = isProfessionalUser && post?.author?._id?.toString?.() !== user?._id?.toString?.()
    const canHighlightOwn = isProfessionalUser && post?.author?._id?.toString?.() === user?._id?.toString?.()

    const handleUpvote = async () => {
      const res = await api.post(`/forum/posts/${post._id}/upvote`)
      updatePost(post._id, { upvotes: res.data.upvotes })
    }

    const handleHelpful = async () => {
      const res = await api.post(`/forum/posts/${post._id}/mark-helpful`)
      updatePost(post._id, { helpful: res.data.helpful })
    }

    const handleHighlight = async () => {
      const res = await api.post(`/forum/posts/${post._id}/highlight`)
      updatePost(post._id, { highlighted: res.data.highlighted })
    }

    const handleReport = async () => {
      const reason = window.prompt('Reason for reporting?')
      if (!reason) return
      await api.post(`/forum/posts/${post._id}/report`, { reason })
      alert('Reported successfully')
    }

    const handleComment = async (e) => {
      e.preventDefault()
      if (!commentText.trim()) return
      const res = await api.post(`/forum/posts/${post._id}/comments`, { content: commentText })
      setComments([...comments, res.data])
      setCommentText('')
    }

    const submitQuestion = async () => {
      if (!questionText.trim()) return
      try {
        setQuestionLoading(true)
        await api.post(`/forum/posts/${post._id}/question`, {
          body: questionText,
          anonymous: questionAnon,
        })
        setQuestionText('')
        setQuestionAnon(false)
        setAsking(false)
        alert('Question sent to the professional. It will appear in Replies after it is answered.')
      } catch (e) {
        alert(e.response?.data?.msg || 'Failed to submit question')
      } finally {
        setQuestionLoading(false)
      }
    }

    const authorLabel = post.anonymous
      ? 'Anonymous'
      : post.author
        ? `${post.author.name} (${post.author.role}${post.author.verified ? ' • Verified' : ''})`
        : 'Unknown User'

    const proBadge = proPost ? (
      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
        Professional
      </span>
    ) : null

    const helpfulBadge =
      (post.helpful?.length || 0) > 0 ? (
        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
          Helpful
        </span>
      ) : null

    const highlightBadge =
      post.highlighted ? (
        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
          Highlighted
        </span>
      ) : null

    const proTypeBadge =
      post.proType ? (
        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
          {String(post.proType).toUpperCase()}
        </span>
      ) : null

    const cardClass =
      proPost
        ? 'glass-card p-4 border border-indigo-200 bg-white/50'
        : 'glass-card p-4'

    return (
      <div className={cardClass}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/post/${post._id}`} className="text-xl font-bold hover:text-primary break-words">
              {post.title}
            </Link>
            <p className="text-sm text-gray-600 mt-1">
              {authorLabel}
              {proBadge}
              {proTypeBadge}
              {highlightBadge}
              {helpfulBadge}
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

        {/* Post body preview */}
        <p className="mt-3 text-gray-700 whitespace-pre-wrap">
          {post.body?.length > 280 ? `${post.body.slice(0, 280)}...` : post.body}
        </p>

        {/* Actions row */}
        <div className="flex flex-wrap gap-4 mt-3 text-sm items-center">
          <button
            onClick={handleUpvote}
            className={upvoted ? 'text-blue-500 flex items-center gap-1' : 'flex items-center gap-1'}
          >
            <ArrowUp size={16} />
            {post.upvotes?.length || 0}
          </button>

          {canMarkHelpful && (
            <button
              onClick={handleHelpful}
              className={helpfulMarked ? 'text-green-600 flex items-center gap-1' : 'flex items-center gap-1'}
            >
              <ThumbsUp size={16} />
              Helpful ({post.helpful?.length || 0})
            </button>
          )}

          {canHighlightOwn && (
            <button onClick={handleHighlight} className="flex items-center gap-1 text-yellow-700">
              <Sparkles size={16} />
              {post.highlighted ? 'Unhighlight' : 'Highlight'}
            </button>
          )}

          <span className="flex items-center gap-1">
            <MessageCircle size={16} />
            {comments.length}
          </span>

          <button onClick={handleReport} className="flex items-center gap-1 text-red-500">
            <Flag size={16} />
            Report
          </button>
        </div>

        {/* Ask question inline panel */}
        {asking && canAskOnPost && (
          <div className="mt-4 border rounded-xl p-3 bg-white/60">
            <p className="text-sm text-gray-700 mb-2">
              Ask a question about this professional post. The answer becomes public in Replies once answered.
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

        {/* Comments preview + add comment */}
        <div className="mt-4">
          {comments.slice(0, 3).map((c) => (
            <div key={c._id} className="border-l pl-3 mt-2">
              <p className="text-sm text-gray-700">
                {c.anonymous
                  ? 'Anonymous'
                  : c.author
                    ? `${c.author.name} (${c.author.role}${c.author.verified ? ' • Verified' : ''})`
                    : 'Unknown User'}
                {c.isProfessional ? (
                  <span className="ml-2 text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                    Professional opinion
                  </span>
                ) : null}
              </p>
              <p className="text-gray-800 whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}

          <form onSubmit={handleComment} className="flex gap-2 mt-3">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="border px-3 py-2 rounded-xl flex-1 bg-white/70"
              placeholder="Write comment..."
              disabled={categoryLocked}
            />
            <button className="btn-primary px-4" disabled={categoryLocked}>
              Send
            </button>
          </form>

          {categoryLocked && (
            <p className="text-xs text-red-600 mt-2">
              This category is locked. Posting and commenting are disabled.
            </p>
          )}
        </div>
      </div>
    )
  }

  const DiscussionCard = ({ d }) => {
    const status = d.status
    const isClosed = status === 'closed'
    const isWaiting = status === 'waiting'
    const isOpen = status === 'open'

    const createdByLabel = d.anonymous
      ? 'Anonymous'
      : d.createdBy
        ? `${d.createdBy.name} (${d.createdBy.role}${d.createdBy.verified ? ' • Verified' : ''})`
        : 'Unknown'

    const statusBadge = isWaiting ? (
      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Waiting approval</span>
    ) : isOpen ? (
      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Open</span>
    ) : (
      <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">Closed</span>
    )

    return (
      <div className="glass-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/discussion/${d._id}`} className="text-lg font-bold hover:text-primary break-words">
              {d.title}
            </Link>
            <p className="text-sm text-gray-600 mt-1">
              By {createdByLabel} • {statusBadge}
            </p>
          </div>
          {d.closeAt ? (
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <Clock size={14} />
              Closes: {new Date(d.closeAt).toLocaleString()}
            </div>
          ) : null}
        </div>

        <p className="mt-3 text-gray-700 whitespace-pre-wrap">
          {d.body?.length > 240 ? `${d.body.slice(0, 240)}...` : d.body}
        </p>

        {isClosed && (
          <p className="text-xs text-gray-500 mt-2">
            Closed discussions are read-only.
          </p>
        )}
      </div>
    )
  }

  const ReplyCard = ({ q }) => {
    const askedByLabel = q.anonymous
      ? 'Anonymous'
      : q.askedBy
        ? `${q.askedBy.name} (${q.askedBy.role}${q.askedBy.verified ? ' • Verified' : ''})`
        : 'Unknown'

    const answeredByLabel = q.answeredBy
      ? `${q.answeredBy.name} (${q.answeredBy.role}${q.answeredBy.verified ? ' • Verified' : ''})`
      : 'Professional'

    return (
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 size={16} className="text-green-600" />
            Answered
          </span>
          <span>• Asked by {askedByLabel}</span>
          <span>• Answered by {answeredByLabel}</span>
          {q.postId?._id ? (
            <Link to={`/post/${q.postId._id}`} className="text-primary underline ml-auto">
              View related post
            </Link>
          ) : null}
        </div>

        <div className="mt-3">
          <p className="font-semibold text-gray-800">Question</p>
          <p className="text-gray-700 whitespace-pre-wrap">{q.body}</p>
        </div>

        <div className="mt-3">
          <p className="font-semibold text-gray-800">Answer</p>
          <p className="text-gray-700 whitespace-pre-wrap">{q.answer}</p>
        </div>

        {q.answeredAt ? (
          <p className="text-xs text-gray-500 mt-2">
            Answered on {new Date(q.answeredAt).toLocaleString()}
          </p>
        ) : null}
      </div>
    )
  }

  if (loading && !category) return <p>Loading...</p>

  if (error)
    return (
      <p className="text-red-500 flex items-center">
        <AlertCircle className="mr-2" />
        {error}
      </p>
    )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/forum" className="flex items-center text-primary">
          <ArrowLeft className="mr-2" />
          Back to Forum
        </Link>
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">{category?.name}</h1>
          <p className="text-gray-600">{category?.description}</p>
        </div>
      </div>

      {/* Safety Disclaimer */}
      <div className="bg-yellow-100 p-4 rounded-lg flex items-center">
        <AlertTriangle className="mr-2 text-yellow-600" />
        <p className="text-yellow-800">
          This platform is not a replacement for professional, in-person medical care. For emergencies, contact local services immediately.
        </p>
      </div>

      {/* Category lock banner */}
      {categoryLocked && (
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-red-700 font-medium">
            This category is currently locked by an admin. New posts, discussions, and questions are disabled.
          </p>
        </div>
      )}

      {/* Required Tabs */}
      <div className="flex gap-3 overflow-x-auto">
        {[
          { key: 'posts', label: 'Posts' },
          { key: 'discussions', label: 'Discussions' },
          { key: 'replies', label: 'Replies' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => changeTab(t.key)}
            className={`px-4 py-2 rounded-full ${
              tab === t.key ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Actions per tab */}
      {tab === 'posts' && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPostSort('recent')}
              className={`px-4 py-2 rounded-full ${postSort === 'recent' ? 'bg-gray-900 text-white' : 'bg-gray-200'}`}
            >
              Recent
            </button>
            <button
              onClick={() => setPostSort('popular')}
              className={`px-4 py-2 rounded-full ${postSort === 'popular' ? 'bg-gray-900 text-white' : 'bg-gray-200'}`}
            >
              Popular
            </button>
          </div>

          <Link
            to={`/category/${id}/create-post?mode=post`}
            className={`btn-primary flex items-center justify-center gap-2 ${categoryLocked ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Plus size={16} />
            Create Post
          </Link>
        </div>
      )}

      {tab === 'discussions' && (
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/category/${id}/create-post?mode=discussion`}
            className={`btn-primary flex items-center justify-center gap-2 ${categoryLocked ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Plus size={16} />
            Start a Discussion
          </Link>
        </div>
      )}

      {tab === 'replies' && (
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/category/${id}/create-post?mode=ask`}
            className={`btn-primary flex items-center justify-center gap-2 ${categoryLocked ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <HelpCircle size={16} />
            Ask an Expert
          </Link>
        </div>
      )}

      {/* Content */}
      {tab === 'posts' && (
        <>
          {/* Pinned Posts */}
          {pinnedPosts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Pinned</h2>
              {pinnedPosts.map((p) => (
                <PostCard key={p._id} post={p} />
              ))}
            </div>
          )}

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.length === 0 && !loading ? (
              <p className="text-center text-gray-600">No posts yet.</p>
            ) : (
              posts.map((p) => <PostCard key={p._id} post={p} />)
            )}

            {loadingMore && <p>Loading more...</p>}

            {postsHasMore && !loadingMore && posts.length > 0 && (
              <button onClick={loadMorePosts} className="btn-primary mx-auto block">
                Load More
              </button>
            )}
          </div>
        </>
      )}

      {tab === 'discussions' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Open Discussions</h2>
            {openDiscussions.length === 0 && !loading ? (
              <p className="text-center text-gray-600">No open discussions.</p>
            ) : (
              openDiscussions.map((d) => <DiscussionCard key={d._id} d={d} />)
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Closed Discussions</h2>
            {closedDiscussions.length === 0 && !loading ? (
              <p className="text-center text-gray-600">No closed discussions.</p>
            ) : (
              closedDiscussions.map((d) => <DiscussionCard key={d._id} d={d} />)
            )}
          </div>
        </div>
      )}

      {tab === 'replies' && (
        <div className="space-y-4">
          {replies.length === 0 && !loading ? (
            <p className="text-center text-gray-600">No replies yet.</p>
          ) : (
            replies.map((q) => <ReplyCard key={q._id} q={q} />)
          )}

          {loadingMore && <p>Loading more...</p>}

          {repliesHasMore && !loadingMore && replies.length > 0 && (
            <button onClick={loadMoreReplies} className="btn-primary mx-auto block">
              Load More
            </button>
          )}
        </div>
      )}

      {/* Support Circles */}
      <div className="glass-card p-4">
        <h2 className="text-xl font-bold mb-4">Related Support Circles</h2>

        {relatedCircles.map((circle) => (
          <div key={circle._id} className="mb-4">
            <Link to={`/group/${circle._id}`} className="font-medium">
              {circle.name}
            </Link>
            <p className="text-sm">{circle.members?.length || 0} members</p>
            <button onClick={() => handleJoinCircle(circle._id)} className="text-primary">
              Join
            </button>
          </div>
        ))}

        {relatedCircles.length === 0 && <p>No related circles yet.</p>}
      </div>
    </motion.div>
  )
}

export default Category