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
  Radio,
  Check,
  X,
  PlusCircle,
  Trash2,
  UserCheck,
  HeartPulse,
} from "lucide-react";
import { connectSocket, joinAdmin, leaveAdmin } from "../utils/socket";

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
const circleStatusPill = (status) => {
  if (status === "approved") {
    return pill("bg-green-50 border-green-200 text-green-700", "approved");
  }
  if (status === "rejected") {
    return pill("bg-red-50 border-red-200 text-red-700", "rejected");
  }
  return pill("bg-yellow-50 border-yellow-200 text-yellow-800", "waiting");
};

export default function Admin() {
  const [tab, setTab] = useState("reports");
  // reports | reported-posts | discussions | professionals | categories | circles | live-sessions | audit | videos | public-health
  const [loading, setLoading] = useState(false);
  const [joinRequestsLoading, setJoinRequestsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==================== EXISTING STATES ====================
  const [reports, setReports] = useState([]);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [pendingDiscussions, setPendingDiscussions] = useState([]);
  const [pendingPros, setPendingPros] = useState([]);
  const [newProf, setNewProf] = useState({
    name: "",
    email: "",
    password: "",
    role: "doctor",
  });
  const [forumCategories, setForumCategories] = useState([]);
  const [circles, setCircles] = useState([]);
  const [circleStatusFilter, setCircleStatusFilter] = useState("all");
  const [newCircle, setNewCircle] = useState({
    name: "",
    description: "",
    conditionTag: "",
    privacy: "private",
  });
  const [selectedCircleIdForRequests, setSelectedCircleIdForRequests] = useState("");
  const [circleJoinRequests, setCircleJoinRequests] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [selectedLiveId, setSelectedLiveId] = useState("");
  const [liveSessionDetail, setLiveSessionDetail] = useState(null);
  const [auditItems, setAuditItems] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditLimit, setAuditLimit] = useState(40);
  const [auditQuery, setAuditQuery] = useState("");
  const [auditAction, setAuditAction] = useState("");
  const [auditTargetType, setAuditTargetType] = useState("");
  const [videos, setVideos] = useState([]);
  const [videoCategories, setVideoCategories] = useState([]);
  const [newVideo, setNewVideo] = useState({
    title: "",
    description: "",
    category: "",
    file: null,
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewURL, setPreviewURL] = useState("");
  const [activityFeed, setActivityFeed] = useState([]);

  // ==================== NEW: PUBLIC HEALTH HUB STATES ====================
  const [phTab, setPhTab] = useState("campaigns");
  const [phCampaigns, setPhCampaigns] = useState([]);
  const [phNews, setPhNews] = useState([]);
  const [phTips, setPhTips] = useState([]);
  const [phEvents, setPhEvents] = useState([]);
  const [phPendingQuestions, setPhPendingQuestions] = useState([]);

  // ---------------- Fetchers ----------------
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
      const res = await api.get("/admin/reported-posts");
      setReportedPosts(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load reported posts");
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

  const fetchCircles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/forum/circles?status=${circleStatusFilter}`);
      const items = Array.isArray(res.data) ? res.data : [];
      setCircles(items);
      if (
        selectedCircleIdForRequests &&
        !items.some((circle) => String(circle._id) === String(selectedCircleIdForRequests))
      ) {
        setSelectedCircleIdForRequests("");
        setCircleJoinRequests([]);
      }
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to load circles");
    } finally {
      setLoading(false);
    }
  }, [circleStatusFilter, selectedCircleIdForRequests]);

  const fetchCircleJoinRequests = useCallback(async (circleId, pendingOnly = true) => {
    if (!circleId) {
      setCircleJoinRequests([]);
      return;
    }
    setJoinRequestsLoading(true);
    setError("");
    try {
      const suffix = pendingOnly ? "?pendingOnly=true" : "";
      const res = await api.get(`/forum/circles/${circleId}/join-requests${suffix}`);
      setCircleJoinRequests(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to load join requests");
      setCircleJoinRequests([]);
    } finally {
      setJoinRequestsLoading(false);
    }
  }, []);

  const fetchLiveSessions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/forum/live-sessions?status=live");
      const items = Array.isArray(res.data) ? res.data : [];
      setLiveSessions(items);
      if (!selectedLiveId && items[0]?._id) {
        setSelectedLiveId(items[0]._id);
      }
      if (
        selectedLiveId &&
        !items.some((item) => String(item._id) === String(selectedLiveId))
      ) {
        setSelectedLiveId(items[0]?._id || "");
        setLiveSessionDetail(null);
      }
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to load live sessions");
    } finally {
      setLoading(false);
    }
  }, [selectedLiveId]);

  const fetchLiveSessionDetail = useCallback(
    async (idOverride) => {
      const id = idOverride || selectedLiveId;
      if (!id) {
        setLiveSessionDetail(null);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/forum/live-sessions/${id}`);
        setLiveSessionDetail(res.data || null);
      } catch (e) {
        setError(e.response?.data?.msg || "Failed to load live session detail");
      } finally {
        setLoading(false);
      }
    },
    [selectedLiveId]
  );

  const fetchAudit = useCallback(
    async (pageOverride) => {
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
        if (p === 1) {
          setActivityFeed(Array.isArray(res.data?.items) ? res.data.items.slice(0, 12) : []);
        }
      } catch (e) {
        setError(e.response?.data?.msg || "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    },
    [auditAction, auditLimit, auditPage, auditQuery, auditTargetType]
  );

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

  // ---------------- NEW PUBLIC HEALTH FETCHERS ----------------
  const fetchPhCampaigns = useCallback(async () => {
    try {
      const res = await api.get("/public-health/manage/campaigns");
      setPhCampaigns(Array.isArray(res.data) ? res.data : res.data.items || []);
    } catch (e) {}
  }, []);

  const fetchPhNews = useCallback(async () => {
    try {
      const res = await api.get("/public-health/manage/news");
      setPhNews(Array.isArray(res.data) ? res.data : res.data.items || []);
    } catch (e) {}
  }, []);

  const fetchPhTips = useCallback(async () => {
    try {
      const res = await api.get("/public-health/manage/tips");
      setPhTips(Array.isArray(res.data) ? res.data : res.data.items || []);
    } catch (e) {}
  }, []);

  const fetchPhEvents = useCallback(async () => {
    try {
      const res = await api.get("/public-health/manage/events");
      setPhEvents(Array.isArray(res.data) ? res.data : res.data.items || []);
    } catch (e) {}
  }, []);

  const fetchPhPendingQuestions = useCallback(async () => {
    try {
      const res = await api.get("/public-health/manage/questions?status=pending");
      setPhPendingQuestions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {}
  }, []);

  const fetchPublicHealth = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPhCampaigns(),
        fetchPhNews(),
        fetchPhTips(),
        fetchPhEvents(),
        fetchPhPendingQuestions(),
      ]);
    } catch (e) {
      setError("Failed to load Public Health data");
    } finally {
      setLoading(false);
    }
  }, [fetchPhCampaigns, fetchPhNews, fetchPhTips, fetchPhEvents, fetchPhPendingQuestions]);

  // ---------------- Current tab refresh ----------------
  const refreshCurrentTab = useCallback(() => {
    if (tab === "reports") return fetchReports();
    if (tab === "reported-posts") return fetchReportedPosts();
    if (tab === "discussions") return fetchPendingDiscussions();
    if (tab === "professionals") return fetchPendingProfessionals();
    if (tab === "categories") return fetchForumCategories();
    if (tab === "circles") {
      fetchCircles();
      if (selectedCircleIdForRequests) {
        fetchCircleJoinRequests(selectedCircleIdForRequests, true);
      }
      return;
    }
    if (tab === "live-sessions") {
      fetchLiveSessions();
      if (selectedLiveId) fetchLiveSessionDetail(selectedLiveId);
      return;
    }
    if (tab === "audit") return fetchAudit(1);
    if (tab === "videos") {
      fetchVideos();
      fetchVideoCategories();
      return;
    }
    if (tab === "public-health") return fetchPublicHealth();
  }, [
    tab,
    selectedLiveId,
    selectedCircleIdForRequests,
    fetchReports,
    fetchReportedPosts,
    fetchPendingDiscussions,
    fetchPendingProfessionals,
    fetchForumCategories,
    fetchCircles,
    fetchCircleJoinRequests,
    fetchLiveSessions,
    fetchLiveSessionDetail,
    fetchAudit,
    fetchVideos,
    fetchVideoCategories,
    fetchPublicHealth,
  ]);

  useEffect(() => {
    refreshCurrentTab();
  }, [refreshCurrentTab]);

  useEffect(() => {
    fetchAudit(1);
  }, [fetchAudit]);

  useEffect(() => {
    if (tab === "live-sessions" && selectedLiveId) {
      fetchLiveSessionDetail(selectedLiveId);
    }
  }, [tab, selectedLiveId, fetchLiveSessionDetail]);

  // ---------------- LIVE sockets ----------------
  useEffect(() => {
    const s = connectSocket();
    joinAdmin();

    const onAuditNew = (log) => {
      if (!log?._id) return;
      setActivityFeed((prev) => {
        const exists = prev.some((x) => String(x._id) === String(log._id));
        if (exists) return prev;
        return [log, ...prev].slice(0, 12);
      });
      if (tab === "audit" && auditPage === 1) {
        setAuditItems((prev) => {
          const exists = prev.some((x) => String(x._id) === String(log._id));
          if (exists) return prev;
          return [log, ...prev].slice(0, auditLimit);
        });
        setAuditTotal((t) => t + 1);
      }
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
      if (action.includes("circle.")) {
        fetchCircles();
        if (selectedCircleIdForRequests) {
          fetchCircleJoinRequests(selectedCircleIdForRequests, true);
        }
      }
      if (action.includes("live_session.")) {
        fetchLiveSessions();
        if (selectedLiveId) fetchLiveSessionDetail(selectedLiveId);
      }
      if (action.includes("report.create")) {
        fetchReports();
      }
      if (action.includes("publicHealth")) {
        if (tab === "public-health") fetchPublicHealth();
      }
    };

    const onCategoryUpdated = (cat) => {
      if (!cat?._id) return;
      setForumCategories((prev) =>
        prev.map((c) => (String(c._id) === String(cat._id) ? { ...c, ...cat } : c))
      );
    };

    const onCircleChanged = () => {
      fetchCircles();
      if (selectedCircleIdForRequests) {
        fetchCircleJoinRequests(selectedCircleIdForRequests, true);
      }
    };

    const onLiveChanged = () => {
      fetchLiveSessions();
      if (selectedLiveId) fetchLiveSessionDetail(selectedLiveId);
    };

    const onPublicHealthUpdate = () => {
      if (tab === "public-health") fetchPublicHealth();
    };

    s.on("audit:new", onAuditNew);
    s.on("categoryUpdated", onCategoryUpdated);
    s.on("circle:pending", onCircleChanged);
    s.on("circle:approved", onCircleChanged);
    s.on("circle:rejected", onCircleChanged);
    s.on("circle:created", onCircleChanged);
    s.on("circle:deleted", onCircleChanged);
    s.on("circle:joinRequest", onCircleChanged);
    s.on("liveSession:started", onLiveChanged);
    s.on("liveSession:updated", onLiveChanged);
    s.on("liveSession:ended", onLiveChanged);
    s.on("liveSession:state", onLiveChanged);
    s.on("publicHealth:update", onPublicHealthUpdate);

    return () => {
      leaveAdmin();
      s.off("audit:new", onAuditNew);
      s.off("categoryUpdated", onCategoryUpdated);
      s.off("circle:pending", onCircleChanged);
      s.off("circle:approved", onCircleChanged);
      s.off("circle:rejected", onCircleChanged);
      s.off("circle:created", onCircleChanged);
      s.off("circle:deleted", onCircleChanged);
      s.off("circle:joinRequest", onCircleChanged);
      s.off("liveSession:started", onLiveChanged);
      s.off("liveSession:updated", onLiveChanged);
      s.off("liveSession:ended", onLiveChanged);
      s.off("liveSession:state", onLiveChanged);
      s.off("publicHealth:update", onPublicHealthUpdate);
    };
  }, [
    tab,
    auditPage,
    auditLimit,
    selectedLiveId,
    selectedCircleIdForRequests,
    fetchForumCategories,
    fetchPendingProfessionals,
    fetchPendingDiscussions,
    fetchCircles,
    fetchCircleJoinRequests,
    fetchReports,
    fetchLiveSessions,
    fetchLiveSessionDetail,
    fetchPublicHealth,
  ]);

  // ---------------- Actions ----------------
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

  const handleCreateCircle = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/forum/circles", {
        name: newCircle.name.trim(),
        description: newCircle.description.trim(),
        conditionTag: newCircle.conditionTag.trim(),
        privacy: newCircle.privacy,
      });
      setNewCircle({
        name: "",
        description: "",
        conditionTag: "",
        privacy: "private",
      });
      fetchCircles();
      setSuccess("Circle created successfully");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to create circle");
    }
  };

  const approveCircle = async (id) => {
    const note = window.prompt("Approval note (optional):") || "";
    setError("");
    setSuccess("");
    try {
      await api.patch(`/forum/circles/${id}/approve`, { note });
      fetchCircles();
      if (selectedCircleIdForRequests === id) {
        fetchCircleJoinRequests(id, true);
      }
      setSuccess("Circle approved");
    } catch (err) {
      setError(err.response?.data?.msg || "Circle approval failed");
    }
  };

  const rejectCircle = async (id) => {
    const note = window.prompt("Reason for rejection (optional):") || "";
    setError("");
    setSuccess("");
    try {
      await api.patch(`/forum/circles/${id}/reject`, { note });
      fetchCircles();
      if (selectedCircleIdForRequests === id) {
        setSelectedCircleIdForRequests("");
        setCircleJoinRequests([]);
      }
      setSuccess("Circle rejected");
    } catch (err) {
      setError(err.response?.data?.msg || "Circle rejection failed");
    }
  };

  const deleteCircle = async (id) => {
    setError("");
    setSuccess("");
    if (!window.confirm("Are you sure you want to delete this circle?")) return;
    try {
      await api.delete(`/forum/circles/${id}`);
      if (selectedCircleIdForRequests === id) {
        setSelectedCircleIdForRequests("");
        setCircleJoinRequests([]);
      }
      fetchCircles();
      setSuccess("Circle deleted successfully");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete circle");
    }
  };

  const toggleCircleJoinRequests = async (circleId) => {
    if (String(selectedCircleIdForRequests) === String(circleId)) {
      setSelectedCircleIdForRequests("");
      setCircleJoinRequests([]);
      return;
    }
    setSelectedCircleIdForRequests(circleId);
    await fetchCircleJoinRequests(circleId, true);
  };

  const approveJoinRequest = async (circleId, requestId) => {
    const note = window.prompt("Approval note (optional):") || "";
    setError("");
    setSuccess("");
    try {
      await api.patch(`/forum/circles/${circleId}/join-requests/${requestId}/approve`, { note });
      await fetchCircleJoinRequests(circleId, true);
      await fetchCircles();
      setSuccess("Join request approved");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to approve join request");
    }
  };

  const rejectJoinRequest = async (circleId, requestId) => {
    const note = window.prompt("Rejection note (optional):") || "";
    setError("");
    setSuccess("");
    try {
      await api.patch(`/forum/circles/${circleId}/join-requests/${requestId}/reject`, { note });
      await fetchCircleJoinRequests(circleId, true);
      await fetchCircles();
      setSuccess("Join request rejected");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to reject join request");
    }
  };

  const handleResolveLegacy = async (postId) => {
    setError("");
    setSuccess("");
    try {
      await api.patch(`/admin/posts/${postId}/resolve`);
      fetchReportedPosts();
      setSuccess("Post resolved");
    } catch {
      setError("Resolve failed");
    }
  };

  const handleDeletePost = async (postId) => {
    setError("");
    setSuccess("");
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      fetchReportedPosts();
      setSuccess("Post deleted");
    } catch {
      setError("Delete failed");
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    setNewVideo({ ...newVideo, file });
    setPreviewURL(file ? URL.createObjectURL(file) : "");
  };

  const handleUploadVideo = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploadProgress(0);
    if (!newVideo.file) {
      setError("Please select a video file");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("title", newVideo.title);
    formData.append("description", newVideo.description);
    formData.append("category", newVideo.category);
    formData.append("video", newVideo.file);
    try {
      await api.post("/videos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });
      setSuccess("Video uploaded successfully");
      setNewVideo({ title: "", description: "", category: "", file: null });
      setPreviewURL("");
      setUploadProgress(0);
      fetchVideos();
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    setError("");
    setSuccess("");
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await api.delete(`/videos/${videoId}`);
      setSuccess("Video deleted");
      fetchVideos();
    } catch {
      setError("Delete failed");
    }
  };

  // ---------------- NEW PUBLIC HEALTH ACTIONS ----------------
  const archiveCampaign = async (id) => {
    setError("");
    setSuccess("");
    try {
      await api.patch(`/public-health/manage/campaigns/${id}/archive`);
      fetchPhCampaigns();
      setSuccess("Campaign archived");
    } catch (err) {
      setError(err.response?.data?.msg || "Archive failed");
    }
  };

  const publishNews = async (id) => {
    setError("");
    setSuccess("");
    try {
      await api.patch(`/public-health/manage/news/${id}/publish`);
      fetchPhNews();
      setSuccess("News published");
    } catch (err) {
      setError(err.response?.data?.msg || "Publish failed");
    }
  };

  const startLiveEvent = async (id) => {
    setError("");
    setSuccess("");
    try {
      await api.post(`/public-health/manage/events/${id}/start`);
      fetchPhEvents();
      setSuccess("Live event started");
    } catch (err) {
      setError(err.response?.data?.msg || "Start failed");
    }
  };

  const endLiveEvent = async (id) => {
    setError("");
    setSuccess("");
    try {
      await api.post(`/public-health/manage/events/${id}/end`);
      fetchPhEvents();
      setSuccess("Live event ended");
    } catch (err) {
      setError(err.response?.data?.msg || "End failed");
    }
  };

  const approveQuestion = async (questionId) => {
    setError("");
    setSuccess("");
    try {
      await api.patch(`/public-health/manage/questions/${questionId}/approve`);
      fetchPhPendingQuestions();
      setSuccess("Question approved");
    } catch (err) {
      setError(err.response?.data?.msg || "Approve failed");
    }
  };

  const rejectQuestion = async (questionId) => {
    setError("");
    setSuccess("");
    try {
      await api.patch(`/public-health/manage/questions/${questionId}/reject`);
      fetchPhPendingQuestions();
      setSuccess("Question rejected");
    } catch (err) {
      setError(err.response?.data?.msg || "Reject failed");
    }
  };

  // ---------------- Tabs ----------------
  const tabs = useMemo(
    () => [
      { id: "reports", label: "Moderation Queue", icon: MessageSquareWarning },
      { id: "reported-posts", label: "Reported Posts", icon: Flag },
      { id: "discussions", label: "Pending Discussions", icon: ClipboardList },
      { id: "professionals", label: "Verify Professionals", icon: Shield },
      { id: "categories", label: "Lock Categories", icon: Lock },
      { id: "circles", label: "Manage Circles", icon: Users },
      { id: "live-sessions", label: "Live Sessions", icon: Radio },
      { id: "audit", label: "Audit Logs", icon: FileText },
      { id: "videos", label: "Manage Videos", icon: Video },
      { id: "public-health", label: "Public Health Hub", icon: HeartPulse },
    ],
    []
  );

  const auditPages = Math.max(1, Math.ceil(auditTotal / auditLimit));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Shield className="text-blue-600" />
            Admin Console
          </h1>
          <p className="text-gray-600 mt-1">
            Moderation, circle management, live session monitoring, verification, and audit logs.
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
        {/* Left Sidebar */}
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
              <button
                className="btn-primary w-full flex items-center justify-center gap-2"
                type="submit"
              >
                <UserPlus size={16} />
                Create
              </button>
            </form>
          </div>
        </div>

        {/* Middle Content */}
        <div className="lg:col-span-2 space-y-4">
          {tab === "reports" && (
            <div className="glass-card p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Moderation Queue</h2>
              {loading ? (
                <p className="text-gray-600">Loading...</p>
              ) : reports.length === 0 ? (
                <p className="text-gray-600">No unresolved reports.</p>
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

          {tab === "reported-posts" && (
            <div className="glass-card p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Reported Posts</h2>
              {loading ? (
                <p className="text-gray-600">Loading...</p>
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
                            Reason: {r.reason} by {r.user?.name || "Unknown"}
                          </p>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleResolveLegacy(post._id)}
                          className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle2 size={16} />
                          Resolve
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                        >
                          <XCircle size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "discussions" && (
            <div className="glass-card p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Pending Discussions</h2>
              {loading ? (
                <p className="text-gray-600">Loading...</p>
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
                          <CheckCircle2 size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => rejectDiscussion(d._id)}
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

          {tab === "professionals" && (
            <div className="glass-card p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Verify Professionals</h2>
              {loading ? (
                <p className="text-gray-600">Loading...</p>
              ) : pendingPros.length === 0 ? (
                <p className="text-gray-600">No pending professionals.</p>
              ) : (
                <div className="space-y-3">
                  {pendingPros.map((p) => (
                    <div
                      key={p._id}
                      className="bg-white/60 border border-white/40 rounded-2xl p-4 flex items-center justify-between gap-3"
                    >
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
                        <Shield size={16} />
                        Verify
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "categories" && (
            <div className="glass-card p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Lock / Unlock Categories</h2>
              {loading ? (
                <p className="text-gray-600">Loading...</p>
              ) : forumCategories.length === 0 ? (
                <p className="text-gray-600">No forum categories.</p>
              ) : (
                <div className="space-y-3">
                  {forumCategories.map((c) => (
                    <div
                      key={c._id}
                      className="bg-white/60 border border-white/40 rounded-2xl p-4 flex items-center justify-between gap-3"
                    >
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
                          <Unlock size={16} />
                          Unlock
                        </button>
                      ) : (
                        <button
                          onClick={() => lockCategory(c._id)}
                          className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                        >
                          <Lock size={16} />
                          Lock
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "circles" && (
            <div className="space-y-4">
              <div className="glass-card p-5">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <PlusCircle className="text-blue-600" />
                  Create Circle
                </h2>
                <form onSubmit={handleCreateCircle} className="space-y-3">
                  <input
                    className="input-field"
                    placeholder="Circle name"
                    value={newCircle.name}
                    onChange={(e) => setNewCircle((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <textarea
                    className="input-field min-h-[90px]"
                    placeholder="Description"
                    value={newCircle.description}
                    onChange={(e) =>
                      setNewCircle((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                  <input
                    className="input-field"
                    placeholder="Condition tag (optional)"
                    value={newCircle.conditionTag}
                    onChange={(e) =>
                      setNewCircle((prev) => ({ ...prev, conditionTag: e.target.value }))
                    }
                  />
                  <select
                    className="input-field"
                    value={newCircle.privacy}
                    onChange={(e) =>
                      setNewCircle((prev) => ({ ...prev, privacy: e.target.value }))
                    }
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                  <button
                    type="submit"
                    className="btn-primary flex items-center gap-2"
                    disabled={!newCircle.name.trim()}
                  >
                    <PlusCircle size={16} />
                    Create Circle
                  </button>
                </form>
              </div>
              <div className="glass-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Manage Circles</h2>
                  <select
                    className="input-field w-auto min-w-[180px]"
                    value={circleStatusFilter}
                    onChange={(e) => setCircleStatusFilter(e.target.value)}
                  >
                    <option value="all">All statuses</option>
                    <option value="approved">Approved</option>
                    <option value="waiting">Waiting</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                {loading ? (
                  <p className="text-gray-600">Loading...</p>
                ) : circles.length === 0 ? (
                  <p className="text-gray-600">No circles found.</p>
                ) : (
                  <div className="space-y-3">
                    {circles.map((circle) => {
                      const requestsOpen =
                        String(selectedCircleIdForRequests) === String(circle._id);
                      return (
                        <div
                          key={circle._id}
                          className="bg-white/60 border border-white/40 rounded-2xl p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-gray-900">{circle.name}</p>
                                {circleStatusPill(circle.status)}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {circle.description || "No description"}
                              </p>
                              <div className="mt-2 text-xs text-gray-500 space-y-1">
                                <p>
                                  By {circle.createdBy?.name || "Unknown"} • {fmt(circle.createdAt)}
                                </p>
                                <p>
                                  Tag: {circle.conditionTag || "-"} • Privacy:{" "}
                                  {circle.privacy || "-"}
                                </p>
                                <p>
                                  Members: {circle.membersCount || 0} • Pending requests:{" "}
                                  {circle.joinRequestsCount || 0}
                                </p>
                              </div>
                              {circle.requestReason ? (
                                <p className="mt-3 text-sm text-gray-800 whitespace-pre-wrap">
                                  Request reason: {circle.requestReason}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {circle.status === "waiting" && (
                              <>
                                <button
                                  onClick={() => approveCircle(circle._id)}
                                  className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                                >
                                  <Check size={16} />
                                  Approve
                                </button>
                                <button
                                  onClick={() => rejectCircle(circle._id)}
                                  className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                                >
                                  <X size={16} />
                                  Reject
                                </button>
                              </>
                            )}
                            {circle.status === "approved" && (
                              <button
                                onClick={() => toggleCircleJoinRequests(circle._id)}
                                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                              >
                                <UserCheck size={16} />
                                {requestsOpen
                                  ? "Hide Join Requests"
                                  : `Manage Join Requests (${circle.joinRequestsCount || 0})`}
                              </button>
                            )}
                            <button
                              onClick={() => deleteCircle(circle._id)}
                              className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black flex items-center gap-2"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                          {requestsOpen && circle.status === "approved" && (
                            <div className="mt-4 rounded-2xl border border-white/40 bg-white/70 p-4">
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <h3 className="font-bold text-gray-900">Pending Join Requests</h3>
                                <span className="text-xs text-gray-500">
                                  {circleJoinRequests.length} pending
                                </span>
                              </div>
                              {joinRequestsLoading ? (
                                <p className="text-gray-600">Loading join requests...</p>
                              ) : circleJoinRequests.length === 0 ? (
                                <p className="text-gray-600">No pending join requests.</p>
                              ) : (
                                <div className="space-y-3">
                                  {circleJoinRequests.map((request) => (
                                    <div
                                      key={request._id}
                                      className="rounded-xl border border-white/40 bg-white p-4"
                                    >
                                      <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-0">
                                          <p className="font-semibold text-gray-900">
                                            {request.user?.name || "Unknown User"}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-1">
                                            {request.user?.role || "user"}
                                            {request.user?.verified ? " • verified" : ""}
                                            {request.createdAt
                                              ? ` • requested ${fmt(request.createdAt)}`
                                              : ""}
                                          </p>
                                        </div>
                                        {pill(
                                          "bg-yellow-50 border-yellow-200 text-yellow-800",
                                          request.status || "pending"
                                        )}
                                      </div>
                                      <div className="mt-3">
                                        <p className="text-xs text-gray-500 mb-1">Reason</p>
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                          {request.reason || "No reason provided."}
                                        </p>
                                      </div>
                                      <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                          onClick={() =>
                                            approveJoinRequest(circle._id, request._id)
                                          }
                                          className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                                        >
                                          <CheckCircle2 size={16} />
                                          Approve Join
                                        </button>
                                        <button
                                          onClick={() =>
                                            rejectJoinRequest(circle._id, request._id)
                                          }
                                          className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                                        >
                                          <XCircle size={16} />
                                          Reject Join
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "live-sessions" && (
            <div className="space-y-4">
              <div className="glass-card p-5">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Live Sessions Monitor</h2>
                {loading ? (
                  <p className="text-gray-600">Loading...</p>
                ) : liveSessions.length === 0 ? (
                  <p className="text-gray-600">No live sessions right now.</p>
                ) : (
                  <div className="space-y-3">
                    {liveSessions.map((session) => (
                      <button
                        key={session._id}
                        onClick={() => setSelectedLiveId(session._id)}
                        className={`w-full text-left p-4 rounded-2xl border transition ${
                          String(selectedLiveId) === String(session._id)
                            ? "bg-blue-50 border-blue-300"
                            : "bg-white/60 border-white/40 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">{session.title}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {session.description || "No description"}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              By {session.startedBy?.name || "Doctor"} • {fmt(session.startedAt)}
                            </p>
                          </div>
                          {pill("bg-red-50 border-red-200 text-red-700", "live")}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="glass-card p-5">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Session Detail</h2>
                {!selectedLiveId ? (
                  <p className="text-gray-600">Select a session to inspect details.</p>
                ) : !liveSessionDetail ? (
                  <p className="text-gray-600">Loading session detail...</p>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white/60 border border-white/40 rounded-2xl p-4">
                      <p className="font-bold text-gray-900">
                        {liveSessionDetail.session?.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {liveSessionDetail.session?.description || "No description"}
                      </p>
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <p className="font-semibold">
                            {liveSessionDetail.session?.status || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Queue</p>
                          <p className="font-semibold">{liveSessionDetail.queueCount || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Answered</p>
                          <p className="font-semibold">
                            {liveSessionDetail.session?.answeredCount || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Started</p>
                          <p className="font-semibold">
                            {fmt(liveSessionDetail.session?.startedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/60 border border-white/40 rounded-2xl p-4">
                      <p className="font-semibold text-gray-900 mb-2">Current Active Question</p>
                      {liveSessionDetail.activeQuestion ? (
                        <>
                          <p className="text-sm text-gray-600">
                            Asked by: {liveSessionDetail.activeQuestion.askedBy?.name || "Anonymous"}
                          </p>
                          <p className="mt-2 text-gray-800 whitespace-pre-wrap">
                            {liveSessionDetail.activeQuestion.body}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-600">No active question.</p>
                      )}
                    </div>
                    <div className="bg-white/60 border border-white/40 rounded-2xl p-4">
                      <p className="font-semibold text-gray-900 mb-2">Queued Questions</p>
                      {Array.isArray(liveSessionDetail.queue) && liveSessionDetail.queue.length > 0 ? (
                        <div className="space-y-3">
                          {liveSessionDetail.queue.map((q, idx) => (
                            <div key={q._id} className="border border-white/40 rounded-xl p-3">
                              <p className="text-xs text-gray-500">Position {idx + 1}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {q.askedBy?.name || "Anonymous"}
                              </p>
                              <p className="mt-2 text-gray-800 whitespace-pre-wrap">{q.body}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">No queued questions.</p>
                      )}
                    </div>
                    <div className="bg-white/60 border border-white/40 rounded-2xl p-4">
                      <p className="font-semibold text-gray-900 mb-2">Recently Answered</p>
                      {Array.isArray(liveSessionDetail.answeredQuestions) &&
                      liveSessionDetail.answeredQuestions.length > 0 ? (
                        <div className="space-y-3">
                          {liveSessionDetail.answeredQuestions.map((q) => (
                            <div key={q._id} className="border border-white/40 rounded-xl p-3">
                              <p className="text-sm text-gray-600">
                                {q.askedBy?.name || "Anonymous"}
                              </p>
                              <p className="mt-2 text-gray-800 whitespace-pre-wrap">{q.body}</p>
                              <p className="mt-3 text-green-700 whitespace-pre-wrap">{q.answer}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">No answered questions yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "audit" && (
            <div className="glass-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-900">Audit Logs</h2>
                <div className="text-xs text-gray-500">
                  Total: <b>{auditTotal}</b>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
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
                  placeholder="Filter action"
                />
                <input
                  value={auditTargetType}
                  onChange={(e) => setAuditTargetType(e.target.value)}
                  className="input-field"
                  placeholder="Filter targetType"
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
              <div className="mt-4 space-y-3">
                {loading ? (
                  <p className="text-gray-600">Loading...</p>
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
                        Actor: <b>{a.actor?.name || String(a.actor || "Unknown")}</b>{" "}
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
              <div className="mt-4 flex items-center justify-between">
                <button
                  className={`px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 ${
                    auditPage <= 1 ? "opacity-50 pointer-events-none" : ""
                  }`}
                  onClick={() => fetchAudit(auditPage - 1)}
                >
                  Prev
                </button>
                <p className="text-sm text-gray-600">
                  Page <b>{auditPage}</b> / {auditPages}
                </p>
                <button
                  className={`px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 ${
                    auditPage >= auditPages ? "opacity-50 pointer-events-none" : ""
                  }`}
                  onClick={() => fetchAudit(auditPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {tab === "videos" && (
            <div className="glass-card p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Manage Videos</h2>
              {loading ? (
                <p className="text-gray-600">Loading...</p>
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
                      onChange={(e) =>
                        setNewVideo({ ...newVideo, description: e.target.value })
                      }
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
                      <Upload
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
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
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {loading ? `Uploading... ${uploadProgress}%` : "Upload Video"}
                    </button>
                  </form>
                  <div className="space-y-3">
                    {videos.map((video) => (
                      <div
                        key={video._id}
                        className="bg-white/60 border border-white/40 rounded-2xl p-4 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">{video.title}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {video.description}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteVideo(video._id)}
                          className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                        >
                          <XCircle size={16} />
                          Delete
                        </button>
                      </div>
                    ))}
                    {videos.length === 0 && <p className="text-gray-600">No videos yet.</p>}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==================== PUBLIC HEALTH HUB TAB ==================== */}
          {tab === "public-health" && (
            <div className="space-y-6">
              <div className="glass-card p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <HeartPulse className="text-primary" size={32} />
                  Public Health Hub — Editor Console
                </h2>
                <div className="flex gap-2">
                  {["campaigns", "news", "tips", "events", "questions"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setPhTab(t)}
                      className={`px-5 py-2 rounded-2xl text-sm font-medium transition ${
                        phTab === t ? "bg-blue-600 text-white" : "bg-white border hover:bg-gray-50"
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {phTab === "campaigns" && (
                <div className="glass-card p-6">
                  <h3 className="font-bold text-xl mb-4">Campaigns</h3>
                  {phCampaigns.length === 0 ? (
                    <p className="text-gray-600">No campaigns yet.</p>
                  ) : (
                    phCampaigns.map((c) => (
                      <div key={c._id} className="bg-white/60 p-5 rounded-2xl mb-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{c.title}</p>
                          <p className="text-sm text-gray-600">{c.summary}</p>
                        </div>
                        <button
                          onClick={() => archiveCampaign(c._id)}
                          className="px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700"
                        >
                          Archive
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {phTab === "news" && (
                <div className="glass-card p-6">
                  <h3 className="font-bold text-xl mb-4">Official News</h3>
                  {phNews.length === 0 ? (
                    <p className="text-gray-600">No news yet.</p>
                  ) : (
                    phNews.map((n) => (
                      <div key={n._id} className="bg-white/60 p-5 rounded-2xl mb-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{n.title}</p>
                          <p className="text-sm text-gray-600">{n.summary}</p>
                        </div>
                        <button
                          onClick={() => publishNews(n._id)}
                          className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
                        >
                          Publish
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {phTab === "tips" && (
                <div className="glass-card p-6">
                  <h3 className="font-bold text-xl mb-4">Health Tips</h3>
                  {phTips.length === 0 ? (
                    <p className="text-gray-600">No tips yet.</p>
                  ) : (
                    phTips.map((t) => (
                      <div key={t._id} className="bg-white/60 p-5 rounded-2xl mb-4">
                        <p className="font-semibold">{t.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{t.shortText}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {phTab === "events" && (
                <div className="glass-card p-6">
                  <h3 className="font-bold text-xl mb-4">Live Teaching Events</h3>
                  {phEvents.length === 0 ? (
                    <p className="text-gray-600">No events yet.</p>
                  ) : (
                    phEvents.map((e) => (
                      <div key={e._id} className="bg-white/60 p-5 rounded-2xl mb-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{e.title}</p>
                          <p className="text-sm text-gray-600">{new Date(e.scheduledAt).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startLiveEvent(e._id)}
                            className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
                          >
                            Start Live
                          </button>
                          <button
                            onClick={() => endLiveEvent(e._id)}
                            className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black"
                          >
                            End
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {phTab === "questions" && (
                <div className="glass-card p-6">
                  <h3 className="font-bold text-xl mb-4">Pending Questions</h3>
                  {phPendingQuestions.length === 0 ? (
                    <p className="text-gray-600">No pending questions.</p>
                  ) : (
                    phPendingQuestions.map((q) => (
                      <div key={q._id} className="bg-white/60 p-5 rounded-2xl mb-4">
                        <p className="font-medium">{q.questionText}</p>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => approveQuestion(q._id)}
                            className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectQuestion(q._id)}
                            className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="text-blue-600" />
              Live Activity
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Updates in real time from audit and moderation events.
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
                      {a.targetType ? `target: ${a.targetType}` : ""}{" "}
                      {a.targetId ? `• ${String(a.targetId)}` : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => {
                setTab("audit");
                fetchAudit(1);
              }}
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
              <li>• Create circles directly when urgent support is needed.</li>
              <li>• Approve or reject waiting circles quickly.</li>
              <li>• Review join requests inside approved circles.</li>
              <li>• Delete unused or problematic circles completely.</li>
              <li>• Lock categories during misinformation spikes.</li>
              <li>• Verify professionals before public answering.</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}