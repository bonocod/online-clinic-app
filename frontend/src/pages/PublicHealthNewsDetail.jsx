import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import {
  AlertTriangle, Building2, ExternalLink, BookOpen,
  Clock, Calendar, Shield, Share2, ChevronLeft, ArrowRight,
} from "lucide-react";

const urgencyConfig = {
  critical: {
    banner: "bg-red-600",
    pill:   "bg-red-100 text-red-700 border-red-300",
    bar:    "border-l-4 border-red-500",
    label:  "CRITICAL",
  },
  high: {
    banner: "bg-orange-500",
    pill:   "bg-orange-100 text-orange-700 border-orange-300",
    bar:    "border-l-4 border-orange-400",
    label:  "HIGH PRIORITY",
  },
  normal: {
    banner: "bg-blue-500",
    pill:   "bg-blue-100 text-blue-700 border-blue-200",
    bar:    "",
    label:  "HEALTH UPDATE",
  },
  low: {
    banner: "bg-gray-400",
    pill:   "bg-gray-100 text-gray-600 border-gray-200",
    bar:    "",
    label:  "INFORMATION",
  },
};

const readTime = (body = "", summary = "") => {
  const words = `${body} ${summary}`.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
};

function ShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const whatsapp = () => {
    const text = encodeURIComponent(`Health Update: ${title} — ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 font-medium">Share:</span>
      <button
        onClick={whatsapp}
        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition"
      >
        <Share2 size={12} /> WhatsApp
      </button>
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full transition"
      >
        {copied ? "✓ Copied!" : "Copy link"}
      </button>
    </div>
  );
}

const PublicHealthNewsDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/public-health/news/${id}`);
        setArticle(res.data);

        // Fetch related (same urgency or general latest)
        const relRes = await api.get("/public-health/news?limit=10");
        const items = (relRes.data.items || relRes.data || []).filter(
          (n) => n._id !== id
        );
        setRelated(items.slice(0, 3));
      } catch (e) {
        if (e.response?.status === 404) setError("This health update was not found.");
        else setError("Failed to load this article. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        <p className="text-gray-400 text-sm">Loading article…</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="glass-card p-16 text-center">
        <BookOpen size={40} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600 font-medium mb-4">{error || "Article not found."}</p>
        <Link to="/public-health/news" className="btn-primary inline-flex items-center gap-2 text-sm">
          <ChevronLeft size={15} /> Back to Updates
        </Link>
      </div>
    );
  }

  const cfg  = urgencyConfig[article.urgencyLevel] || urgencyConfig.normal;
  const mins = readTime(article.body, article.summary);
  const url  = window.location.href;
  const isAlert = article.urgencyLevel === "critical" || article.urgencyLevel === "high";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-6 pb-10"
    >
      {/* Back nav */}
      <Link
        to="/public-health/news"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <ChevronLeft size={16} /> Back to Health Updates
      </Link>

      {/* Alert banner (critical / high) */}
      {isAlert && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cfg.banner} rounded-2xl px-5 py-3 flex items-center gap-3`}
        >
          <AlertTriangle size={18} className="text-white shrink-0" />
          <p className="text-white font-bold text-sm">
            {article.urgencyLevel === "critical"
              ? "⚠ This is an urgent health alert. Follow all official guidance."
              : "This is a high-priority health update from official sources."}
          </p>
        </motion.div>
      )}

      {/* Main article card */}
      <article className="glass-card overflow-hidden" style={{ padding: 0 }}>

        {/* Cover image */}
        {article.coverImage && (
          <div className="w-full h-52 md:h-72 overflow-hidden">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className={`text-xs px-3 py-1 rounded-full border font-bold flex items-center gap-1 ${cfg.pill}`}>
              {isAlert && <AlertTriangle size={10} />}
              {cfg.label}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock size={12} /> {mins} min read
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar size={12} />
              {formatDate(article.publishedAt || article.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
            {article.title}
          </h1>

          {/* Summary */}
          <p className="text-base text-gray-600 leading-relaxed mb-6 font-medium border-l-4 border-primary/30 pl-4">
            {article.summary}
          </p>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-6" />

          {/* Full body */}
          {article.body ? (
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap text-base space-y-4">
              {article.body}
            </div>
          ) : (
            <p className="text-gray-400 italic text-sm">Full article body not available.</p>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 mt-8 mb-6" />

          {/* Institution */}
          {article.institutionName && (
            <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50/60 border border-blue-100 rounded-2xl">
              {article.institutionBadge ? (
                <img
                  src={article.institutionBadge}
                  alt={article.institutionName}
                  className="h-12 w-12 rounded-full object-cover border-2 border-white shadow"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 size={22} className="text-primary" />
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Published in partnership with</p>
                <p className="font-bold text-gray-900">{article.institutionName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Shield size={11} className="text-accent" />
                  <span className="text-xs text-accent font-semibold">Verified Official Institution</span>
                </div>
              </div>
            </div>
          )}

          {/* Source link */}
          {article.sourceUrl && (
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-6"
            >
              <ExternalLink size={14} /> View original source: {article.sourceName || "Official source"}
            </a>
          )}

          {/* Share */}
          <div className="pt-4 border-t border-gray-100">
            <ShareButtons title={article.title} url={url} />
          </div>
        </div>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            More Health Updates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((item) => {
              const rcfg = urgencyConfig[item.urgencyLevel] || urgencyConfig.normal;
              return (
                <Link key={item._id} to={`/public-health/news/${item._id}`}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="glass-card hover:bg-white/70 transition h-full flex flex-col gap-2"
                  >
                    {item.coverImage && (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-28 object-cover rounded-xl -mt-1"
                      />
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold self-start ${rcfg.pill}`}>
                      {rcfg.label}
                    </span>
                    <p className="font-semibold text-sm text-gray-900 leading-snug line-clamp-3">
                      {item.title}
                    </p>
                    {item.institutionName && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-auto">
                        <Building2 size={10} /> {item.institutionName}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-primary font-medium">
                      Read update <ArrowRight size={12} />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PublicHealthNewsDetail;
