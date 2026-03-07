import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { ArrowLeft, AlertCircle, Clock3, Search } from "lucide-react";

const fmt = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "";
  }
};

const PastSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/forum/live-sessions?status=past");
      setSessions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to load past sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;

    return sessions.filter((session) =>
      `${session.title} ${session.description || ""} ${session.startedBy?.name || ""} ${session.categoryId?.name || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [query, sessions]);

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Link to="/forum" className="inline-flex items-center text-primary">
        <ArrowLeft className="mr-2" />
        Back to Forum
      </Link>

      <div className="glass-card p-6">
        <h1 className="text-3xl font-bold text-gray-900">Past Live Q&amp;A Sessions</h1>
        <p className="text-gray-600 mt-2">
          Review previous doctor question sessions and their answers.
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
            placeholder="Search past sessions..."
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-6">
          <p className="text-gray-600">No past sessions found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((session) => (
            <Link
              key={session._id}
              to={`/live-sessions/${session._id}`}
              className="glass-card p-5 hover:bg-white/60 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-lg">{session.title}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {session.description || "Ended doctor Q&A session"}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                  ENDED
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
                  <span className="font-medium">Ended:</span>{" "}
                  {fmt(session.endedAt || session.updatedAt)}
                </p>
                <p className="flex items-center gap-1">
                  <Clock3 size={14} />
                  Answered {session.answeredCount || 0} questions
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PastSessions;