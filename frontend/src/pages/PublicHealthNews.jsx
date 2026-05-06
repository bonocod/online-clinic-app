import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import { AlertTriangle, Building2, ExternalLink, BookOpen } from "lucide-react";

const urgencyColor = (level) => {
  if (level === "critical") return "bg-red-100 text-red-700 border-red-200";
  if (level === "high") return "bg-orange-100 text-orange-700 border-orange-200";
  if (level === "normal") return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
};

const urgencyIcon = (level) => {
  if (level === "critical" || level === "high") return <AlertTriangle size={14} className="inline mr-1" />;
  return null;
};

const PublicHealthNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get("/public-health/news?limit=50");
        setNews(res.data.items || res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );

  const filtered =
    filter === "all"
      ? news
      : news.filter((n) => n.urgencyLevel === filter);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="text-primary" />
            Health Updates & Alerts
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Official updates from health institutions
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "critical", "high", "normal", "low"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm border transition ${
                filter === f
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-10 text-center text-gray-500">
          No updates found.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <motion.div
            key={item._id}
            layout
            className="glass-card p-6 flex flex-col gap-3"
          >
            {/* Header row */}
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-xs px-3 py-1 rounded-full border font-medium flex items-center ${urgencyColor(
                  item.urgencyLevel
                )}`}
              >
                {urgencyIcon(item.urgencyLevel)}
                {item.urgencyLevel?.toUpperCase()}
              </span>
              <span className="text-xs text-gray-400">
                {item.publishedAt
                  ? new Date(item.publishedAt).toLocaleDateString()
                  : ""}
              </span>
            </div>

            {/* Cover image */}
            {item.coverImage && (
              <img
                src={item.coverImage}
                alt={item.title}
                className="w-full h-40 object-cover rounded-xl"
              />
            )}

            {/* Title */}
            <h3 className="font-bold text-lg text-gray-900 leading-snug">
              {item.title}
            </h3>

            {/* Summary */}
            <p className="text-sm text-gray-600 line-clamp-3">{item.summary}</p>

            {/* Body (expanded) */}
            {expanded === item._id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-sm text-gray-700 whitespace-pre-wrap border-t pt-3 mt-1"
              >
                {item.body}
              </motion.div>
            )}

            <button
              onClick={() => setExpanded(expanded === item._id ? null : item._id)}
              className="text-primary text-sm self-start hover:underline"
            >
              {expanded === item._id ? "Show less" : "Read full update →"}
            </button>

            {/* Institution badge */}
            {item.institutionName && (
              <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/40">
                {item.institutionBadge && (
                  <img
                    src={item.institutionBadge}
                    alt={item.institutionName}
                    className="h-8 w-8 rounded-full object-cover border border-gray-200"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Building2 size={14} className="text-primary" />
                  <span>
                    In partnership with{" "}
                    <span className="font-semibold text-gray-700">
                      {item.institutionName}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Source link */}
            {item.sourceUrl && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                <ExternalLink size={12} />
                View source: {item.sourceName}
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PublicHealthNews;
