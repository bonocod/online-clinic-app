import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { connectSocket, joinPublicHealthEvent, leavePublicHealthEvent } from "../utils/socket";
import {
  Play,
  Calendar,
  Users,
  MessageSquare,
  Send,
  CheckCircle2,
  Radio,
  Video,
  AlertCircle,
} from "lucide-react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";

const PublicHealthEventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [livekitToken, setLivekitToken] = useState(null);
  const [livekitUrl, setLivekitUrl] = useState(null);
  const [livekitError, setLivekitError] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");
  const questionsEndRef = useRef(null);
  const isLoggedIn = !!localStorage.getItem("token");

  const fetchEvent = useCallback(async () => {
    try {
      const res = await api.get(`/public-health/events/${id}`);
      setEvent(res.data.event);
      setQuestions(res.data.approvedQuestions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await api.get(`/public-health/events/${id}/questions`);
      setQuestions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    }
  }, [id]);

  const fetchLiveKitToken = useCallback(async () => {
    if (!isLoggedIn) return;
    setTokenLoading(true);
    setLivekitError(null);
    try {
      const res = await api.get(`/public-health/events/${id}/livekit-token`);
      setLivekitToken(res.data.token);
      setLivekitUrl(res.data.livekitUrl);
    } catch (e) {
      setLivekitError(
        e.response?.data?.msg || "Unable to connect to live stream"
      );
    } finally {
      setTokenLoading(false);
    }
  }, [id, isLoggedIn]);

  useEffect(() => {
    fetchEvent();

    const s = connectSocket();
    joinPublicHealthEvent(id);

    s.on("publicHealth:eventStarted", (data) => {
      if (String(data.eventId) === String(id)) {
        fetchEvent();
      }
    });

    s.on("publicHealth:eventEnded", (data) => {
      if (String(data.eventId) === String(id)) {
        fetchEvent();
        setLivekitToken(null);
      }
    });

    s.on("publicHealth:eventQuestionApproved", (data) => {
      if (String(data.eventId) === String(id)) {
        const q = data.question;
        setQuestions((prev) => {
          const exists = prev.some((x) => String(x._id) === String(q._id));
          if (exists) return prev.map((x) => (String(x._id) === String(q._id) ? q : x));
          return [...prev, q];
        });
      }
    });

    s.on("publicHealth:eventQuestionAnswered", (data) => {
      if (String(data.eventId) === String(id)) {
        const q = data.question;
        setQuestions((prev) =>
          prev.map((x) => (String(x._id) === String(q._id) ? q : x))
        );
      }
    });

    return () => {
      leavePublicHealthEvent(id);
      s.off("publicHealth:eventStarted");
      s.off("publicHealth:eventEnded");
      s.off("publicHealth:eventQuestionApproved");
      s.off("publicHealth:eventQuestionAnswered");
    };
  }, [id, fetchEvent]);

  useEffect(() => {
    if (event?.status === "live") {
      fetchLiveKitToken();
      fetchQuestions();
    }
  }, [event?.status, fetchLiveKitToken, fetchQuestions]);

  useEffect(() => {
    questionsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [questions.length]);

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");
    try {
      await api.post(`/public-health/events/${id}/questions`, {
        questionText: questionText.trim(),
        anonymous,
      });
      setQuestionText("");
      setSubmitSuccess("Question submitted! It will appear once approved.");
      setTimeout(() => setSubmitSuccess(""), 5000);
    } catch (e) {
      setSubmitError(e.response?.data?.msg || "Failed to submit question");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );

  if (!event)
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Event not found.</p>
        <Link to="/public-health/events" className="text-primary mt-4 inline-block">
          ← Back to Events
        </Link>
      </div>
    );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <Link to="/public-health/events" className="text-primary flex items-center gap-2 hover:underline">
        ← Back to Events
      </Link>

      {/* Event Header */}
      <div className="glass-card p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              {event.status === "live" && (
                <span className="flex items-center gap-1.5 bg-red-600 text-white text-sm px-3 py-1 rounded-full animate-pulse">
                  <Radio size={14} /> LIVE NOW
                </span>
              )}
              {event.status === "upcoming" && (
                <span className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                  <Calendar size={14} /> Upcoming
                </span>
              )}
              {event.status === "past" && (
                <span className="flex items-center gap-1.5 bg-gray-400 text-white text-sm px-3 py-1 rounded-full">
                  Past
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <Users size={16} />
              {event.hostName} · {event.hostRole} · {event.organization}
            </p>
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
              <Calendar size={13} />
              {new Date(event.scheduledAt).toLocaleString()}
              {event.endAt && ` – ${new Date(event.endAt).toLocaleString()}`}
            </p>
          </div>
        </div>

        {event.description && (
          <div className="mt-6 pt-6 border-t border-white/40">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {event.description}
            </p>
          </div>
        )}
      </div>

      {/* LiveKit Video Room */}
      {event.status === "live" && (
        <div className="glass-card p-6">
          <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Video className="text-red-600" size={20} />
            Live Stream
          </h2>

          {!isLoggedIn ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
              <p className="text-yellow-800 font-medium">
                Please{" "}
                <Link to="/login" className="text-primary underline">
                  log in
                </Link>{" "}
                to watch the live stream.
              </p>
            </div>
          ) : tokenLoading ? (
            <div className="flex items-center justify-center h-48 bg-gray-50 rounded-2xl">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
            </div>
          ) : livekitError ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <AlertCircle className="mx-auto text-red-500 mb-2" size={28} />
              <p className="text-red-700 font-medium">{livekitError}</p>
              <button
                onClick={fetchLiveKitToken}
                className="mt-3 btn-primary text-sm"
              >
                Retry Connection
              </button>
            </div>
          ) : livekitToken && livekitUrl ? (
            <div className="rounded-2xl overflow-hidden" style={{ height: "520px" }}>
              <LiveKitRoom
                token={livekitToken}
                serverUrl={livekitUrl}
                connect={true}
                video={false}
                audio={false}
                data-lk-theme="default"
                style={{ height: "100%" }}
              >
                <VideoConference />
              </LiveKitRoom>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
              <p className="text-gray-500">Stream not available yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Past event replay */}
      {event.status === "past" && event.replayUrl && (
        <div className="glass-card p-6">
          <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Play size={20} className="text-primary" />
            Event Recording
          </h2>
          <video
            controls
            className="w-full rounded-2xl"
            src={event.replayUrl}
          />
        </div>
      )}

      {/* Q&A Section */}
      {(event.status === "live" || event.status === "past") && (
        <div className="glass-card p-6">
          <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
            <MessageSquare className="text-primary" size={20} />
            Questions & Answers
            <span className="text-sm font-normal text-gray-500 ml-1">
              ({questions.length} approved)
            </span>
          </h2>

          {/* Submit Question Form */}
          {event.status === "live" && (
            <div className="mb-8">
              {!isLoggedIn ? (
                <p className="text-sm text-gray-500">
                  <Link to="/login" className="text-primary underline">
                    Log in
                  </Link>{" "}
                  to ask a question.
                </p>
              ) : (
                <form onSubmit={handleSubmitQuestion} className="space-y-3">
                  <textarea
                    className="input-field min-h-[100px] resize-none"
                    placeholder="Type your question here..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    maxLength={2000}
                    required
                  />
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={anonymous}
                        onChange={(e) => setAnonymous(e.target.checked)}
                        className="rounded"
                      />
                      Submit anonymously
                    </label>
                    <button
                      type="submit"
                      disabled={submitting || !questionText.trim()}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send size={16} />
                      {submitting ? "Sending..." : "Submit Question"}
                    </button>
                  </div>
                  {submitSuccess && (
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
                      <CheckCircle2 size={16} />
                      {submitSuccess}
                    </div>
                  )}
                  {submitError && (
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 text-sm">
                      <AlertCircle size={16} />
                      {submitError}
                    </div>
                  )}
                </form>
              )}
            </div>
          )}

          {/* Questions List */}
          {questions.length === 0 ? (
            <p className="text-gray-500 text-sm">
              {event.status === "live"
                ? "No approved questions yet. Be the first to ask!"
                : "No questions were recorded for this event."}
            </p>
          ) : (
            <div className="space-y-5">
              {questions.map((q) => (
                <div
                  key={q._id}
                  className="border-l-4 border-primary pl-4 py-1"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {q.askedBy?.name || "Anonymous"}
                    </span>
                    {q.askedBy?.verified && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                        Verified
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(q.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">{q.questionText}</p>
                  {q.answerText && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3">
                      <p className="text-xs text-green-600 font-semibold mb-1">
                        Answer by {q.answeredBy?.name || "Host"}
                      </p>
                      <p className="text-sm text-green-800">{q.answerText}</p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={questionsEndRef} />
            </div>
          )}
        </div>
      )}

      {/* Upcoming info */}
      {event.status === "upcoming" && (
        <div className="glass-card p-8 text-center">
          <Calendar className="mx-auto text-primary mb-3" size={40} />
          <p className="text-xl font-bold text-gray-800">Event Starts At</p>
          <p className="text-2xl font-semibold text-primary mt-2">
            {new Date(event.scheduledAt).toLocaleString()}
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Come back when the event is live to watch the stream and ask questions.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default PublicHealthEventDetail;
