import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import {
  Users,
  Shield,
  AlertCircle,
  Send,
  RefreshCw,
  MessageCircle,
  Lock,
  Globe,
  Clock3,
  CheckCircle2,
  XCircle,
  UserMinus,
} from "lucide-react";
import {
  connectSocket,
  joinGroup,
  leaveGroup,
  joinCircle,
  leaveCircle,
} from "../utils/socket";

const fmt = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "";
  }
};

const idOf = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return String(value._id || value.id || "");
  return String(value);
};

export default function Group() {
  const { id } = useParams();

  const [me, setMe] = useState(null);
  const [circle, setCircle] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [joining, setJoining] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const meId = useMemo(() => idOf(me?._id), [me]);

  const isActuallyMember = useMemo(() => {
    if (!circle) return false;
    if (circle.isMember) return true;
    if (!Array.isArray(circle.members)) return false;

    return circle.members.some((member) => idOf(member) === meId);
  }, [circle, meId]);

  const isActuallyModerator = useMemo(() => {
    if (!circle) return false;
    if (circle.isModerator) return true;
    if (idOf(circle.createdBy) === meId) return true;
    if (!Array.isArray(circle.moderators)) return false;

    return circle.moderators.some((member) => idOf(member) === meId);
  }, [circle, meId]);

  const canManage = useMemo(() => {
    if (!circle) return false;
    return !!me?.isAdmin || me?.role === "admin" || isActuallyModerator;
  }, [circle, me, isActuallyModerator]);

  const canChat = useMemo(() => {
    if (!circle) return false;
    return isActuallyMember || canManage;
  }, [circle, isActuallyMember, canManage]);

  const pendingRequests = useMemo(() => {
    return Array.isArray(circle?.pendingJoinRequests) ? circle.pendingJoinRequests : [];
  }, [circle]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/auth/profile");
      setMe(res.data || null);
      return res.data || null;
    } catch {
      setMe(null);
      return null;
    }
  }, []);

  const fetchCircle = useCallback(async () => {
    const res = await api.get(`/forum/circles/${id}`);
    setCircle(res.data || null);
    return res.data || null;
  }, [id]);

  const fetchMessages = useCallback(async () => {
    setMessagesLoading(true);
    try {
      const res = await api.get(`/forum/circles/${id}/messages`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      if (e.response?.status === 403) {
        setMessages([]);
      } else {
        setError(e.response?.data?.msg || "Failed to load messages");
      }
    } finally {
      setMessagesLoading(false);
    }
  }, [id]);

  const loadPage = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await fetchProfile();
      const circleData = await fetchCircle();

      const member =
        !!circleData?.isMember ||
        Array.isArray(circleData?.members) &&
          circleData.members.some((member) => idOf(member) === meId);

      const moderator =
        !!circleData?.isModerator ||
        Array.isArray(circleData?.pendingJoinRequests);

      if (member || moderator) {
        await fetchMessages();
      } else {
        setMessages([]);
      }
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to load circle");
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, fetchCircle, fetchMessages, meId]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    const socket = connectSocket();

    joinGroup(id);
    joinCircle(id);

    const onNewMessage = (message) => {
      const groupId = idOf(message?.group);
      if (!groupId || groupId === String(id)) {
        setMessages((prev) => {
          const exists = prev.some((item) => idOf(item._id) === idOf(message._id));
          if (exists) return prev;
          return [...prev, message];
        });
      }
    };

    const onMemberUpdate = (payload) => {
      if (String(payload?.circleId) !== String(id)) return;
      fetchCircle();
    };

    const onJoinRequestCount = (payload) => {
      if (String(payload?.circleId) !== String(id)) return;
      fetchCircle();
    };

    const onCircleDeleted = (payload) => {
      if (String(payload?.circleId) !== String(id)) return;
      setError("This circle was deleted.");
      setCircle(null);
      setMessages([]);
    };

    const onJoinApproved = (payload) => {
      if (String(payload?.circleId) !== String(id)) return;
      setSuccess("Your join request was approved.");
      fetchCircle();
      fetchMessages();
    };

    const onJoinRejected = (payload) => {
      if (String(payload?.circleId) !== String(id)) return;
      setSuccess("Your join request was rejected.");
      fetchCircle();
    };

    socket.on("message", onNewMessage);
    socket.on("circle:message", onNewMessage);
    socket.on("circle:memberUpdate", onMemberUpdate);
    socket.on("circle:joinRequestCount", onJoinRequestCount);
    socket.on("circle:deleted", onCircleDeleted);
    socket.on("circle:joinApproved", onJoinApproved);
    socket.on("circle:joinRejected", onJoinRejected);

    return () => {
      leaveGroup(id);
      leaveCircle(id);

      socket.off("message", onNewMessage);
      socket.off("circle:message", onNewMessage);
      socket.off("circle:memberUpdate", onMemberUpdate);
      socket.off("circle:joinRequestCount", onJoinRequestCount);
      socket.off("circle:deleted", onCircleDeleted);
      socket.off("circle:joinApproved", onJoinApproved);
      socket.off("circle:joinRejected", onJoinRejected);
    };
  }, [id, fetchCircle, fetchMessages]);

  const handleJoin = async () => {
    if (!circle) return;

    setJoining(true);
    setError("");
    setSuccess("");

    try {
      if (circle.approvalRequired || circle.privacy === "private") {
        const reason = window.prompt("Why do you want to join this circle?");
        if (!reason || !reason.trim()) {
          setJoining(false);
          return;
        }

        const res = await api.post(`/forum/circles/${id}/join-request`, {
          reason: reason.trim(),
        });

        setSuccess(res.data?.msg || "Join request submitted");
      } else {
        const res = await api.post(`/forum/groups/${id}/join`);
        setSuccess(res.data?.msg || "Joined successfully");
      }

      const fresh = await fetchCircle();
      if (fresh?.isMember) {
        await fetchMessages();
      }
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to join circle");
    } finally {
      setJoining(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setSending(true);
    setError("");

    try {
      const res = await api.post(`/forum/circles/${id}/messages`, {
        content: messageText.trim(),
      });

      const created = res.data;
      setMessages((prev) => {
        const exists = prev.some((item) => idOf(item._id) === idOf(created?._id));
        if (exists) return prev;
        return [...prev, created];
      });

      setMessageText("");
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    const note = window.prompt("Approval note (optional):") || "";

    try {
      await api.patch(`/forum/circles/${id}/join-requests/${requestId}/approve`, { note });
      setSuccess("Join request approved");
      await fetchCircle();
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to approve request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    const note = window.prompt("Reason for rejection (optional):") || "";

    try {
      await api.patch(`/forum/circles/${id}/join-requests/${requestId}/reject`, { note });
      setSuccess("Join request rejected");
      await fetchCircle();
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to reject request");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member from the circle?")) return;

    try {
      await api.delete(`/forum/circles/${id}/members/${userId}`);
      setSuccess("Member removed");
      await fetchCircle();
      await fetchMessages();
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to remove member");
    }
  };

  const myJoinRequestPending =
    circle?.myJoinRequest && circle?.myJoinRequest?.status === "pending";

  if (loading) {
    return <p className="text-center py-10 text-lg">Loading...</p>;
  }

  if (!circle) {
    return (
      <div className="py-10 text-center text-red-600 flex items-center justify-center gap-2">
        <AlertCircle size={18} />
        {error || "Circle not found"}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-extrabold text-gray-900">{circle.name}</h1>

              {circle.privacy === "private" ? (
                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 border border-red-200 inline-flex items-center gap-1">
                  <Lock size={12} />
                  Private
                </span>
              ) : (
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-200 inline-flex items-center gap-1">
                  <Globe size={12} />
                  Public
                </span>
              )}

              {canManage ? (
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                  <Shield size={12} />
                  Manager
                </span>
              ) : null}
            </div>

            <p className="text-gray-600 mt-2">{circle.description || "No description"}</p>

            <div className="mt-4 text-sm text-gray-600 flex flex-wrap gap-4">
              <span className="inline-flex items-center gap-2">
                <Users size={16} />
                {circle.membersCount || 0} members
              </span>

              <span className="inline-flex items-center gap-2">
                <Clock3 size={16} />
                Created {fmt(circle.createdAt)}
              </span>

              <span>
                Tag: <b>{circle.conditionTag || "-"}</b>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadPage}
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <Link to="/forum" className="btn-primary">
              Back to Forum
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 border border-red-200 bg-red-50/50 text-red-700 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="glass-card p-4 border border-green-200 bg-green-50/50 text-green-700 flex items-center gap-2">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {!canChat && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Circle Access</h2>

          {myJoinRequestPending ? (
            <p className="text-yellow-700">
              Your join request is pending approval.
            </p>
          ) : (
            <p className="text-gray-700 mb-4">
              Join this circle to read and send messages.
            </p>
          )}

          {!myJoinRequestPending && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="btn-primary"
            >
              {joining ? "Submitting..." : "Join Circle"}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="glass-card p-5 xl:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle className="text-blue-600" />
            Circle Chat
          </h2>

          {!canChat ? (
            <p className="text-gray-600">Join this circle to read and send messages.</p>
          ) : (
            <>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {messagesLoading ? (
                  <p className="text-gray-600">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-gray-600">No messages yet.</p>
                ) : (
                  messages.map((message) => {
                    const mine = idOf(message.author) === meId || idOf(message.author?._id) === meId;

                    return (
                      <div
                        key={message._id}
                        className={`rounded-2xl border p-4 ${
                          mine
                            ? "bg-blue-50 border-blue-200"
                            : "bg-white/60 border-white/40"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-gray-900">
                            {message.author?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">{fmt(message.createdAt)}</p>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          {message.author?.role || "user"}
                          {message.author?.verified ? " • verified" : ""}
                        </p>

                        <p className="mt-3 text-gray-800 whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSendMessage} className="mt-4 space-y-3">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="input-field min-h-[110px]"
                  placeholder="Write a message..."
                />
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="btn-primary flex items-center gap-2"
                >
                  <Send size={16} />
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Circle Info</h3>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <b>Creator:</b> {circle.createdBy?.name || "Unknown"}
              </p>
              <p>
                <b>Privacy:</b> {circle.privacy || "-"}
              </p>
              <p>
                <b>Status:</b> {circle.status || "approved"}
              </p>
              <p>
                <b>Members:</b> {circle.membersCount || 0}
              </p>
              <p>
                <b>Pending requests:</b> {circle.joinRequestsCount || pendingRequests.length || 0}
              </p>
            </div>
          </div>

          {canManage && (
            <div className="glass-card p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Join Requests</h3>

              {pendingRequests.length === 0 ? (
                <p className="text-gray-600">No pending requests.</p>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="rounded-2xl border border-white/40 bg-white/60 p-4"
                    >
                      <p className="font-semibold text-gray-900">
                        {request.user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {request.user?.role || "user"}
                        {request.user?.verified ? " • verified" : ""}
                      </p>

                      {request.reason ? (
                        <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">
                          {request.reason}
                        </p>
                      ) : null}

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleApproveRequest(request._id)}
                          className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle2 size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request._id)}
                          className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {canManage && Array.isArray(circle.members) && circle.members.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Members</h3>

              <div className="space-y-3">
                {circle.members.map((member) => {
                  const memberId = idOf(member);
                  const isMe = memberId === meId;
                  const isCreator = memberId === idOf(circle.createdBy);

                  return (
                    <div
                      key={memberId}
                      className="rounded-2xl border border-white/40 bg-white/60 p-4 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{member.name || "User"}</p>
                        <p className="text-xs text-gray-500">
                          {member.role || "user"}
                          {member.verified ? " • verified" : ""}
                          {isCreator ? " • creator" : ""}
                          {memberId === meId ? " • you" : ""}
                        </p>
                      </div>

                      {!isMe && !isCreator && (
                        <button
                          onClick={() => handleRemoveMember(memberId)}
                          className="px-3 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                        >
                          <UserMinus size={15} />
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}