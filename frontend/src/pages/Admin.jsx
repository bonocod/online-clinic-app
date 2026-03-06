// FILE: frontend/src/pages/Admin.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import {
  Shield,
  ClipboardList,
  AlertCircle,
  UserPlus,
  Users,
  Lock,
  Unlock,
  MessageSquareWarning,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Activity,
  Clock,
  FileText,
  Video,
  Upload,
  Flag,
} from "lucide-react";

import { connectSocket, joinAdmin } from "../utils/socket";

const fmt = (d) => {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "";
  }
};

const pill = (cls, text) => (
  <span className={`text-xs px-2 py-1 rounded-full border ${cls}`}>{text}</span>
);

export default function Admin() {
  const [tab, setTab] = useState("reports"); // reports | discussions | professionals | categories | audit | videos | reported-posts

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Reports queue
  const [reports, setReports] = useState([]);

  // Legacy reported posts
  const [reportedPosts, setReportedPosts] = useState([]);

  // Discussions approval
  const [pendingDiscussions, setPendingDiscussions] = useState([]);

  // Professionals verification
  const [pendingPros, setPendingPros] = useState([]);
  const [newProf, setNewProf] = useState({ name: "", email: "", password: "", role: "doctor" });

  // Categories lock/unlock
  const [forumCategories, setForumCategories] = useState([]);

  // Audit
  const [auditItems, setAuditItems] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditLimit, setAuditLimit] = useState(40);
  const [auditQuery, setAuditQuery] = useState("");
  const [auditAction, setAuditAction] = useState("");
  const [auditTargetType, setAuditTargetType] = useState("");

  // Videos
  const [videos, setVideos] = useState([]);
  const [videoCategories, setVideoCategories] = useState([]);
  const [newVideo, setNewVideo] = useState({ title: '', description: '', category: '', file: null });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewURL, setPreviewURL] = useState('');

  // Live activity sidebar (always visible)
  const [activityFeed, setActivityFeed] = useState([]);

  // ---- Fetchers ----
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/reports?resolved=false");
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load moderation reports");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReportedPosts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get('/admin/reported-posts');
      setReportedPosts(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load reported posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingDiscussions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/discussions?status=waiting");
      setPendingDiscussions(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load pending discussions");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingProfessionals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/professionals/pending");
      setPendingPros(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load pending professionals");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchForumCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/forum/categories");
      setForumCategories(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load forum categories");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAudit = useCallback(async (pageOverride) => {
    const p = pageOverride || auditPage;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("limit", String(auditLimit));

      if (auditQuery.trim()) params.set("q", auditQuery.trim());
      if (auditAction.trim()) params.set("action", auditAction.trim());
      if (auditTargetType.trim()) params.set("targetType", auditTargetType.trim());

      const res = await api.get(`/admin/audit-logs?${params.toString()}`);
      setAuditItems(Array.isArray(res.data?.items) ? res.data.items : []);
      setAuditTotal(res.data?.total || 0);
      setAuditPage(res.data?.page || p);

      // also refresh activity feed from first page
      if (p === 1) {
        setActivityFeed((prev) => {
          const incoming = Array.isArray(res.data?.items) ? res.data.items.slice(0, 12) : [];
          return incoming;
        });
      }
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [auditAction, auditLimit, auditPage, auditQuery, auditTargetType]);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/videos");
      setVideos(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVideoCategories = useCallback(async () => {
    try {
      const res = await api.get("/categories");
      setVideoCategories(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load video categories");
    }
  }, []);

  const refreshCurrentTab = useCallback(() => {
    if (tab === "reports") return fetchReports();
    if (tab === "reported-posts") return fetchReportedPosts();
    if (tab === "discussions") return fetchPendingDiscussions();
    if (tab === "professionals") return fetchPendingProfessionals();
    if (tab === "categories") return fetchForumCategories();
    if (tab === "audit") return fetchAudit(1);
    if (tab === "videos") {
      fetchVideos();
      fetchVideoCategories();
    }
  }, [tab, fetchReports, fetchReportedPosts, fetchPendingDiscussions, fetchPendingProfessionals, fetchForumCategories, fetchAudit, fetchVideos, fetchVideoCategories]);

  // Tab switch loads
  useEffect(() => {
    refreshCurrentTab();
  }, [tab, refreshCurrentTab]);

  // Load initial activity feed even if not on audit tab
  useEffect(() => {
    fetchAudit(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- LIVE sockets ----
  useEffect(() => {
    const s = connectSocket();
    joinAdmin();

    const onAuditNew = (log) => {
      if (!log?._id) return;

      // push activity feed
      setActivityFeed((prev) => {
        const exists = prev.some((x) => String(x._id) === String(log._id));
        if (exists) return prev;
        return [log, ...prev].slice(0, 12);
      });

      // if audit tab open and on first page, prepend
      if (tab === "audit" && auditPage === 1) {
        setAuditItems((prev) => {
          const exists = prev.some((x) => String(x._id) === String(log._id));
          if (exists) return prev;
          return [log, ...prev].slice(0, auditLimit);
        });
        setAuditTotal((t) => t + 1);
      }

      // Smart refreshes for admin tabs based on actions
      const action = String(log.action || "");
      if (action.includes("admin.lock_category") || action.includes("admin.unlock_category")) {
        fetchForumCategories();
      }
      if (action.includes("admin.verify_professional")) {
        fetchPendingProfessionals();
      }
      if (action.includes("admin.approve_discussion") || action.includes("admin.reject_discussion")) {
        fetchPendingDiscussions();
      }
      if (action.includes("report.create")) {
        fetchReports();
      }
    };

    const onCategoryUpdated = (cat) => {
      if (!cat?._id) return;
      setForumCategories((prev) =>
        prev.map((c) => (String(c._id) === String(cat._id) ? { ...c, ...cat } : c))
      );
    };

    s.on("audit:new", onAuditNew);
    s.on("categoryUpdated", onCategoryUpdated);

    return () => {
      s.off("audit:new", onAuditNew);
      s.off("categoryUpdated", onCategoryUpdated);
    };
  }, [
    tab,
    auditPage,
    auditLimit,
    fetchForumCategories,
    fetchPendingProfessionals,
    fetchPendingDiscussions,
    fetchReports,
  ]);

  // ---- Actions ----
  const handleCreateProf = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/admin/users", newProf);
      setNewProf({ name: "", email: "", password: "", role: "doctor" });
      fetchPendingProfessionals();
      setSuccess("Professional created successfully");
    } catch (err) {
      setError(err.response?.data?.msg || "Creation failed");
    }
  };

  const verifyProfessional = async (id) => {
    setError("");
    setSuccess("");
    try {
      await api.patch(`/admin/professionals/${id}/verify`);
      fetchPendingProfessionals();
      setSuccess("Professional verified");
    } catch (err) {
      setError(err.response?.data?.msg || "Verification failed");
    }
  };

  const approveDiscussion = async (id) => {
    setError("");
    setSuccess("");
    try {
      await api.post(`/admin/discussions/${id}/approve`);
      fetchPendingDiscussions();
      setSuccess("Discussion approved");
    } catch (err) {
      setError(err.response?.data?.msg || "Approve failed");
    }
  };

  const rejectDiscussion = async (id) => {
    setError("");
    setSuccess("");
    if (!window.confirm("Reject and remove this discussion request?")) return;
    try {
      await api.post(`/admin/discussions/${id}/reject`);
      fetchPendingDiscussions();
      setSuccess("Discussion rejected");
    } catch (err) {
      setError(err.response?.data?.msg || "Reject failed");
    }
  };

  const resolveModerationReport = async (id) => {
    const note = window.prompt("Resolution note (optional):") || "";
    setError("");
    setSuccess("");
    try {
      await api.patch(`/admin/reports/${id}/resolve`, { note });
      fetchReports();
      setSuccess("Report resolved");
    } catch (err) {
      setError(err.response?.data?.msg || "Resolve failed");
    }
  };

  const lockCategory = async (id) => {
    setError("");
    setSuccess("");
    try {
      await api.patch(`/admin/categories/${id}/lock`);
      fetchForumCategories();
      setSuccess("Category locked");
    } catch (err) {
      setError(err.response?.data?.msg || "Lock failed");
    }
  };

  const unlockCategory = async (id) => {
    setError("");
    setSuccess("");
    try {
      await api.patch(`/admin/categories/${id}/unlock`);
      fetchForumCategories();
      setSuccess("Category unlocked");
    } catch (err) {
      setError(err.response?.data?.msg || "Unlock failed");
    }
  };

  // Legacy reported posts actions
  const handleResolveLegacy = async (postId) => {
    setError("");
    setSuccess("");
    try {
      await api.patch(`/admin/posts/${postId}/resolve`);
      fetchReportedPosts();
      setSuccess("Post resolved");
    } catch {
      setError('Resolve failed');
    }
  };

  const handleDeletePost = async (postId) => {
    setError("");
    setSuccess("");
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      fetchReportedPosts();
      setSuccess("Post deleted");
    } catch {
      setError('Delete failed');
    }
  };

  // Videos actions
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    setNewVideo({ ...newVideo, file });
    setPreviewURL(file ? URL.createObjectURL(file) : '');
  };

  const handleUploadVideo = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUploadProgress(0);
    if (!newVideo.file) {
      setError('Please select a video file');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('title', newVideo.title);
    formData.append('description', newVideo.description);
    formData.append('category', newVideo.category);
    formData.append('video', newVideo.file);
    try {
      await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });
      setSuccess('Video uploaded successfully!');
      setNewVideo({ title: '', description: '', category: '', file: null });
      setPreviewURL('');
      setUploadProgress(0);
      fetchVideos();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    setError('');
    setSuccess('');
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await api.delete(`/videos/${videoId}`);
      setSuccess('Video deleted');
      fetchVideos();
    } catch {
      setError('Delete failed');
    }
  };

  // ---- Tabs ----
  const tabs = useMemo(
    () => [
      { id: "reports", label: "Moderation Queue", icon: MessageSquareWarning },
      { id: "reported-posts", label: "Reported Posts (Legacy)", icon: Flag },
      { id: "discussions", label: "Pending Discussions", icon: ClipboardList },
      { id: "professionals", label: "Verify Professionals", icon: Shield },
      { id: "categories", label: "Lock Categories", icon: Lock },
      { id: "audit", label: "Audit Logs", icon: FileText },
      { id: "videos", label: "Manage Videos", icon: Video },
    ],
    []
  );

  const auditPages = Math.max(1, Math.ceil(auditTotal / auditLimit));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Shield className="text-blue-600" />
            Admin Console
          </h1>
          <p className="text-gray-600 mt-1">
            Moderation, verification, category controls, and full audit trail (live).
          </p>
        </div>

        <button
          onClick={refreshCurrentTab}
          className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Tabs */}
        <div className="glass-card p-4 lg:col-span-1">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">Navigation</p>
          <div className="space-y-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full px-4 py-3 rounded-2xl flex items-center gap-3 border transition ${
                  tab === t.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white/60 hover:bg-white border-white/40 text-gray-800"
                }`}
              >
                <t.icon size={18} />
                <span className="font-semibold">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Create professional (quick form) */}
          <div className="mt-6 border-t border-white/40 pt-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-2">
              <UserPlus size={14} /> Create Professional
            </p>
            <form onSubmit={handleCreateProf} className="space-y-2">
              <input
                className="input-field"
                placeholder="Name"
                value={newProf.name}
                onChange={(e) => setNewProf({ ...newProf, name: e.target.value })}
                required
              />
              <input
                className="input-field"
                placeholder="Email"
                type="email"
                value={newProf.email}
                onChange={(e) => setNewProf({ ...newProf, email: e.target.value })}
                required
              />
              <input
                className="input-field"
                placeholder="Password"
                type="password"
                value={newProf.password}
                onChange={(e) => setNewProf({ ...newProf, password: e.target.value })}
                required
              />
              <select
                className="input-field"
                value={newProf.role}
                onChange={(e) => setNewProf({ ...newProf, role: e.target.value })}
              >
                <option value="doctor">Doctor</option>
                <option value="chw">CHW</option>
              </select>
              <button className="btn-primary w-full flex items-center justify-center gap-2" type="submit">
                <UserPlus size={16} />
                Create
              </button>
            </form>
          </div>
        </div>

        {/* Middle: Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Reports */}
          {tab === "reports" && (
            <div className="glass-card p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Moderation Queue</h2>
              {loading ? (
                <p className="text-gray-600">Loading…</p>
              ) : reports.length === 0 ? (
                <p className="text-gray-600">No unresolved reports 🎯</p>
              ) : (
                <div className="space-y-3">
                  {reports.map((r) => (
                    <div key={r._id} className="bg-white/60 border border-white/40 rounded-2xl p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-bold text-gray-900">
                          {String(r.contentType).toUpperCase()} • {String(r.contentId)}
                        </p>
                        {pill("bg-yellow-50 border-yellow-200 text-yellow-800", "unresolved")}
                      </div>

                      <p className="mt-2 text-gray-800">{r.reason}</p>
                      <p className="mt-2 text-xs text-gray-500">
                        Reported by: {r.reportedBy?.name || "Unknown"} • {fmt(r.createdAt)}
                      </p>

                      <div className="mt-3">
                        <button
                          onClick={() => resolveModerationReport(r._id)}
                          className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle2 size={16} />
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reported Posts (Legacy) */}
          {tab === "reported-posts" && (
            <div className="glass-card p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Reported Posts (Legacy)</h2>
              {loading ? (
                <p className="text-gray-600">Loading…</p>
              ) : reportedPosts.length === 0 ? (
                <p className="text-gray-600">No reported posts.</p>
              ) : (
                <div className="space-y-3">
                  {reportedPosts.map((post) => (
                    <div key={post._id} className="bg-white/60 border border-white/40 rounded-2xl p-4">
                      <p className="font-bold text-gray-900">{post.title}</p>
                      <p className="text-sm text-gray-600">Reports: {post.reports.length}</p>
                      <div className="space-y-1 mt-2">
                        {post.reports.map((r, idx) => (
                          <p key={idx} className="text-sm text-gray-800">
                            Reason: {r.reason} by {r.user?.name || 'Unknown'}
                          </p>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleResolveLegacy(post._id)}
                          className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle2 size={16} /> Resolve
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                        >
                          <XCircle size={16} /> Delete Post
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Discussions */}
          {tab === "discussions" && (
            <div className="glass-card p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Pending Discussions</h2>

              {loading ? (
                <p className="text-gray-600">Loading…</p>
              ) : pendingDiscussions.length === 0 ? (
                <p className="text-gray-600">No pending discussions.</p>
              ) : (
                <div className="space-y-3">
                  {pendingDiscussions.map((d) => (
                    <div key={d._id} className="bg-white/60 border border-white/40 rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">{d.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            By {d.createdBy?.name || "Unknown"} • {fmt(d.createdAt)}
                          </p>
                        </div>
                        {pill("bg-blue-50 border-blue-200 text-blue-800", "waiting")}
                      </div>

                      <p className="mt-3 text-gray-800 whitespace-pre-wrap">{d.body}</p>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => approveDiscussion(d._id)}
                          className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle2 size={16} /> Approve
                        </button>
                        <button
                          onClick={() => rejectDiscussion(d._id)}
                          className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Professionals */}
          {tab === "professionals" && (
            <div className="glass-card p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Verify Professionals</h2>

              {loading ? (
                <p className="text-gray-600">Loading…</p>
              ) : pendingPros.length === 0 ? (
                <p className="text-gray-600">No pending professionals.</p>
              ) : (
                <div className="space-y-3">
                  {pendingPros.map((p) => (
                    <div key={p._id} className="bg-white/60 border border-white/40 rounded-2xl p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{p.name}</p>
                        <p className="text-sm text-gray-600 truncate">{p.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          role: {p.role} • created: {fmt(p.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => verifyProfessional(p._id)}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Shield size={16} /> Verify
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Categories */}
          {tab === "categories" && (
            <div className="glass-card p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Lock / Unlock Categories</h2>

              {loading ? (
                <p className="text-gray-600">Loading…</p>
              ) : forumCategories.length === 0 ? (
                <p className="text-gray-600">No forum categories.</p>
              ) : (
                <div className="space-y-3">
                  {forumCategories.map((c) => (
                    <div key={c._id} className="bg-white/60 border border-white/40 rounded-2xl p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 flex items-center gap-2">
                          {c.name}
                          {c.isLocked
                            ? pill("bg-red-50 border-red-200 text-red-700", "locked")
                            : pill("bg-green-50 border-green-200 text-green-700", "open")}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>
                      </div>

                      {c.isLocked ? (
                        <button
                          onClick={() => unlockCategory(c._id)}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Unlock size={16} /> Unlock
                        </button>
                      ) : (
                        <button
                          onClick={() => lockCategory(c._id)}
                          className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                        >
                          <Lock size={16} /> Lock
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Audit */}
          {tab === "audit" && (
            <div className="glass-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-900">Audit Logs</h2>
                <div className="text-xs text-gray-500">
                  Total: <b>{auditTotal}</b>
                </div>
              </div>

              {/* Filters */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    value={auditQuery}
                    onChange={(e) => setAuditQuery(e.target.value)}
                    className="input-field pl-11"
                    placeholder="Search action / ip / role..."
                  />
                </div>

                <input
                  value={auditAction}
                  onChange={(e) => setAuditAction(e.target.value)}
                  className="input-field"
                  placeholder="Filter action (e.g. post.create)"
                />

                <input
                  value={auditTargetType}
                  onChange={(e) => setAuditTargetType(e.target.value)}
                  className="input-field"
                  placeholder="Filter targetType (post, category...)"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => fetchAudit(1)}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                >
                  Apply
                </button>
                <button
                  onClick={() => {
                    setAuditQuery("");
                    setAuditAction("");
                    setAuditTargetType("");
                    setTimeout(() => fetchAudit(1), 0);
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>

              {/* List */}
              <div className="mt-4 space-y-3">
                {loading ? (
                  <p className="text-gray-600">Loading…</p>
                ) : auditItems.length === 0 ? (
                  <p className="text-gray-600">No audit logs found.</p>
                ) : (
                  auditItems.map((a) => (
                    <div key={a._id} className="bg-white/60 border border-white/40 rounded-2xl p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-bold text-gray-900">{a.action}</p>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={14} /> {fmt(a.createdAt)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 mt-1">
                        Actor:{" "}
                        <b>
                          {a.actor?.name || String(a.actor || "Unknown")}
                        </b>{" "}
                        <span className="text-xs text-gray-500">
                          ({a.actorRole || a.actor?.role || "role?"}
                          {a.actor?.verified ? " • verified" : ""})
                        </span>
                      </p>

                      <p className="text-xs text-gray-500 mt-2">
                        Target: {a.targetType || "-"} {a.targetId ? `• ${String(a.targetId)}` : ""}
                      </p>

                      {a.metadata && Object.keys(a.metadata || {}).length > 0 ? (
                        <pre className="mt-3 text-xs bg-gray-900 text-gray-100 p-3 rounded-xl overflow-auto">
{JSON.stringify(a.metadata, null, 2)}
                        </pre>
                      ) : null}
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <button
                  className={`px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 ${auditPage <= 1 ? "opacity-50 pointer-events-none" : ""}`}
                  onClick={() => fetchAudit(auditPage - 1)}
                >
                  Prev
                </button>

                <p className="text-sm text-gray-600">
                  Page <b>{auditPage}</b> / {auditPages}
                </p>

                <button
                  className={`px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 ${auditPage >= auditPages ? "opacity-50 pointer-events-none" : ""}`}
                  onClick={() => fetchAudit(auditPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Videos */}
          {tab === "videos" && (
            <div className="glass-card p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Manage Videos</h2>

              {loading ? (
                <p className="text-gray-600">Loading…</p>
              ) : (
                <>
                  <form onSubmit={handleUploadVideo} className="space-y-3 mb-6">
                    <input
                      className="input-field"
                      placeholder="Video Title"
                      value={newVideo.title}
                      onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                      required
                    />
                    <textarea
                      className="input-field min-h-[80px]"
                      placeholder="Description"
                      value={newVideo.description}
                      onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                    />
                    <select
                      className="input-field"
                      value={newVideo.category}
                      onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      {videoCategories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <div className="relative">
                      <Upload className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoSelect}
                        className="input-field pl-11"
                        required
                      />
                    </div>
                    {previewURL && (
                      <video controls className="w-full mt-3 rounded-2xl">
                        <source src={previewURL} type={newVideo.file?.type} />
                      </video>
                    )}
                    {uploadProgress > 0 && (
                      <div className="bg-white/60 rounded-full h-2.5 mt-3">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {loading ? `Uploading... ${uploadProgress}%` : 'Upload Video'}
                    </button>
                  </form>

                  <div className="space-y-3">
                    {videos.map((video) => (
                      <div key={video._id} className="bg-white/60 border border-white/40 rounded-2xl p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">{video.title}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteVideo(video._id)}
                          className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                        >
                          <XCircle size={16} /> Delete
                        </button>
                      </div>
                    ))}
                    {videos.length === 0 && <p className="text-gray-600">No videos yet.</p>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Live activity feed */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="text-blue-600" />
              Live Activity
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Updates in real-time from Audit Logs.
            </p>

            <div className="mt-4 space-y-3">
              {activityFeed.length === 0 ? (
                <p className="text-gray-600">No activity yet.</p>
              ) : (
                activityFeed.map((a) => (
                  <div key={a._id} className="bg-white/60 border border-white/40 rounded-2xl p-3">
                    <p className="text-sm font-semibold text-gray-900">{a.action}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {a.actor?.name || "Unknown"} • {fmt(a.createdAt)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {a.targetType ? `target: ${a.targetType}` : ""} {a.targetId ? `• ${String(a.targetId)}` : ""}
                    </p>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => fetchAudit(1)}
              className="mt-4 w-full px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              View full audit
            </button>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-blue-600" />
              Admin Tips
            </h3>
            <ul className="mt-3 text-sm text-gray-700 space-y-2">
              <li>• Lock categories during misinformation spikes.</li>
              <li>• Use audit logs to prove who changed what.</li>
              <li>• Verify professionals before they answer questions.</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}