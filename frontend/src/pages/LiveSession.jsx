import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import {
  AlertCircle,
  Radio,
  Clock3,
  Send,
  PlayCircle,
  SkipForward,
  Square,
  Eye,
  Shield,
  Users,
  MessageSquareText,
  ChevronLeft,
} from "lucide-react";
import {
  connectSocket,
  joinLiveSession,
  leaveLiveSession,
} from "../utils/socket";

const fmt = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "";
  }
};

const LiveSession = () => {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [detail, setDetail] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [liveSubmitting, setLiveSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [questionBody, setQuestionBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [liveAnswerText, setLiveAnswerText] = useState("");

  // UI-only draft for later backend expert tips/comments
  const [observerTipDraft, setObserverTipDraft] = useState("");

  const session = detail?.session || null;

  const isHost = useMemo(() => {
    if (!user?._id || !session?.startedBy?._id) return false;
    return String(user._id) === String(session.startedBy._id);
  }, [user, session]);

  const isVerifiedProfessionalObserver = useMemo(() => {
    if (!user) return false;
    const isProfessional = ["doctor", "chw"].includes(user.role) && !!user.verified;
    return isProfessional && !isHost;
  }, [user, isHost]);

  const isPatient = useMemo(() => {
    return !!user && user.role === "patient";
  }, [user]);

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data || null);
    } catch {
      setUser(null);
    }
  }, []);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/forum/live-sessions/${id}`);
      setDetail(res.data || null);
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to load session");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMe();
    fetchDetail();
  }, [fetchMe, fetchDetail]);

  useEffect(() => {
    const s = connectSocket();
    joinLiveSession(id);

    const refresh = async () => {
      try {
        await fetchDetail();
      } catch {}
    };

    const onQueuePosition = (payload) => {
      if (!payload?.sessionId || String(payload.sessionId) !== String(id)) return;
      setDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          userQueuePosition: payload.position,
        };
      });
    };

    s.on("liveSession:started", refresh);
    s.on("liveSession:updated", refresh);
    s.on("liveSession:state", refresh);
    s.on("liveSession:questionQueued", refresh);
    s.on("liveSession:questionActive", refresh);
    s.on("liveSession:questionAnswered", refresh);
    s.on("liveSession:ended", refresh);
    s.on("liveSession:queuePosition", onQueuePosition);

    return () => {
      leaveLiveSession(id);

      s.off("liveSession:started", refresh);
      s.off("liveSession:updated", refresh);
      s.off("liveSession:state", refresh);
      s.off("liveSession:questionQueued", refresh);
      s.off("liveSession:questionActive", refresh);
      s.off("liveSession:questionAnswered", refresh);
      s.off("liveSession:ended", refresh);
      s.off("liveSession:queuePosition", onQueuePosition);
    };
  }, [id, fetchDetail]);

  const submitQuestion = async () => {
    if (!questionBody.trim()) return;

    setSubmittingQuestion(true);
    try {
      await api.post(`/forum/live-sessions/${id}/questions`, {
        body: questionBody.trim(),
        anonymous,
      });
      setQuestionBody("");
      setAnonymous(false);
      await fetchDetail();
      alert("Question submitted");
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to submit question");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const activateNextQuestion = async () => {
    try {
      await api.post(`/forum/live-sessions/${id}/next`);
      await fetchDetail();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to activate next question");
    }
  };

  const answerLiveQuestion = async () => {
    const activeQuestionId = detail?.activeQuestion?._id;
    if (!activeQuestionId || !liveAnswerText.trim()) return;

    setLiveSubmitting(true);
    try {
      await api.post(`/forum/live-sessions/${id}/questions/${activeQuestionId}/answer`, {
        answer: liveAnswerText.trim(),
      });
      setLiveAnswerText("");
      await fetchDetail();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to answer question");
    } finally {
      setLiveSubmitting(false);
    }
  };

  const skipLiveQuestion = async () => {
    const activeQuestionId = detail?.activeQuestion?._id;
    if (!activeQuestionId) return;

    try {
      await api.post(`/forum/live-sessions/${id}/questions/${activeQuestionId}/skip`);
      await fetchDetail();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to skip question");
    }
  };

  const endLiveSession = async () => {
    if (!window.confirm("End this live session?")) return;

    try {
      await api.post(`/forum/live-sessions/${id}/end`);
      await fetchDetail();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to end session");
    }
  };

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

  if (!detail || !session) {
    return (
      <div className="glass-card p-6">
        <p className="text-gray-700">Session not found.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Link to="/forum" className="inline-flex items-center gap-2 text-primary">
        <ChevronLeft size={18} />
        Back to forum
      </Link>

      <div className="glass-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {session.status === "live" ? (
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                  <Radio size={12} />
                  LIVE
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1">
                  <Clock3 size={12} />
                  ENDED
                </span>
              )}

              {isHost ? (
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                  <Shield size={12} />
                  Host view
                </span>
              ) : isVerifiedProfessionalObserver ? (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <Eye size={12} />
                  Professional observer
                </span>
              ) : isPatient ? (
                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <Users size={12} />
                  Patient view
                </span>
              ) : null}
            </div>

            <h1 className="text-3xl font-bold text-gray-900">{session.title}</h1>
            <p className="text-gray-600 mt-2">
              {session.description || "Live doctor question-and-answer session"}
            </p>

            <div className="mt-4 text-sm text-gray-700 space-y-1">
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
              {session.endedAt ? (
                <p>
                  <span className="font-medium">Ended:</span> {fmt(session.endedAt)}
                </p>
              ) : null}
              {session.scheduledEndAt ? (
                <p>
                  <span className="font-medium">Scheduled end:</span>{" "}
                  {fmt(session.scheduledEndAt)}
                </p>
              ) : null}
            </div>
          </div>

          {isHost && session.status === "live" ? (
            <button
              onClick={endLiveSession}
              className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
            >
              <Square size={16} />
              End Session
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
          <p className="text-xs text-gray-500">Queue</p>
          <p className="text-2xl font-bold text-gray-900">{detail.queueCount || 0}</p>
        </div>
        <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
          <p className="text-xs text-gray-500">Answered</p>
          <p className="text-2xl font-bold text-gray-900">{session.answeredCount || 0}</p>
        </div>
        <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{session.totalQuestions || 0}</p>
        </div>
        <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
          <p className="text-xs text-gray-500">Your position</p>
          <p className="text-2xl font-bold text-gray-900">
            {detail.userQueuePosition ?? "-"}
          </p>
        </div>
      </div>

      {isPatient && session.status === "live" && (
        <div className="glass-card p-5">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Ask a Question</h2>

          {detail.currentUserQuestion ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-blue-800 font-medium">
                You already have a question in this session.
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Queue position: {detail.userQueuePosition ?? "-"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={questionBody}
                onChange={(e) => setQuestionBody(e.target.value)}
                className="input-field min-h-[130px]"
                placeholder="Type your question..."
              />

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                />
                Ask anonymously
              </label>

              <button
                onClick={submitQuestion}
                disabled={submittingQuestion || !questionBody.trim()}
                className="btn-primary flex items-center gap-2"
              >
                <Send size={16} />
                {submittingQuestion ? "Submitting..." : "Submit Question"}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="glass-card p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl font-bold text-gray-900">Current Active Question</h2>

          {isHost && session.status === "live" && !detail.activeQuestion ? (
            <button
              onClick={activateNextQuestion}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <PlayCircle size={16} />
              Next Question
            </button>
          ) : null}
        </div>

        {!detail.activeQuestion ? (
          <p className="text-gray-600 mt-3">No active question right now.</p>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-600">
              Asked by {detail.activeQuestion.askedBy?.name || "Anonymous"}
            </p>
            <p className="text-gray-900 whitespace-pre-wrap">{detail.activeQuestion.body}</p>

            {isHost && session.status === "live" ? (
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
            ) : null}
          </div>
        )}
      </div>

      {isVerifiedProfessionalObserver && (
        <div className="glass-card p-5">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MessageSquareText size={20} />
            Extra Professional Tips
          </h2>

          <p className="text-sm text-gray-700 mb-3">
            You can watch the live session here as another verified professional.
            Sending extra tips/comments needs a backend route, so this UI is prepared but not
            submitting yet.
          </p>

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
        </div>
      )}

      {isHost && Array.isArray(detail.queue) && (
        <div className="glass-card p-5">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Queued Questions</h2>

          {detail.queue.length === 0 ? (
            <p className="text-gray-600">No queued questions.</p>
          ) : (
            <div className="space-y-3">
              {detail.queue.map((question, index) => (
                <div
                  key={question._id}
                  className="border border-white/40 rounded-xl p-3 bg-white/70"
                >
                  <p className="text-xs text-gray-500">Position {index + 1}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {question.askedBy?.name || "Anonymous"}
                  </p>
                  <p className="text-gray-800 whitespace-pre-wrap mt-2">{question.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="glass-card p-5">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Recently Answered</h2>

        {(detail.answeredQuestions || []).length === 0 ? (
          <p className="text-gray-600">No answered questions yet.</p>
        ) : (
          <div className="space-y-3">
            {detail.answeredQuestions.map((question) => (
              <div
                key={question._id}
                className="border border-white/40 rounded-xl p-3 bg-white/70"
              >
                <p className="text-sm text-gray-600">
                  {question.askedBy?.name || "Anonymous"}
                </p>
                <p className="text-gray-900 whitespace-pre-wrap mt-2">{question.body}</p>
                <p className="text-green-700 whitespace-pre-wrap mt-3">{question.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LiveSession;