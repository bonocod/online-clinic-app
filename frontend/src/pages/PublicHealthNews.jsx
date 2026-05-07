import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import {
  AlertTriangle, Building2, ExternalLink, Search, BookOpen,
  Clock, ChevronDown, ChevronUp, Shield, Calendar, Share2, X,
} from "lucide-react";

const URGENCY_LEVELS = ["all", "critical", "high", "normal", "low"];

const urgencyConfig = {
  critical: {
    pill:   "bg-red-600 text-white border-red-600",
    card:   "border-l-4 border-red-500 bg-red-50/80",
    dot:    "bg-red-500",
    label:  "CRITICAL",
    icon:   true,
  },
  high: {
    pill:   "bg-orange-500 text-white border-orange-500",
    card:   "border-l-4 border-orange-400 bg-orange-50/60",
    dot:    "bg-orange-400",
    label:  "HIGH",
    icon:   true,
  },
  normal: {
    pill:   "bg-blue-100 text-blue-700 border-blue-300",
    card:   "",
    dot:    "bg-blue-400",
    label:  "UPDATE",
    icon:   false,
  },
  low: {
    pill:   "bg-gray-100 text-gray-600 border-gray-200",
    card:   "",
    dot:    "bg-gray-300",
    label:  "INFO",
    icon:   false,
  },
};

