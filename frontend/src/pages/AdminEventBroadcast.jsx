import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  LiveKitRoom,
  useTracks,
  VideoTrack,
  RoomAudioRenderer,
  useLocalParticipant,
  useParticipants,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Radio,
  Square,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Users,
  Send,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

function BroadcastStudio({ eventId, event, onEndStream }) {
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled } = useLocalParticipant();
  const participants = useParticipants();
  const cameraTracks = useTracks([Track.Source.Camera]);
  const selfTrack = cameraTracks.find((t) => t.participant.isLocal);

  const [questions, setQuestions] = useState([]);
  const [answerTexts, setAnswerTexts] = useState({});
  const [expandedQ, setExpandedQ] = useState(null);
  const [answering, setAnswering] = useState(null);

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await api.get(`/public-health/manage/events/${eventId}/questions`);
      const all = Array.isArray(res.data) ? res.data : [];
      setQuestions(all.filter((q) => q.status === "pending" || q.status === "approved"));
    } catch {}
  }, [eventId]);

  useEffect(() => {
    fetchQuestions();
    const interval = setInterval(fetchQuestions, 8000);
    return () => clearInterval(interval);
  }, [fetchQuestions]);

  const approveQ = async (qId) => {
    try {
      await api.patch(`/public-health/manage/events/${eventId}/questions/${qId}/moderate`, {
        status: "approved",
      });
      fetchQuestions();
    } catch {}
  };

  const rejectQ = async (qId) => {
    try {
      await api.patch(`/public-health/manage/events/${eventId}/questions/${qId}/moderate`, {
        status: "rejected",
      });
      fetchQuestions();
    } catch {}
  };

  const answerQ = async (qId) => {
    const text = (answerTexts[qId] || "").trim();
    if (!text) return;
    setAnswering(qId);
    try {
      await api.patch(`/public-health/manage/events/${eventId}/questions/${qId}/answer`, {
        answerText: text,
      });
      setAnswerTexts((prev) => ({ ...prev, [qId]: "" }));
      setExpandedQ(null);
      fetchQuestions();
    } catch {}
    finally { setAnswering(null); }
  };

  const viewerCount = Math.max(0, participants.length - 1);
  const pending = questions.filter((q) => q.status === "pending");
  const approved = questions.filter((q) => q.status === "approved");

  return (
    <div
      style={{ background: "#08080f", minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#dc2626",
              color: "#fff",
              fontSize: 12,
              padding: "4px 12px",
              borderRadius: 999,
              fontWeight: 700,
              animation: "pulse 2s infinite",
            }}
          >
            <Radio size={13} /> LIVE
          </span>
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 15, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {event?.title}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            <Users size={14} /> {viewerCount} watching
          </span>
          <button
            onClick={onEndStream}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#7f1d1d",
              color: "#fff",
              padding: "7px 16px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#991b1b")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#7f1d1d")}
          >
            <Square size={13} fill="white" /> End Stream
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Video area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#000",
            position: "relative",
          }}
        >
          {selfTrack ? (
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <VideoTrack
                trackRef={selfTrack}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  left: 14,
                  background: "rgba(0,0,0,0.5)",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 11,
                  padding: "3px 8px",
                  borderRadius: 6,
                  backdropFilter: "blur(4px)",
                }}
              >
                You (Broadcasting)
              </div>
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.4)",
                gap: 12,
              }}
            >
              <VideoOff size={52} />
              <p style={{ fontSize: 16 }}>Camera is off</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
                Turn on your camera to stream video to viewers
              </p>
            </div>
          )}

          {/* Controls bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: "16px 24px",
              background: "rgba(0,0,0,0.8)",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
              title={isCameraEnabled ? "Turn off camera" : "Turn on camera"}
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isCameraEnabled ? "rgba(255,255,255,0.15)" : "#dc2626",
                color: "#fff",
                transition: "background 0.2s",
              }}
            >
              {isCameraEnabled ? <VideoIcon size={22} /> : <VideoOff size={22} />}
            </button>
            <button
              onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
              title={isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isMicrophoneEnabled ? "rgba(255,255,255,0.15)" : "#dc2626",
                color: "#fff",
                transition: "background 0.2s",
              }}
            >
              {isMicrophoneEnabled ? <Mic size={22} /> : <MicOff size={22} />}
            </button>
            <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.1)" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
              {isCameraEnabled ? "Camera on" : "Camera off"} ·{" "}
              {isMicrophoneEnabled ? "Mic on" : "Mic muted"}
            </span>
          </div>
        </div>

        {/* Q&A Sidebar */}
        <div
          style={{
            width: 320,
            display: "flex",
            flexDirection: "column",
            background: "#0d0d18",
            borderLeft: "1px solid rgba(255,255,255,0.07)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <MessageSquare size={15} /> Q&A
              {pending.length > 0 && (
                <span
                  style={{
                    background: "#f59e0b",
                    color: "#000",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 999,
                  }}
                >
                  {pending.length} pending
                </span>
              )}
            </span>
            <button
              onClick={fetchQuestions}
              style={{ color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", fontSize: 11 }}
            >
              Refresh
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
            {questions.length === 0 ? (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", paddingTop: 40, fontSize: 13 }}>
                <MessageSquare size={32} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
                <p>No questions yet</p>
                <p style={{ fontSize: 11, marginTop: 6, opacity: 0.6 }}>
                  Questions from viewers appear here for you to moderate and answer
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Pending first */}
                {pending.length > 0 && (
                  <p style={{ color: "#f59e0b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                    Awaiting approval
                  </p>
                )}
                {pending.map((q) => (
                  <div
                    key={q._id}
                    style={{
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.25)",
                      borderRadius: 10,
                      padding: 12,
                    }}
                  >
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginBottom: 6 }}>
                      {q.anonymous ? "Anonymous" : q.askedBy?.name || "User"}
                    </p>
                    <p style={{ color: "#fff", fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>
                      {q.questionText}
                    </p>
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button
                        onClick={() => approveQ(q._id)}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 5,
                          background: "rgba(22,163,74,0.25)",
                          border: "1px solid rgba(22,163,74,0.4)",
                          color: "#86efac",
                          borderRadius: 8,
                          padding: "6px 0",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        <CheckCircle2 size={13} /> Approve
                      </button>
                      <button
                        onClick={() => rejectQ(q._id)}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 5,
                          background: "rgba(220,38,38,0.2)",
                          border: "1px solid rgba(220,38,38,0.35)",
                          color: "#fca5a5",
                          borderRadius: 8,
                          padding: "6px 0",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  </div>
                ))}

                {approved.length > 0 && (
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>
                    Approved questions
                  </p>
                )}
                {approved.map((q) => (
                  <div
                    key={q._id}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10,
                      padding: 12,
                    }}
                  >
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 6 }}>
                      {q.anonymous ? "Anonymous" : q.askedBy?.name || "User"}
                    </p>
                    <p style={{ color: "#e5e7eb", fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>
                      {q.questionText}
                    </p>
                    {q.answerText ? (
                      <div
                        style={{
                          marginTop: 8,
                          background: "rgba(22,163,74,0.12)",
                          border: "1px solid rgba(22,163,74,0.2)",
                          borderRadius: 8,
                          padding: "8px 10px",
                        }}
                      >
                        <p style={{ color: "#86efac", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                          Your answer:
                        </p>
                        <p style={{ color: "#d1fae5", fontSize: 12 }}>{q.answerText}</p>
                      </div>
                    ) : expandedQ === q._id ? (
                      <div style={{ marginTop: 8 }}>
                        <textarea
                          rows={2}
                          placeholder="Type your answer..."
                          value={answerTexts[q._id] || ""}
                          onChange={(e) =>
                            setAnswerTexts((prev) => ({ ...prev, [q._id]: e.target.value }))
                          }
                          style={{
                            width: "100%",
                            background: "rgba(255,255,255,0.07)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 8,
                            color: "#fff",
                            padding: 8,
                            fontSize: 12,
                            resize: "none",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                          <button
                            onClick={() => answerQ(q._id)}
                            disabled={answering === q._id || !(answerTexts[q._id] || "").trim()}
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 5,
                              background: "#4f46e5",
                              color: "#fff",
                              border: "none",
                              borderRadius: 8,
                              padding: "7px 0",
                              cursor: "pointer",
                              fontSize: 12,
                              opacity: answering === q._id ? 0.6 : 1,
                            }}
                          >
                            <Send size={12} /> {answering === q._id ? "Sending..." : "Send Answer"}
                          </button>
                          <button
                            onClick={() => setExpandedQ(null)}
                            style={{
                              padding: "7px 10px",
                              background: "rgba(255,255,255,0.08)",
                              color: "rgba(255,255,255,0.5)",
                              border: "none",
                              borderRadius: 8,
                              cursor: "pointer",
                              fontSize: 12,
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setExpandedQ(q._id)}
                        style={{
                          marginTop: 8,
                          width: "100%",
                          background: "rgba(79,70,229,0.2)",
                          border: "1px solid rgba(79,70,229,0.35)",
                          color: "#a5b4fc",
                          borderRadius: 8,
                          padding: "6px 0",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        Answer this question
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminEventBroadcast() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const [event, setEvent] = useState(null);
  const [hostToken, setHostToken] = useState(null);
  const [livekitUrl, setLivekitUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    const init = async () => {
      try {
        const res = await api.get(`/public-health/events/${id}`);
        const ev = res.data.event || res.data;
        setEvent(ev);
        if (ev.status === "live") {
          const tokenRes = await api.get(`/public-health/manage/events/${id}/host-token`);
          setHostToken(tokenRes.data.token);
          setLivekitUrl(tokenRes.data.livekitUrl);
        }
      } catch (e) {
        setError(e.response?.data?.msg || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isAdmin, navigate]);

  const handleStartAndBroadcast = async () => {
    setStarting(true);
    setError(null);
    try {
      await api.patch(`/public-health/manage/events/${id}/start`);
      const tokenRes = await api.get(`/public-health/manage/events/${id}/host-token`);
      setHostToken(tokenRes.data.token);
      setLivekitUrl(tokenRes.data.livekitUrl);
      setEvent((prev) => ({ ...prev, status: "live" }));
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to start event");
    } finally {
      setStarting(false);
    }
  };

  const handleEndStream = async () => {
    try {
      await api.patch(`/public-health/manage/events/${id}/end`);
    } catch {}
    navigate("/admin");
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#08080f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid rgba(255,255,255,0.15)",
            borderTopColor: "#4f46e5",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#08080f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
          color: "#fff",
        }}
      >
        <AlertCircle size={40} color="#f87171" />
        <p style={{ color: "#f87171", fontSize: 16 }}>{error}</p>
        <button
          onClick={() => navigate("/admin")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={16} /> Back to Admin
        </button>
      </div>
    );
  }

  if (!hostToken) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#08080f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 0,
          color: "#fff",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: 40,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              background: "rgba(220,38,38,0.15)",
              border: "1px solid rgba(220,38,38,0.3)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Radio size={28} color="#f87171" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Ready to Go Live</h1>
          {event && (
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 6 }}>
              {event.title}
            </p>
          )}
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 32, lineHeight: 1.5 }}>
            Your camera and microphone will be requested. Viewers will be able to watch your live stream.
          </p>
          {error && (
            <div
              style={{
                background: "rgba(220,38,38,0.1)",
                border: "1px solid rgba(220,38,38,0.3)",
                borderRadius: 10,
                padding: "10px 14px",
                color: "#fca5a5",
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              {error}
            </div>
          )}
          <button
            onClick={handleStartAndBroadcast}
            disabled={starting}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: starting ? "#7f1d1d" : "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "14px 0",
              cursor: starting ? "default" : "pointer",
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 14,
              transition: "background 0.2s",
            }}
          >
            <Radio size={18} /> {starting ? "Starting..." : "Start Event & Go Live"}
          </button>
          <button
            onClick={() => navigate("/admin")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.5)",
              border: "none",
              borderRadius: 12,
              padding: "12px 0",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            <ArrowLeft size={15} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#08080f" }}>
      <LiveKitRoom
        token={hostToken}
        serverUrl={livekitUrl}
        connect={true}
        video={true}
        audio={true}
        data-lk-theme="default"
        style={{ height: "100vh", background: "#08080f" }}
      >
        <RoomAudioRenderer />
        <BroadcastStudio eventId={id} event={event} onEndStream={handleEndStream} />
      </LiveKitRoom>
    </div>
  );
}
