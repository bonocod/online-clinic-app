import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";
import {
  AlertCircle,
  Clock,
  Activity,
  HelpCircle,
  Send,
  Radio,
  PlayCircle,
  SkipForward,
  Square,
  PlusCircle,
  Eye,
  Shield,
  Users,
  MessageSquareText,
} from "lucide-react";
import {
  connectSocket,
  joinLiveSession,
  leaveLiveSession,
  joinDoctors,
  leaveDoctors,
  joinProfessionals,
  leaveProfessionals,
} from "../../utils/socket";

const fmt = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "";
  }
};

const DoctorConsole = () => {
  const [user, setUser] = useState(null);

  const [tab, setTab] = useState("questions");
  const [filter, setFilter] = useState("general");

  const [questions, setQuestions] = useState([]);
  const [attentionPosts, setAttentionPosts] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [stats, setStats] = useState({
    answeredQuestions: 0,
    avgResponseMinutes: 0,
  });

  const [liveSessions, setLiveSessions] = useState([]);
  const [selectedLiveId, setSelectedLiveId] = useState("");
  const [liveDetail, setLiveDetail] = useState(null);
  const [forumCategories, setForumCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [answeringId, setAnsweringId] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [answering, setAnswering] = useState(false);

  const [liveAnswerText, setLiveAnswerText] = useState("");
  const [liveSubmitting, setLiveSubmitting] = useState(false);
  const [startingLive, setStartingLive] = useState(false);

  // UI-only draft for future backend tip feature
  const [observerTipDraft, setObserverTipDraft] = useState("");

  const [newLiveSession, setNewLiveSession] = useState({
    title: "",
    description: "",
    categoryId: "",
    scheduledEndAt: "",
  });

  const activeLiveSession = useMemo(() => {
    return (
      liveSessions.find((session) => String(session._id) === String(selectedLiveId)) || null
    );
  }, [liveSessions, selectedLiveId]);

  const isHostOfSelectedSession = useMemo(() => {
    const starterId =
      liveDetail?.session?.startedBy?._id || activeLiveSession?.startedBy?._id || "";
    return !!user?._id && String(starterId) === String(user._id);
  }, [user, liveDetail, activeLiveSession]);

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data || null);
    } catch {
      setUser(null);
    }
  }, []);

  const fetchQuestions = useCallback(async () => {
    const res = await api.get(`/professional/questions?filter=${filter}&status=unanswered`);
    setQuestions(Array.isArray(res.data) ? res.data : []);
  }, [filter]);

  const fetchAttentionPosts = useCallback(async () => {
    const res = await api.get("/professional/posts-needing-attention");
    setAttentionPosts(Array.isArray(res.data) ? res.data : []);
  }, []);

  const fetchHighlights = useCallback(async () => {
    const res = await api.get("/professional/discussion-highlights");
    setHighlights(Array.isArray(res.data) ? res.data : []);
  }, []);

  const fetchStats = useCallback(async () => {
    const res = await api.get("/professional/stats");
    setStats(res.data || { answeredQuestions: 0, avgResponseMinutes: 0 });
  }, []);

  const fetchForumCategories = useCallback(async () => {
    const res = await api.get("/forum/categories");
    const items = Array.isArray(res.data) ? res.data : [];
    setForumCategories(items);

    setNewLiveSession((prev) => ({
      ...prev,
      categoryId: prev.categoryId || items[0]?._id || "",
    }));
  }, []);

  const fetchLiveSessions = useCallback(async () => {
    const res = await api.get("/forum/live-sessions?status=live");
    const items = Array.isArray(res.data) ? res.data : [];
    setLiveSessions(items);

    if (!selectedLiveId && items[0]?._id) {
      setSelectedLiveId(items[0]._id);
    }

    if (
      selectedLiveId &&
      items.length > 0 &&
      !items.some((item) => String(item._id) === String(selectedLiveId))
    ) {
      setSelectedLiveId(items[0]._id);
    }

    if (items.length === 0) {
      setSelectedLiveId("");
      setLiveDetail(null);
    }
  }, [selectedLiveId]);

  const fetchLiveDetail = useCallback(async () => {
    if (!selectedLiveId) {
      setLiveDetail(null);
      return;
    }

    const res = await api.get(`/forum/live-sessions/${selectedLiveId}`);
    setLiveDetail(res.data || null);
  }, [selectedLiveId]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        if (tab === "questions") await fetchQuestions();
        if (tab === "attention") await fetchAttentionPosts();
        if (tab === "highlights") await fetchHighlights();
        if (tab === "stats") await fetchStats();
        if (tab === "live") {
          await Promise.all([fetchLiveSessions(), fetchForumCategories(), fetchMe()]);
        }
      } catch (e) {
        setError(e.response?.data?.msg || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [
    tab,
    filter,
    fetchQuestions,
    fetchAttentionPosts,
    fetchHighlights,
    fetchStats,
    fetchLiveSessions,
    fetchForumCategories,
    fetchMe,
  ]);

  useEffect(() => {
    if (tab === "live" && selectedLiveId) {
      fetchLiveDetail().catch(() => {});
    }
  }, [tab, selectedLiveId, fetchLiveDetail]);

  useEffect(() => {
    const s = connectSocket();

    joinDoctors();
    joinProfessionals();

    const refreshQuestions = async () => {
      if (tab === "questions") {
        try {
          await fetchQuestions();
        } catch {}
      }
    };

    const refreshLive = async () => {
      if (tab !== "live") return;

      try {
        await fetchLiveSessions();
        if (selectedLiveId) {
          await fetchLiveDetail();
        }
      } catch {}
    };

    s.on("question:answered", refreshQuestions);
    s.on("liveSession:started", refreshLive);
    s.on("liveSession:updated", refreshLive);
    s.on("liveSession:state", refreshLive);
    s.on("liveSession:questionQueued", refreshLive);
    s.on("liveSession:questionActive", refreshLive);
    s.on("liveSession:questionAnswered", refreshLive);
    s.on("liveSession:ended", refreshLive);

    return () => {
      leaveDoctors();
      leaveProfessionals();

      s.off("question:answered", refreshQuestions);
      s.off("liveSession:started", refreshLive);
      s.off("liveSession:updated", refreshLive);
      s.off("liveSession:state", refreshLive);
      s.off("liveSession:questionQueued", refreshLive);
      s.off("liveSession:questionActive", refreshLive);
      s.off("liveSession:questionAnswered", refreshLive);
      s.off("liveSession:ended", refreshLive);
    };
  }, [tab, selectedLiveId, fetchQuestions, fetchLiveSessions, fetchLiveDetail]);

  useEffect(() => {
    if (!selectedLiveId) return;

    joinLiveSession(selectedLiveId);

    return () => {
      leaveLiveSession(selectedLiveId);
    };
  }, [selectedLiveId]);

  const claimQuestion = async (id) => {
    setClaiming(true);
    try {
      await api.post(`/professional/questions/${id}/claim`);
      await fetchQuestions();
    } catch (e) {
      alert(e.response?.data?.msg || "Claim failed");
    } finally {
      setClaiming(false);
    }
  };

  const submitAnswer = async (id) => {
    if (!answerText.trim()) return;

    setAnswering(true);
    try {
      await api.post(`/professional/questions/${id}/answer`, {
        answer: answerText.trim(),
      });
      setAnswerText("");
      setAnsweringId(null);
      await fetchQuestions();
      alert("Answered");
    } catch (e) {
      alert(e.response?.data?.msg || "Answer failed");
    } finally {
      setAnswering(false);
    }
  };

  const markResolved = async (postId) => {
    try {
      await api.post(`/forum/posts/${postId}/resolve`);
      await fetchAttentionPosts();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed");
    }
  };

  const startLiveSession = async (e) => {
    e.preventDefault();
    if (!newLiveSession.title.trim()) return;

    setStartingLive(true);
    try {
      const payload = {
        title: newLiveSession.title.trim(),
        description: newLiveSession.description.trim(),
        categoryId: newLiveSession.categoryId || null,
        scheduledEndAt: newLiveSession.scheduledEndAt
          ? new Date(newLiveSession.scheduledEndAt).toISOString()
          : null,
      };

      const res = await api.post("/forum/live-sessions", payload);
      const created = res.data;

      setNewLiveSession({
        title: "",
        description: "",
        categoryId: forumCategories[0]?._id || "",
        scheduledEndAt: "",
      });

      await fetchLiveSessions();
      if (created?._id) {
        setSelectedLiveId(created._id);
      }
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to start live session");
    } finally {
      setStartingLive(false);
    }
  };

  const activateNextQuestion = async () => {
    if (!selectedLiveId) return;

    try {
      await api.post(`/forum/live-sessions/${selectedLiveId}/next`);
      await fetchLiveDetail();
      await fetchLiveSessions();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to activate next question");
    }
  };

  const answerLiveQuestion = async () => {
    const activeQuestionId = liveDetail?.activeQuestion?._id;
    if (!selectedLiveId || !activeQuestionId || !liveAnswerText.trim()) return;

    setLiveSubmitting(true);
    try {
      await api.post(
        `/forum/live-sessions/${selectedLiveId}/questions/${activeQuestionId}/answer`,
        { answer: liveAnswerText.trim() }
      );
      setLiveAnswerText("");
      await fetchLiveDetail();
      await fetchLiveSessions();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to answer live question");
    } finally {
      setLiveSubmitting(false);
    }
  };

  const skipLiveQuestion = async () => {
    const activeQuestionId = liveDetail?.activeQuestion?._id;
    if (!selectedLiveId || !activeQuestionId) return;

    try {
      await api.post(
        `/forum/live-sessions/${selectedLiveId}/questions/${activeQuestionId}/skip`
      );
      await fetchLiveDetail();
      await fetchLiveSessions();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to skip question");
    }
  };

  const endLiveSession = async () => {
    if (!selectedLiveId) return;
    if (!window.confirm("End this live session?")) return;

    try {
      await api.post(`/forum/live-sessions/${selectedLiveId}/end`);
      await fetchLiveSessions();
      setLiveDetail(null);
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to end live session");
    }
  };

  const tabs = [
    { id: "questions", label: "Unanswered Questions", icon: HelpCircle },
    { id: "attention", label: "Posts Needing Attention", icon: AlertCircle },
    { id: "highlights", label: "Discussion Highlights", icon: Clock },
    { id: "live", label: "Live Sessions", icon: Radio },
    { id: "stats", label: "Stats", icon: Activity },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">Doctor Console</h1>
      <p>Professional dashboard</p>

      <div className="flex gap-3 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`px-4 py-2 rounded-full flex items-center gap-2 ${
              tab === item.id ? "bg-primary text-white" : "bg-gray-200"
            }`}
          >
            <item.icon size={18} /> {item.label}
          </button>
        ))}
      </div>

      {tab === "questions" && (
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("general")}
            className={`px-4 py-2 rounded-full ${
              filter === "general" ? "bg-gray-900 text-white" : "bg-gray-200"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setFilter("myposts")}
            className={`px-4 py-2 rounded-full ${
              filter === "myposts" ? "bg-gray-900 text-white" : "bg-gray-200"
            }`}
          >
            My Posts
          </button>
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {tab === "questions" && (
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question._id} className="glass-card p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-bold">Question</p>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                  {question.claimActive ? "claimed" : "unclaimed"}
                </span>
              </div>

              {question.postId?._id ? (
                <p className="text-sm text-gray-600 mt-1">
                  On post:{" "}
                  <Link to={`/post/${question.postId._id}`} className="text-primary underline">
                    {question.postId.title}
                  </Link>
                </p>
              ) : (
                <p className="text-sm text-gray-600 mt-1">General queue</p>
              )}

              <p className="mt-3 text-gray-800 whitespace-pre-wrap">{question.body}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => claimQuestion(question._id)}
                  className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
                  disabled={claiming}
                >
                  {claiming ? "Claiming..." : "Claim"}
                </button>

                <button
                  onClick={() =>
                    setAnsweringId((prev) => (prev === question._id ? null : question._id))
                  }
                  className="btn-primary"
                >
                  Answer
                </button>
              </div>

              {answeringId === question._id && (
                <div className="mt-4 border rounded-xl p-3 bg-white/60">
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    className="input-field w-full min-h-[120px]"
                    placeholder="Write your answer..."
                  />
                  <button
                    onClick={() => submitAnswer(question._id)}
                    className="btn-primary mt-3 flex items-center gap-2"
                    disabled={answering || !answerText.trim()}
                  >
                    <Send size={16} />
                    {answering ? "Submitting..." : "Submit Answer"}
                  </button>
                </div>
              )}
            </div>
          ))}

          {questions.length === 0 && !loading && <p>No unanswered questions.</p>}
        </div>
      )}

      {tab === "attention" && (
        <div className="space-y-4">
          {attentionPosts.map((post) => (
            <div key={post._id} className="glass-card p-4">
              <h3 className="font-bold">{post.title}</h3>
              <p className="text-sm text-gray-600">
                Category: {post.category?.name || "Unknown"} • {fmt(post.createdAt)}
              </p>
              <p className="mt-2 text-gray-800 whitespace-pre-wrap">
                {post.body?.length > 200 ? `${post.body.slice(0, 200)}...` : post.body}
              </p>
              <div className="flex gap-2 mt-3">
                <Link to={`/post/${post._id}`} className="btn-primary">
                  Open
                </Link>
                <button
                  onClick={() => markResolved(post._id)}
                  className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
                >
                  Mark handled
                </button>
              </div>
            </div>
          ))}
          {attentionPosts.length === 0 && !loading && <p>No posts needing attention.</p>}
        </div>
      )}

      {tab === "highlights" && (
        <div className="space-y-4">
          {highlights.map((comment) => (
            <div key={comment._id} className="glass-card p-4">
              <p className="text-sm text-gray-600">
                Discussion:{" "}
                <Link to={`/discussion/${comment.discussion?._id}`} className="text-primary underline">
                  {comment.discussion?.title || "Open"}
                </Link>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                By {comment.author?.name || "Unknown"} • {fmt(comment.createdAt)}
              </p>
              <p className="mt-2 text-gray-800 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
          {highlights.length === 0 && !loading && <p>No highlights yet.</p>}
        </div>
      )}

      {tab === "live" && (
        <div className="space-y-6">
          <div className="glass-card p-5">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PlusCircle className="text-blue-600" />
              Start Live Session
            </h2>

            <form onSubmit={startLiveSession} className="space-y-3">
              <input
                className="input-field"
                placeholder="Session title"
                value={newLiveSession.title}
                onChange={(e) =>
                  setNewLiveSession((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />

              <textarea
                className="input-field min-h-[90px]"
                placeholder="Description"
                value={newLiveSession.description}
                onChange={(e) =>
                  setNewLiveSession((prev) => ({ ...prev, description: e.target.value }))
                }
              />

              <select
                className="input-field"
                value={newLiveSession.categoryId}
                onChange={(e) =>
                  setNewLiveSession((prev) => ({ ...prev, categoryId: e.target.value }))
                }
              >
                <option value="">General</option>
                {forumCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Scheduled end time (optional)
                </label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={newLiveSession.scheduledEndAt}
                  onChange={(e) =>
                    setNewLiveSession((prev) => ({
                      ...prev,
                      scheduledEndAt: e.target.value,
                    }))
                  }
                />
              </div>

              <button
                type="submit"
                disabled={startingLive || !newLiveSession.title.trim()}
                className="btn-primary"
              >
                {startingLive ? "Starting..." : "Start Session"}
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="glass-card p-5 xl:col-span-1">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Active Sessions</h2>

              {liveSessions.length === 0 ? (
                <p className="text-gray-600">No live sessions right now.</p>
              ) : (
                <div className="space-y-3">
                  {liveSessions.map((session) => {
                    const mine =
                      !!user?._id && String(session.startedBy?._id) === String(user._id);

                    return (
                      <button
                        key={session._id}
                        onClick={() => setSelectedLiveId(session._id)}
                        className={`w-full text-left rounded-2xl border p-4 transition ${
                          String(selectedLiveId) === String(session._id)
                            ? "bg-blue-50 border-blue-300"
                            : "bg-white/60 border-white/40 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-gray-900">{session.title}</p>
                          {mine ? (
                            <span className="text-[11px] px-2 py-1 rounded-full bg-green-100 text-green-700">
                              Host
                            </span>
                          ) : (
                            <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                              Observer
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mt-1">
                          {session.categoryId?.name || "General"}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Started {fmt(session.startedAt)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="glass-card p-5 xl:col-span-2">
              {!activeLiveSession || !liveDetail ? (
                <p className="text-gray-600">Select a live session to view it.</p>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Radio className="text-red-500" />
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                          LIVE
                        </span>

                        {isHostOfSelectedSession ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                            <Shield size={12} />
                            Host controls
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <Eye size={12} />
                            Observer view
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl font-bold text-gray-900">
                        {activeLiveSession.title}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {activeLiveSession.description || "Live question session"}
                      </p>
                    </div>

                    {isHostOfSelectedSession ? (
                      <button
                        onClick={endLiveSession}
                        className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                      >
                        <Square size={16} />
                        End Session
                      </button>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
                      <p className="text-xs text-gray-500">Queue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {liveDetail.queueCount || 0}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
                      <p className="text-xs text-gray-500">Answered</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {activeLiveSession.answeredCount || 0}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {activeLiveSession.totalQuestions || 0}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
                      <p className="text-xs text-gray-500">Started</p>
                      <p className="text-sm font-bold text-gray-900">
                        {fmt(activeLiveSession.startedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/60 rounded-2xl border border-white/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-bold text-gray-900">Current Active Question</h3>

                      {isHostOfSelectedSession && !liveDetail.activeQuestion ? (
                        <button
                          onClick={activateNextQuestion}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                        >
                          <PlayCircle size={16} />
                          Next Question
                        </button>
                      ) : null}
                    </div>

                    {!liveDetail.activeQuestion ? (
                      <p className="text-gray-600 mt-3">No active question right now.</p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        <p className="text-sm text-gray-600">
                          Asked by {liveDetail.activeQuestion.askedBy?.name || "Anonymous"}
                        </p>

                        <p className="text-gray-900 whitespace-pre-wrap">
                          {liveDetail.activeQuestion.body}
                        </p>

                        {isHostOfSelectedSession ? (
                          <>
                            <textarea
                              value={liveAnswerText}
                              onChange={(e) => setLiveAnswerText(e.target.value)}
                              className="input-field min-h-[120px]"
                              placeholder="Type the live answer..."
                            />

                            <div className="flex gap-2">
                              <button
                                onClick={answerLiveQuestion}
                                disabled={liveSubmitting || !liveAnswerText.trim()}
                                className="btn-primary flex items-center gap-2"
                              >
                                <Send size={16} />
                                {liveSubmitting ? "Submitting..." : "Answer"}
                              </button>

                              <button
                                onClick={skipLiveQuestion}
                                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 flex items-center gap-2"
                              >
                                <SkipForward size={16} />
                                Skip
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                            <p className="text-sm text-blue-800">
                              You are viewing this session as another doctor. You can follow the
                              live flow here, but only the hosting doctor can activate, answer,
                              skip, or end questions with the current backend.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {isHostOfSelectedSession ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <div className="bg-white/60 rounded-2xl border border-white/40 p-4">
                        <h3 className="font-bold text-gray-900 mb-3">Queued Questions</h3>

                        {(liveDetail.queue || []).length === 0 ? (
                          <p className="text-gray-600">No queued questions.</p>
                        ) : (
                          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                            {liveDetail.queue.map((question, index) => (
                              <div
                                key={question._id}
                                className="border border-white/40 rounded-xl p-3 bg-white/70"
                              >
                                <p className="text-xs text-gray-500">Position {index + 1}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {question.askedBy?.name || "Anonymous"}
                                </p>
                                <p className="text-gray-800 whitespace-pre-wrap mt-2">
                                  {question.body}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="bg-white/60 rounded-2xl border border-white/40 p-4">
                        <h3 className="font-bold text-gray-900 mb-3">Recently Answered</h3>

                        {(liveDetail.answeredQuestions || []).length === 0 ? (
                          <p className="text-gray-600">No answers yet.</p>
                        ) : (
                          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                            {liveDetail.answeredQuestions.map((question) => (
                              <div
                                key={question._id}
                                className="border border-white/40 rounded-xl p-3 bg-white/70"
                              >
                                <p className="text-sm text-gray-600">
                                  {question.askedBy?.name || "Anonymous"}
                                </p>
                                <p className="text-gray-900 whitespace-pre-wrap mt-2">
                                  {question.body}
                                </p>
                                <p className="text-green-700 whitespace-pre-wrap mt-3">
                                  {question.answer}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <div className="bg-white/60 rounded-2xl border border-white/40 p-4">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Users size={18} />
                          Observer View
                        </h3>
                        <p className="text-sm text-gray-700">
                          You can monitor what is happening in real time, open the public session,
                          and review answered questions.
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          Queue details are intentionally reserved for the hosting doctor or admin,
                          matching your backend access control.
                        </p>
                      </div>

                      <div className="bg-white/60 rounded-2xl border border-white/40 p-4">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <MessageSquareText size={18} />
                          Additional Doctor Tips
                        </h3>

                        <textarea
                          value={observerTipDraft}
                          onChange={(e) => setObserverTipDraft(e.target.value)}
                          className="input-field min-h-[120px]"
                          placeholder="Draft an extra professional tip..."
                        />

                        <button
                          type="button"
                          disabled
                          className="mt-3 px-4 py-2 rounded-xl bg-gray-200 text-gray-500 cursor-not-allowed"
                        >
                          Needs backend route first
                        </button>

                        <p className="text-xs text-gray-500 mt-2">
                          To make this submit for real, add a backend endpoint for live session
                          expert tips/comments.
                        </p>
                      </div>

                      <div className="bg-white/60 rounded-2xl border border-white/40 p-4 xl:col-span-2">
                        <h3 className="font-bold text-gray-900 mb-3">Recently Answered</h3>

                        {(liveDetail.answeredQuestions || []).length === 0 ? (
                          <p className="text-gray-600">No answers yet.</p>
                        ) : (
                          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                            {liveDetail.answeredQuestions.map((question) => (
                              <div
                                key={question._id}
                                className="border border-white/40 rounded-xl p-3 bg-white/70"
                              >
                                <p className="text-sm text-gray-600">
                                  {question.askedBy?.name || "Anonymous"}
                                </p>
                                <p className="text-gray-900 whitespace-pre-wrap mt-2">
                                  {question.body}
                                </p>
                                <p className="text-green-700 whitespace-pre-wrap mt-3">
                                  {question.answer}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Link
                    to={`/live-sessions/${activeLiveSession._id}`}
                    className="inline-flex items-center text-primary"
                  >
                    Open public session view
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "stats" && (
        <div className="glass-card p-4 space-y-2">
          <p>Answered questions: {stats.answeredQuestions}</p>
          <p>Average response time: {stats.avgResponseMinutes} minutes</p>
        </div>
      )}

      <Link to="/dashboard" className="btn-primary">
        Go to User Dashboard
      </Link>
    </motion.div>
  );
};

export default DoctorConsole;