const readTime = (body = "", summary = "") => {
  const words = `${body} ${summary}`.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

function UrgencyBadge({ level }) {
  const cfg = urgencyConfig[level] || urgencyConfig.low;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-semibold ${cfg.pill}`}>
      {cfg.icon && <AlertTriangle size={10} />}
      {cfg.label}
    </span>
  );
}

function InstitutionRow({ name, badge }) {
  if (!name) return null;
  return (
    <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100/60 mt-auto">
      {badge ? (
        <img
          src={badge}
          alt={name}
          className="h-7 w-7 rounded-full object-cover border border-gray-200"
          onError={(e) => (e.target.style.display = "none")}
        />
      ) : (
        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Building2 size={13} className="text-primary" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-gray-500 leading-tight">
          In partnership with{" "}
          <span className="font-semibold text-gray-700">{name}</span>
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <Shield size={9} className="text-accent" />
          <span className="text-xs text-accent font-medium">Verified Institution</span>
        </div>
      </div>
    </div>
  );
}

function ShareButton({ title, url }) {
  const [copied, setCopied] = useState(false);

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <button
      onClick={handleShare}
      title="Share this update"
      className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-primary"
    >
      {copied ? <span className="text-xs text-accent font-medium">Copied!</span> : <Share2 size={14} />}
    </button>
  );
}

function NewsCard({ item, isExpanded, onToggle }) {
  const cfg = urgencyConfig[item.urgencyLevel] || urgencyConfig.low;
  const mins = readTime(item.body, item.summary);
  const isUrgent = item.urgencyLevel === "critical" || item.urgencyLevel === "high";
  const detailUrl = `${window.location.origin}/public-health/news/${item._id}`;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`glass-card flex flex-col gap-0 overflow-hidden ${isUrgent ? cfg.card : ""}`}
      style={{ padding: 0 }}
    >
      {/* Urgency strip for critical */}
      {item.urgencyLevel === "critical" && (
        <div className="bg-red-600 px-4 py-1.5 flex items-center gap-2">
          <AlertTriangle size={13} className="text-white" />
          <span className="text-white text-xs font-bold uppercase tracking-wide">Urgent Health Alert</span>
        </div>
      )}
      {item.urgencyLevel === "high" && (
        <div className="bg-orange-500 px-4 py-1.5 flex items-center gap-2">
          <AlertTriangle size={13} className="text-white" />
          <span className="text-white text-xs font-bold uppercase tracking-wide">High Priority Update</span>
        </div>
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Meta row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <UrgencyBadge level={item.urgencyLevel} />
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={11} /> {mins} min read
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar size={11} /> {formatDate(item.publishedAt || item.createdAt)}
            </span>
            <ShareButton title={item.title} url={detailUrl} />
          </div>
        </div>

        {/* Cover image */}
        {item.coverImage && (
          <img
            src={item.coverImage}
            alt={item.title}
            loading="lazy"
            className="w-full h-36 object-cover rounded-xl"
          />
        )}

        {/* Title */}
        <h3 className="font-bold text-base text-gray-900 leading-snug">
          {item.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
          {item.summary}
        </p>

        {/* Expanded body */}
        <AnimatePresence>
          {isExpanded && item.body && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-3 mt-1">
                {item.body}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Read more / less */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <button
            onClick={onToggle}
            className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
          >
            {isExpanded ? (
              <><ChevronUp size={15} /> Show less</>
            ) : (
              <><ChevronDown size={15} /> Read full update</>
            )}
          </button>
          <Link
            to={`/public-health/news/${item._id}`}
            className="text-xs text-gray-400 hover:text-primary transition"
          >
            Open article →
          </Link>
        </div>

        {/* Institution */}
        <InstitutionRow name={item.institutionName} badge={item.institutionBadge} />

        {/* Source link */}
        {item.sourceUrl && (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition"
          >
            <ExternalLink size={11} /> Source: {item.sourceName || "Official source"}
          </a>
        )}
      </div>
    </motion.article>
  );
}

const PublicHealthNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get("/public-health/news?limit=100");
        const items = res.data.items || res.data || [];
        setNews(items);
        const c = { all: items.length };
        URGENCY_LEVELS.slice(1).forEach(l => {
          c[l] = items.filter(n => n.urgencyLevel === l).length;
        });
        setCounts(c);
      } catch {}
      finally { setLoading(false); }
    };
    fetchNews();
  }, []);

  const filtered = useMemo(() => {
    let items = filter === "all" ? news : news.filter(n => n.urgencyLevel === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.summary?.toLowerCase().includes(q) ||
        n.institutionName?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [news, filter, search]);

  const criticalItems = filtered.filter(n => n.urgencyLevel === "critical");
  const highItems     = filtered.filter(n => n.urgencyLevel === "high");
  const restItems     = filtered.filter(n => n.urgencyLevel !== "critical" && n.urgencyLevel !== "high");

  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id);

  const urgencyLabels = { all: "All", critical: "Critical", high: "High", normal: "Normal", low: "Low" };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        <p className="text-gray-400 text-sm">Loading health updates…</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-8">

      {/* Header */}
      <div className="glass-card p-6 flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-gray-900">
              <BookOpen className="text-primary" size={28} />
              Health Updates & Alerts
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Official updates from Rwanda's verified health institutions
            </p>
          </div>
          <Link to="/public-health" className="text-sm text-primary hover:underline">
            ← Back to Hub
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search updates by title, summary, or institution…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 pr-10"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {URGENCY_LEVELS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm border font-medium transition flex items-center gap-1.5 ${
                filter === f
                  ? f === "critical" ? "bg-red-600 text-white border-red-600"
                  : f === "high" ? "bg-orange-500 text-white border-orange-500"
                  : "bg-primary text-white border-primary"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f === "critical" && filter === f && <AlertTriangle size={12} />}
              {urgencyLabels[f]}
              {counts[f] > 0 && (
                <span className={`text-xs ${filter === f ? "opacity-80" : "text-gray-400"}`}>
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      {search && (
        <p className="text-sm text-gray-500 px-1">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "<span className="font-medium text-gray-700">{search}</span>"
        </p>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-16 text-center"
        >
          <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No updates found.</p>
          {search && (
            <button onClick={() => setSearch("")} className="mt-2 text-sm text-primary hover:underline">
              Clear search
            </button>
          )}
        </motion.div>
      )}

      {/* Critical alerts — full width */}
      {criticalItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-bold text-base text-red-700 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            Critical Alerts ({criticalItems.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticalItems.map(item => (
              <NewsCard
                key={item._id}
                item={item}
                isExpanded={expanded === item._id}
                onToggle={() => toggleExpand(item._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* High priority */}
      {highItems.length > 0 && (
        <div className="space-y-4">
          {criticalItems.length > 0 && (
            <h2 className="font-bold text-base text-orange-700 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-400" />
              High Priority ({highItems.length})
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highItems.map(item => (
              <NewsCard
                key={item._id}
                item={item}
                isExpanded={expanded === item._id}
                onToggle={() => toggleExpand(item._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular updates */}
      {restItems.length > 0 && (
        <div className="space-y-4">
          {(criticalItems.length > 0 || highItems.length > 0) && (
            <h2 className="font-bold text-base text-gray-700 flex items-center gap-2">
              <BookOpen size={18} className="text-gray-400" />
              General Updates ({restItems.length})
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restItems.map(item => (
              <NewsCard
                key={item._id}
                item={item}
                isExpanded={expanded === item._id}
                onToggle={() => toggleExpand(item._id)}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PublicHealthNews;
