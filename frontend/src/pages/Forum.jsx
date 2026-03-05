// FILE: frontend/src/pages/Forum.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import {
  TrendingUp,
  Mic,
  Trophy,
  Stethoscope,
  Users,
  Grid,
  Star,
  BarChart,
  ChevronRight,
  AlertCircle,
  Lock,
  MessageSquare,
} from 'lucide-react'

const Forum = () => {
  const [user, setUser] = useState(null)

  const [trendingPosts, setTrendingPosts] = useState([])
  const [liveSessions, setLiveSessions] = useState([]) // MVP static
  const [challenges, setChallenges] = useState([]) // MVP static

  const [circles, setCircles] = useState([])
  const [myCircles, setMyCircles] = useState([])
  const [categories, setCategories] = useState([])
  const [topContributors, setTopContributors] = useState([])

  const [insights, setInsights] = useState({
    discussedCategories: ['Mental Health', 'Nutrition'],
    risingSymptoms: ['fatigue', 'headache'],
    activeChallenges: 2,
    activeCircles: 5,
  })

  // Ask-an-expert CTA: choose category
  const [askCategoryId, setAskCategoryId] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const categoryNameById = useMemo(() => {
    const map = {}
    for (const c of categories) {
      if (c?._id) map[c._id.toString()] = c.name
    }
    return map
  }, [categories])

  const countOrLen = (v) => {
    if (Array.isArray(v)) return v.length
    if (typeof v === 'number') return v
    return 0
  }

  const isProfessionalPost = (post) => {
    const a = post?.author
    if (!a) return false
    return ['doctor', 'chw'].includes(a.role) && !!a.verified
  }

  const normalizeCategoryName = (post) => {
    // If backend ever becomes populated later:
    if (post?.category?.name) return post.category.name

    // Your current backend returns category as ObjectId string
    const id = post?.category?.toString?.() || (typeof post?.category === 'string' ? post.category : '')
    if (id && categoryNameById[id]) return categoryNameById[id]

    return 'General'
  }

  const fetchAll = async () => {
    setLoading(true)
    setError('')

    try {
      // 1) profile
      let me = null
      try {
        const resProfile = await api.get('/auth/profile')
        me = resProfile.data
        setUser(me)
      } catch {
        setUser(null)
      }

      // 2) trending
      try {
        const resTrending = await api.get('/forum/posts/trending')
        setTrendingPosts(Array.isArray(resTrending.data) ? resTrending.data : [])
      } catch {
        setTrendingPosts([])
      }

      // 3) categories (needed for categoryId -> name mapping)
      try {
        const resCats = await api.get('/forum/categories')
        const cats = Array.isArray(resCats.data) ? resCats.data : []
        setCategories(cats)
        if (!askCategoryId && cats.length > 0) setAskCategoryId(cats[0]._id)
      } catch {
        setCategories([])
      }

      // 4) groups/circles
      try {
        const resGroups = await api.get('/forum/groups')
        const allGroups = Array.isArray(resGroups.data) ? resGroups.data : []
        const allCircles = allGroups.filter((g) => g.type === 'circle')
        setCircles(allCircles)

        const myId = me?._id?.toString?.()
        if (myId) {
          setMyCircles(allCircles.filter((g) => (g.members || []).some((m) => m?.toString?.() === myId)))
        } else {
          setMyCircles([])
        }
      } catch {
        setCircles([])
        setMyCircles([])
      }

      // 5) top contributors
      try {
        const resTop = await api.get('/users/top')
        setTopContributors(Array.isArray(resTop.data) ? resTop.data : [])
      } catch {
        setTopContributors([])
      }

      // MVP static sections
      setLiveSessions([{ title: 'Q&A on Nutrition', doctor: 'Dr. Smith', active: true }])
      setChallenges([{ name: '30 Day Fitness', progress: 50, participants: 120, duration: '30 days' }])
    } catch {
      setError('Failed to load forum')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const joinCircle = async (circleId) => {
    try {
      const res = await api.post(`/forum/groups/${circleId}/join`)
      await fetchAll()
      alert(res.data?.msg || 'Joined successfully')
    } catch (e) {
      alert(e.response?.data?.msg || 'Failed to join')
    }
  }

  const professionalTrending = useMemo(() => {
    return (trendingPosts || []).filter(isProfessionalPost).slice(0, 3)
  }, [trendingPosts])

  if (loading) return <p className="text-center text-lg py-10">Loading...</p>

  if (error)
    return (
      <p className="text-red-500 text-center flex items-center justify-center py-10">
        <AlertCircle className="mr-2" />
        {error}
      </p>
    )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      {/* Top Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trending Topics */}
        <div className="glass-card col-span-1">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <TrendingUp className="mr-2" /> Trending
          </h2>

          {trendingPosts.length === 0 ? (
            <p className="text-gray-600">No trending posts yet.</p>
          ) : (
            <ul className="space-y-4">
              {trendingPosts.slice(0, 6).map((post) => (
                <li key={post._id} className="border-b pb-3">
                  <Link to={`/post/${post._id}`} className="font-medium hover:text-primary block">
                    {post.title}
                  </Link>
                  <p className="text-sm text-gray-600 flex flex-wrap items-center gap-3 mt-1">
                    <span>{normalizeCategoryName(post)}</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={14} />
                      {countOrLen(post.comments)} comments
                    </span>
                    <span>{countOrLen(post.upvotes)} upvotes</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Live Q&A (MVP placeholder) */}
        <div className="glass-card col-span-1">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Mic className="mr-2" /> Live Q&A
          </h2>

          {liveSessions.map((session) => (
            <div key={session.title} className="mb-4">
              <h3 className="font-medium">{session.title}</h3>
              <p className="text-sm text-gray-600">By {session.doctor}</p>
              <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">Live</span>
            </div>
          ))}
        </div>

        {/* Ongoing Challenge (MVP placeholder) */}
        <div className="glass-card col-span-1">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Trophy className="mr-2" /> Health Challenge
          </h2>

          {challenges.map((ch) => (
            <div key={ch.name}>
              <h3 className="font-medium">{ch.name}</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${ch.progress}%` }} />
              </div>
              <p className="text-sm text-gray-600">
                {ch.participants} participants • {ch.duration}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Middle Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ask a Professional */}
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Stethoscope className="mr-2" /> Ask a Professional
          </h2>

          {professionalTrending.length === 0 ? (
            <p className="text-gray-600 mb-4">
              No professional posts are trending yet. You can still ask a general question by category.
            </p>
          ) : (
            <ul className="space-y-3 mb-4">
              {professionalTrending.map((p) => (
                <li key={p._id} className="border rounded-xl p-3 bg-white/50">
                  <Link to={`/post/${p._id}`} className="font-medium hover:text-primary block">
                    {p.title}
                  </Link>
                  <p className="text-xs text-gray-600 mt-1">{normalizeCategoryName(p)}</p>
                  <p className="text-xs text-gray-500 mt-1">Open the post and use the “Ask” button.</p>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-700 font-medium">Ask a general question in a category:</p>

            <select value={askCategoryId} onChange={(e) => setAskCategoryId(e.target.value)} className="input-field">
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <Link
              to={askCategoryId ? `/category/${askCategoryId}/create-post?mode=ask` : '/forum'}
              className={`btn-primary block text-center ${!askCategoryId ? 'opacity-50 pointer-events-none' : ''}`}
            >
              Ask an Expert
            </Link>

            {!user && <p className="text-xs text-gray-500 mt-2">You need to be logged in to submit a question.</p>}
          </div>
        </div>

        {/* Support Circles */}
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Users className="mr-2" /> Support Circles
          </h2>

          {circles.length === 0 ? (
            <p className="text-gray-600">No circles yet.</p>
          ) : (
            circles.slice(0, 4).map((circle) => (
              <div key={circle._id} className="mb-4 border rounded-xl p-3 bg-white/50">
                <h3 className="font-medium">{circle.name}</h3>
                <p className="text-sm text-gray-600">{(circle.members || []).length} members</p>

                <div className="flex gap-2 mt-2">
                  <Link to={`/group/${circle._id}`} className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300">
                    View
                  </Link>
                  <button onClick={() => joinCircle(circle._id)} className="btn-primary">
                    Join
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Category Grid */}
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Grid className="mr-2" /> Categories
          </h2>

          {categories.length === 0 ? (
            <p className="text-gray-600">No categories yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div key={cat._id} className="bg-neutral p-4 rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{cat.description}</p>
                    </div>
                    {cat.isLocked ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                        <Lock size={12} /> Locked
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <Link
                      to={`/category/${cat._id}?tab=posts`}
                      className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
                    >
                      Posts
                    </Link>
                    <Link
                      to={`/category/${cat._id}?tab=discussions`}
                      className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
                    >
                      Discussions
                    </Link>
                    <Link
                      to={`/category/${cat._id}?tab=replies`}
                      className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
                    >
                      Replies
                    </Link>

                    <Link
                      to={`/category/${cat._id}/create-post?mode=post`}
                      className={`px-3 py-2 rounded-xl bg-primary text-white text-sm ${
                        cat.isLocked ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      Create
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Contributors */}
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Star className="mr-2" /> Top Contributors
          </h2>

          {topContributors.length > 0 ? (
            topContributors.map((contrib) => (
              <div key={contrib._id} className="flex items-center mb-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(contrib.name || 'User')}`}
                  alt="avatar"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-medium">{contrib.name}</p>
                  <p className="text-sm text-gray-600">{contrib.role}</p>
                </div>
                <p className="ml-auto text-gray-700">{contrib.reputation} pts</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No contributors yet</p>
          )}
        </div>

        {/* Community Health Insights */}
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <BarChart className="mr-2" /> Health Insights
          </h2>

          <p className="text-gray-700">Most discussed: {insights.discussedCategories.join(', ')}</p>
          <p className="text-gray-700">Rising symptoms: {insights.risingSymptoms.join(', ')}</p>
          <p className="text-gray-700">Active challenges: {insights.activeChallenges}</p>
          <p className="text-gray-700">Active circles: {insights.activeCircles}</p>

          <Link to="/insights" className="text-primary mt-4 block">
            View Full Insights
          </Link>
        </div>

        {/* My Support Circles */}
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <ChevronRight className="mr-2" /> My Support Circles
          </h2>

          {myCircles.length > 0 ? (
            myCircles.map((circle) => (
              <Link
                key={circle._id}
                to={`/group/${circle._id}`}
                className="block mb-4 border rounded-xl p-3 bg-white/50"
              >
                <h3 className="font-medium">{circle.name}</h3>
                <p className="text-sm text-gray-600">{(circle.members || []).length} members</p>
              </Link>
            ))
          ) : (
            <p className="text-gray-600">No circles joined yet.</p>
          )}
        </div>
      </section>
    </motion.div>
  )
}

export default Forum