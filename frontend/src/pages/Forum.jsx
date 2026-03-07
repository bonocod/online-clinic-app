import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import {
  Stethoscope,
  Users,
  Shield,
  Lock,
  Search,
  ChevronRight,
  AlertCircle,
  Activity,
  Radio,
  Clock3,
  MessageSquare,
  FolderOpen,
} from "lucide-react";
import { connectSocket, joinCategory, leaveCategory } from "../utils/socket";

const fmt = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "";
  }
};

const Forum = () => {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [circles, setCircles] = useState([]);
  const [myCircles, setMyCircles] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [askCategoryId, setAskCategoryId] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [livePulse, setLivePulse] = useState(false);

  const meId = useMemo(() => user?._id?.toString?.() || "", [user]);

  const pulse = () => {
    setLivePulse(true);
    window.setTimeout(() => setLivePulse(false), 450);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      let me = null;
      let cats = [];
      let circlesData = [];
      let liveData = [];
      let pastData = [];

      try {
        const profileRes = await api.get("/auth/profile");
        me = profileRes.data;
      } catch {}

      try {
        const catsRes = await api.get("/forum/categories");
        cats = Array.isArray(catsRes.data) ? catsRes.data : [];
      } catch {}

      try {
        const circlesRes = await api.get("/forum/circles?status=approved");
        circlesData = Array.isArray(circlesRes.data) ? circlesRes.data : [];
      } catch {}

      try {
        const liveRes = await api.get("/forum/live-sessions?status=live");
        liveData = Array.isArray(liveRes.data) ? liveRes.data : [];
      } catch {}

      try {
        const pastRes = await api.get("/forum/live-sessions?status=past");
        pastData = Array.isArray(pastRes.data) ? pastRes.data : [];
      } catch {}

      const joined = me?._id
        ? circlesData.filter((circle) =>
            Array.isArray(circle.members) &&
            circle.members.some((memberId) => String(memberId) === String(me._id))
          )
        : [];

      setUser(me);
      setCategories(cats);
      setCircles(circlesData);
      setMyCircles(joined);
      setLiveSessions(liveData);
      setPastSessions(pastData);
    } catch {
      setError("Failed to load forum");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!askCategoryId && categories.length > 0) {
      setAskCategoryId(categories[0]._id);
    }
  }, [askCategoryId, categories]);

  useEffect(() => {
    const s = connectSocket();

    categories.forEach((category) => {
      if (category?._id) joinCategory(category._id);
    });

    const refreshLight = () => {
      pulse();
      fetchAll();
    };

    s.on("liveSession:started", refreshLight);
    s.on("liveSession:updated", refreshLight);
    s.on("liveSession:ended", refreshLight);
    s.on("circle:created", refreshLight);
    s.on("circle:approved", refreshLight);
    s.on("circle:memberUpdate", refreshLight);
    s.on("categoryUpdated", refreshLight);

    return () => {
      categories.forEach((category) => {
        if (category?._id) leaveCategory(category._id);
      });

      s.off("liveSession:started", refreshLight);
      s.off("liveSession:updated", refreshLight);
      s.off("liveSession:ended", refreshLight);
      s.off("circle:created", refreshLight);
      s.off("circle:approved", refreshLight);
      s.off("circle:memberUpdate", refreshLight);
      s.off("categoryUpdated", refreshLight);
    };
  }, [categories, fetchAll]);

  const joinCircle = async (circle) => {
    try {
      if (circle.approvalRequired || circle.privacy === "private") {
        const reason = window.prompt("Why do you want to join this support circle?");
        if (!reason || !reason.trim()) return;

        const res = await api.post(`/forum/circles/${circle._id}/join-request`, {
          reason: reason.trim(),
        });

        await fetchAll();
        alert(res.data?.msg || "Join request submitted");
        return;
      }

      const res = await api.post(`/forum/groups/${circle._id}/join`);
      await fetchAll();
      alert(res.data?.msg || "Joined successfully");
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to join circle");
    }
  };

  const q = query.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!q) return categories;
    return categories.filter((category) =>
      `${category.name} ${category.description || ""}`.toLowerCase().includes(q)
    );
  }, [categories, q]);

  const filteredCircles = useMemo(() => {
    if (!q) return circles;
    return circles.filter((circle) =>
      `${circle.name} ${circle.description || ""} ${circle.conditionTag || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [circles, q]);

  const filteredLiveSessions = useMemo(() => {
    if (!q) return liveSessions;
    return liveSessions.filter((session) =>
      `${session.title} ${session.description || ""} ${session.startedBy?.name || ""} ${session.categoryId?.name || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [liveSessions, q]);

  const previewPastSessions = useMemo(() => {
    const source = q
      ? pastSessions.filter((session) =>
          `${session.title} ${session.description || ""} ${session.startedBy?.name || ""} ${session.categoryId?.name || ""}`
            .toLowerCase()
            .includes(q)
        )
      : pastSessions;

    return source.slice(0, 3);
  }, [pastSessions, q]);

  const stats = useMemo(
    () => ({
      totalCategories: categories.length,
      totalCircles: circles.length,
      joinedCircles: myCircles.length,
      activeSessions: liveSessions.length,
    }),
    [categories.length, circles.length, myCircles.length, liveSessions.length]
  );

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
      <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/50 backdrop-blur-xl shadow-card">
        <div className="p-6 md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <span
                  className={`inline-flex items-center gap-2 ${
                    livePulse ? "opacity-100" : "opacity-70"
                  } transition`}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Live updates
                </span>
              </div>

              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                <Stethoscope className="text-blue-600" />
                Community Health Hub
              </h1>

              <p className="mt-3 text-gray-700 leading-relaxed">
                Ask questions, join support circles, and follow live doctor Q&amp;A sessions.
                This platform does not replace emergency or in-person care.
              </p>

              <div className="mt-5 relative max-w-xl">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-field pl-11"
                  placeholder="Search categories, circles, or live sessions..."
                />
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col gap-3">
              <div className="glass-card p-4 md:p-5">
                <p className="text-sm text-gray-600 font-medium">Ask an Expert (by category)</p>
                <div className="mt-2 flex gap-2">
                  <select
                    value={askCategoryId}
                    onChange={(e) => setAskCategoryId(e.target.value)}
                    className="input-field"
                  >
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <Link
                    to={askCategoryId ? `/category/${askCategoryId}/create-post?mode=ask` : "/forum"}
                    className={`btn-primary whitespace-nowrap ${
                      !askCategoryId ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    Ask
                  </Link>
                </div>

                {!user && (
                  <p className="text-xs text-gray-500 mt-2">
                    Login is required for questions, circles, and live participation.
                  </p>
                )}
              </div>

              <Link
                to="/live-sessions/past"
                className="glass-card p-4 md:p-5 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-gray-600">Want to review older Q&amp;A?</p>
                  <p className="font-semibold text-gray-900">Past Sessions Archive</p>
                </div>
                <ChevronRight className="text-blue-600" />
              </Link>
            </div>
          </div>

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
              <p className="text-2xl font-bold text-gray-900">{stats.joinedCircles}</p>
            </div>
            <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
              <p className="text-xs text-gray-500">Active live sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="glass-card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Radio className="text-red-500" />
            Live Q&amp;A Sessions
          </h2>

          <div className="flex items-center gap-2">
            <Link
              to="/live-sessions/past"
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
            >
              View Past Sessions
            </Link>
          </div>
        </div>

        {filteredLiveSessions.length === 0 ? (
          <div className="bg-white/60 border border-white/40 rounded-2xl p-6">
            <p className="text-gray-700 font-medium">No live sessions right now.</p>
            <p className="text-sm text-gray-500 mt-1">
              When a doctor starts one, it will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredLiveSessions.map((session) => (
              <div
                key={session._id}
                className="bg-white/60 border border-white/40 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-lg">{session.title}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {session.description || "Live doctor question session"}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                    LIVE
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Doctor:</span>{" "}
                    {session.startedBy?.name || "Doctor"}
                  </p>
                  <p>
                    <span className="font-medium">Category:</span>{" "}
                    {session.categoryId?.name || "General"}
                  </p>
                  <p>
                    <span className="font-medium">Started:</span> {fmt(session.startedAt)}
                  </p>
                  <p>
                    <span className="font-medium">Answered:</span>{" "}
                    {session.answeredCount || 0}
                  </p>
                  {session.scheduledEndAt ? (
                    <p>
                      <span className="font-medium">Ends:</span> {fmt(session.scheduledEndAt)}
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 flex gap-2">
                  <Link to={`/live-sessions/${session._id}`} className="btn-primary">
                    Open Session
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {previewPastSessions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Clock3 className="text-blue-600" />
              Recent Past Sessions
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {previewPastSessions.map((session) => (
                <Link
                  key={session._id}
                  to={`/live-sessions/${session._id}`}
                  className="bg-white/60 border border-white/40 rounded-2xl p-4 hover:bg-white transition"
                >
                  <p className="font-semibold text-gray-900">{session.title}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {session.description || "Ended session"}
                  </p>
                  <p className="text-xs text-gray-500 mt-3">
                    Ended: {fmt(session.endedAt || session.updatedAt)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FolderOpen className="mr-2" /> Categories
          </h2>

          {filteredCategories.length === 0 ? (
            <p className="text-gray-600">No categories found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCategories.map((category) => (
                <div
                  key={category._id}
                  className="bg-white/60 rounded-2xl p-4 border border-white/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{category.name}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {category.description}
                      </p>
                    </div>

                    {category.isLocked ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                        <Lock size={12} /> Locked
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <Link
                      to={`/category/${category._id}?tab=posts`}
                      className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
                    >
                      Posts
                    </Link>
                    <Link
                      to={`/category/${category._id}?tab=discussions`}
                      className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
                    >
                      Discussions
                    </Link>
                    <Link
                      to={`/category/${category._id}?tab=replies`}
                      className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
                    >
                      Replies
                    </Link>
                    <Link
                      to={`/category/${category._id}/create-post?mode=post`}
                      className={`px-3 py-2 rounded-xl bg-primary text-white text-sm ${
                        category.isLocked ? "opacity-50 pointer-events-none" : ""
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

        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Users className="mr-2" /> Support Circles
          </h2>

          {filteredCircles.length === 0 ? (
            <p className="text-gray-600">No circles found.</p>
          ) : (
            filteredCircles.slice(0, 6).map((circle) => {
              const joined = meId && circle.isMember;
              const hasPending = !!circle.pendingJoinRequest;

              return (
                <div
                  key={circle._id}
                  className="mb-4 border border-white/40 rounded-2xl p-4 bg-white/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{circle.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{circle.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {circle.membersCount || circle.members?.length || 0} members
                      </p>
                    </div>

                    {joined ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        Joined
                      </span>
                    ) : hasPending ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                        Pending
                      </span>
                    ) : null}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Link
                      to={`/group/${circle._id}`}
                      className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
                    >
                      View
                    </Link>

                    <button
                      onClick={() => joinCircle(circle)}
                      className={`btn-primary ${
                        joined || hasPending ? "opacity-60 pointer-events-none" : ""
                      }`}
                    >
                      {hasPending ? "Requested" : joined ? "Joined" : "Join"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <div className="glass-card p-5">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="text-blue-600" />
          Community reminder
        </h3>
        <p className="text-sm text-gray-700 mt-2">
          Respect privacy, avoid sharing harmful misinformation, and use live sessions and support
          circles responsibly.
        </p>
        <Link to="/dashboard" className="text-primary mt-3 inline-flex items-center gap-2">
          Go to Dashboard <ChevronRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
};

export default Forum;