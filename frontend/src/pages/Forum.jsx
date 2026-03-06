// FILE: frontend/src/pages/Forum.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import {
  Stethoscope,
  Users,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Shield,
  Lock,
  Search,
  ChevronRight,
  BarChart3,
  Star,
  AlertCircle,
  Activity,
} from "lucide-react";
import { connectSocket, joinCategory, leaveCategory } from "../utils/socket";

const Forum = () => {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [circles, setCircles] = useState([]);
  const [myCircles, setMyCircles] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  // We normalize trending items into a consistent shape for LIVE updates
  const [trending, setTrending] = useState([]);
  // Ask-an-expert CTA
  const [askCategoryId, setAskCategoryId] = useState("");
  // Search
  const [query, setQuery] = useState("");
  // UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Live indicator
  const [livePulse, setLivePulse] = useState(false);

  const categoryNameById = useMemo(() => {
    const map = {};
    for (const c of categories) {
      if (c?._id) map[String(c._id)] = c.name;
    }
    return map;
  }, [categories]);

  const meId = useMemo(() => user?._id?.toString?.() || "", [user]);

  const isProfessionalAuthor = (author) =>
    !!author && ["doctor", "chw"].includes(author.role) && !!author.verified;

  const normalizeTrendingItem = useCallback(
    (post) => {
      if (!post?._id) return null;
      const categoryId =
        typeof post.category === "string"
          ? post.category
          : post.category?._id || post.category || "";
      const commentsCount = Array.isArray(post.comments)
        ? post.comments.length
        : typeof post.comments === "number"
        ? post.comments
        : 0;
      const upvotesCount = Array.isArray(post.upvotes)
        ? post.upvotes.length
        : typeof post.upvotes === "number"
        ? post.upvotes
        : 0;
      const author =
        Array.isArray(post.author) && post.author.length ? post.author[0] : post.author;
      return {
        _id: post._id,
        title: post.title || "Untitled",
        categoryId: categoryId ? String(categoryId) : "",
        categoryName:
          post.category?.name ||
          categoryNameById[String(categoryId)] ||
          "General",
        commentsCount,
        upvotesCount,
        author: author
          ? { name: author.name, role: author.role, verified: !!author.verified }
          : { name: "Unknown", role: "patient", verified: false },
        isProfessional: isProfessionalAuthor(author),
        createdAt: post.createdAt || new Date().toISOString(),
      };
    },
    [categoryNameById]
  );

  const pulse = () => {
    setLivePulse(true);
    window.setTimeout(() => setLivePulse(false), 450);
  };

  // ---------------------------
  // Set default askCategoryId after categories are loaded
  // ---------------------------
  useEffect(() => {
    if (!askCategoryId && categories.length > 0) {
      setAskCategoryId(categories[0]._id);
    }
  }, [askCategoryId, categories]);

  // ---------------------------
  // Fetch all initial data
  // ---------------------------
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // profile (optional)
      let me = null;
      try {
        const resProfile = await api.get("/auth/profile");
        me = resProfile.data;
      } catch {}
      // categories
      let cats = [];
      try {
        const resCats = await api.get("/forum/categories");
        cats = Array.isArray(resCats.data) ? resCats.data : [];
      } catch {}
      // groups/circles
      let allGroups = [];
      try {
        const resGroups = await api.get("/forum/groups");
        allGroups = Array.isArray(resGroups.data) ? resGroups.data : [];
      } catch {}
      // top contributors
      let top = [];
      try {
        const resTop = await api.get("/users/top");
        top = Array.isArray(resTop.data) ? resTop.data : [];
      } catch {}
      // trending
      let rawTrending = [];
      try {
        const resTrending = await api.get("/forum/posts/trending");
        rawTrending = Array.isArray(resTrending.data) ? resTrending.data : [];
      } catch {}

      // Process data locally
      const catMap = {};
      cats.forEach((c) => {
        if (c?._id) catMap[String(c._id)] = c.name;
      });

      const normalized = rawTrending
        .map((post) => {
          if (!post?._id) return null;
          const categoryId =
            typeof post.category === "string"
              ? post.category
              : post.category?._id || post.category || "";
          const commentsCount = Array.isArray(post.comments)
            ? post.comments.length
            : typeof post.comments === "number"
            ? post.comments
            : 0;
          const upvotesCount = Array.isArray(post.upvotes)
            ? post.upvotes.length
            : typeof post.upvotes === "number"
            ? post.upvotes
            : 0;
          const author =
            Array.isArray(post.author) && post.author.length ? post.author[0] : post.author;
          return {
            _id: post._id,
            title: post.title || "Untitled",
            categoryId: categoryId ? String(categoryId) : "",
            categoryName:
              post.category?.name ||
              catMap[String(categoryId)] ||
              "General",
            commentsCount,
            upvotesCount,
            author: author
              ? { name: author.name, role: author.role, verified: !!author.verified }
              : { name: "Unknown", role: "patient", verified: false },
            isProfessional: isProfessionalAuthor(author),
            createdAt: post.createdAt || new Date().toISOString(),
          };
        })
        .filter(Boolean);

      const allCircles = allGroups.filter((g) => g.type === "circle");
      const myId = me?._id?.toString?.() || "";
      const myCirclesList = myId
        ? allCircles.filter((g) => (g.members || []).some((m) => String(m) === myId))
        : [];

      // Set states
      setUser(me);
      setCategories(cats);
      setCircles(allCircles);
      setMyCircles(myCirclesList);
      setTopContributors(top);
      setTrending(normalized);
    } catch {
      setError("Failed to load forum");
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies to prevent loops

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ---------------------------
  // LIVE sockets:
  // We join ALL category rooms so Forum can update live.
  // (Works well when categories are few; for many categories we’ll add a backend global room later.)
  // ---------------------------
  useEffect(() => {
    const s = connectSocket();
    // join rooms
    (categories || []).forEach((c) => c?._id && joinCategory(c._id));
    const onNewPost = (post) => {
      const item = normalizeTrendingItem(post);
      if (!item) return;
      pulse();
      setTrending((prev) => {
        const exists = prev.some((p) => p._id === item._id);
        if (exists) return prev.map((p) => (p._id === item._id ? { ...p, ...item } : p));
        // put on top, keep max 10
        return [item, ...prev].slice(0, 10);
      });
    };
    const onNewComment = (payload) => {
      // payload includes `post: postId`
      const postId = payload?.post;
      if (!postId) return;
      pulse();
      setTrending((prev) =>
        prev.map((p) =>
          String(p._id) === String(postId)
            ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
            : p
        )
      );
    };
    const onPostLiked = ({ postId, likes, upvotes }) => {
      if (!postId) return;
      pulse();
      const upvotesCount = Array.isArray(upvotes)
        ? upvotes.length
        : Array.isArray(likes)
        ? likes.length
        : undefined;
      if (typeof upvotesCount !== "number") return;
      setTrending((prev) =>
        prev.map((p) => (String(p._id) === String(postId) ? { ...p, upvotesCount } : p))
      );
    };
    const onCategoryUpdated = (cat) => {
      if (!cat?._id) return;
      pulse();
      setCategories((prev) => prev.map((c) => (String(c._id) === String(cat._id) ? { ...c, ...cat } : c)));
    };
    s.on("newPost", onNewPost);
    s.on("newComment", onNewComment);
    s.on("postLiked", onPostLiked);
    s.on("categoryUpdated", onCategoryUpdated);
    return () => {
      (categories || []).forEach((c) => c?._id && leaveCategory(c._id));
      s.off("newPost", onNewPost);
      s.off("newComment", onNewComment);
      s.off("postLiked", onPostLiked);
      s.off("categoryUpdated", onCategoryUpdated);
    };
  }, [categories, normalizeTrendingItem]);

  // ---------------------------
  // Actions
  // ---------------------------
  const joinCircle = async (circleId) => {
    try {
      const res = await api.post(`/forum/groups/${circleId}/join`);
      await fetchAll();
      alert(res.data?.msg || "Joined successfully");
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to join");
    }
  };

  // ---------------------------
  // Derived: search filtering
  // ---------------------------
  const q = query.trim().toLowerCase();
  const filteredCategories = useMemo(() => {
    if (!q) return categories;
    return categories.filter((c) => `${c.name} ${c.description || ""}`.toLowerCase().includes(q));
  }, [categories, q]);
  const filteredCircles = useMemo(() => {
    if (!q) return circles;
    return circles.filter((c) => `${c.name} ${c.description || ""}`.toLowerCase().includes(q));
  }, [circles, q]);
  const filteredTrending = useMemo(() => {
    if (!q) return trending;
    return trending.filter((t) => `${t.title} ${t.categoryName} ${t.author?.name || ""}`.toLowerCase().includes(q));
  }, [trending, q]);
  const stats = useMemo(() => {
    const totalCategories = categories.length;
    const totalCircles = circles.length;
    const joined = myCircles.length;
    const proTrending = trending.filter((t) => t.isProfessional).length;
    return { totalCategories, totalCircles, joined, proTrending };
  }, [categories.length, circles.length, myCircles.length, trending]);

  // ---------------------------
  // UI
  // ---------------------------
  if (loading) {
    return <p className="text-center text-lg py-10">Loading...</p>;
  }
  if (error) {
    return (
      <p className="text-red-500 text-center flex items-center justify-center py-10">
        <AlertCircle className="mr-2" />
        {error}
      </p>
    );
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/50 backdrop-blur-xl shadow-card">
        <div className="p-6 md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <span className={`inline-flex items-center gap-2 ${livePulse ? "opacity-100" : "opacity-70"} transition`}>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Live updates
                </span>
              </div>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                <Stethoscope className="text-blue-600" />
                Community Health Hub
              </h1>
              <p className="mt-3 text-gray-700 leading-relaxed">
                Ask questions, join support circles, and learn from verified professionals. This is not emergency care — for urgent cases, seek immediate help.
              </p>
              {/* Search */}
              <div className="mt-5 relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-field pl-11"
                  placeholder="Search posts, categories, circles, professionals..."
                />
              </div>
            </div>
            {/* Quick CTA */}
            <div className="w-full md:w-auto flex flex-col gap-3">
              <div className="glass-card p-4 md:p-5">
                <p className="text-sm text-gray-600 font-medium">Ask an Expert (by category)</p>
                <div className="mt-2 flex gap-2">
                  <select
                    value={askCategoryId}
                    onChange={(e) => setAskCategoryId(e.target.value)}
                    className="input-field"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <Link
                    to={askCategoryId ? `/category/${askCategoryId}/create-post?mode=ask` : "/forum"}
                    className={`btn-primary whitespace-nowrap ${!askCategoryId ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    Ask
                  </Link>
                </div>
                {!user && (
                  <p className="text-xs text-gray-500 mt-2">
                    Login required to submit questions.
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Stats row */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
              <p className="text-xs text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
            </div>
            <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
              <p className="text-xs text-gray-500">Support circles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCircles}</p>
            </div>
            <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
              <p className="text-xs text-gray-500">Joined circles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.joined}</p>
            </div>
            <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
              <p className="text-xs text-gray-500">Pro trending posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.proTrending}</p>
            </div>
          </div>
        </div>
      </div>
      {/* MAIN GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending */}
        <div className="glass-card lg:col-span-1">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <TrendingUp className="mr-2" /> Trending now
          </h2>
          {filteredTrending.length === 0 ? (
            <p className="text-gray-600">No trending posts yet.</p>
          ) : (
            <ul className="space-y-4">
              {filteredTrending.slice(0, 8).map((p) => (
                <li key={p._id} className="border-b border-white/40 pb-3">
                  <Link to={`/post/${p._id}`} className="font-semibold hover:text-primary block">
                    {p.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <span className="px-2 py-1 rounded-full bg-gray-100">
                      {p.categoryName}
                    </span>
                    {p.isProfessional ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                        <Shield size={12} /> Professional
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare size={14} /> {p.commentsCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Sparkles size={14} /> {p.upvotesCount}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    By {p.author?.name || "Unknown"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Categories */}
        <div className="glass-card lg:col-span-1">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Activity className="mr-2" /> Categories
          </h2>
          {filteredCategories.length === 0 ? (
            <p className="text-gray-600">No categories found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCategories.map((cat) => (
                <div key={cat._id} className="bg-white/60 rounded-2xl p-4 border border-white/40">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{cat.name}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{cat.description}</p>
                    </div>
                    {cat.isLocked ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                        <Lock size={12} /> Locked
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Link to={`/category/${cat._id}?tab=posts`} className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm">
                      Posts
                    </Link>
                    <Link to={`/category/${cat._id}?tab=discussions`} className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm">
                      Discussions
                    </Link>
                    <Link to={`/category/${cat._id}?tab=replies`} className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm">
                      Replies
                    </Link>
                    <Link
                      to={`/category/${cat._id}/create-post?mode=post`}
                      className={`px-3 py-2 rounded-xl bg-primary text-white text-sm ${cat.isLocked ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      Create
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Circles + Contributors */}
        <div className="space-y-6 lg:col-span-1">
          {/* Support circles */}
          <div className="glass-card">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Users className="mr-2" /> Support circles
            </h2>
            {filteredCircles.length === 0 ? (
              <p className="text-gray-600">No circles found.</p>
            ) : (
              filteredCircles.slice(0, 5).map((circle) => {
                const joined = meId && (circle.members || []).some((m) => String(m) === meId);
                return (
                  <div key={circle._id} className="mb-4 border border-white/40 rounded-2xl p-4 bg-white/60">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{circle.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{circle.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {(circle.members || []).length} members
                        </p>
                      </div>
                      {joined ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                          Joined
                        </span>
                      ) : null}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link to={`/group/${circle._id}`} className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300">
                        View
                      </Link>
                      <button
                        onClick={() => joinCircle(circle._id)}
                        className={`btn-primary ${joined ? "opacity-60 pointer-events-none" : ""}`}
                      >
                        Join
                      </button>
                    </div>
                  </div>
                );
              })
            )}
            {circles.length > 5 ? (
              <p className="text-xs text-gray-500 mt-2">
                Showing 5 circles. Use search to find more.
              </p>
            ) : null}
          </div>
          {/* Top contributors */}
          <div className="glass-card">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Star className="mr-2" /> Top contributors
            </h2>
            {topContributors.length === 0 ? (
              <p className="text-gray-600">No contributors yet.</p>
            ) : (
              topContributors.map((contrib) => (
                <div key={contrib._id} className="flex items-center mb-4">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(contrib.name || "User")}`}
                    alt="avatar"
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{contrib.name}</p>
                    <p className="text-xs text-gray-600">{contrib.role}</p>
                  </div>
                  <p className="ml-auto text-gray-800 font-semibold">{contrib.reputation} pts</p>
                </div>
              ))
            )}
          </div>
          {/* Mini Insights */}
          <div className="glass-card">
            <h2 className="text-xl font-bold mb-3 flex items-center">
              <BarChart3 className="mr-2" /> Quick insights
            </h2>
            <p className="text-sm text-gray-700">
              Trending posts: <b>{trending.length}</b>
            </p>
            <p className="text-sm text-gray-700">
              Locked categories: <b>{categories.filter((c) => c.isLocked).length}</b>
            </p>
            <p className="text-sm text-gray-700">
              Professional activity: <b>{stats.proTrending}</b> trending posts by professionals
            </p>
            <Link to="/dashboard" className="text-primary mt-3 inline-flex items-center gap-2">
              Go to Dashboard <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Forum;