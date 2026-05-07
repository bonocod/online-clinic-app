import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { connectSocket, joinPublicHealthHub, leavePublicHealthHub } from "../utils/socket";
import {
  HeartPulse, Calendar, BookOpen, Radio, AlertTriangle, Building2,
  ChevronRight, Shield, ArrowRight, Play, Clock, Newspaper,
  Activity, Zap, Bell,
} from "lucide-react";

const urgencyConfig = {
  critical: { bg: "bg-red-600", pill: "bg-red-100 text-red-700 border-red-300", dot: "bg-red-500", label: "CRITICAL" },
  high:     { bg: "bg-orange-500", pill: "bg-orange-100 text-orange-700 border-orange-300", dot: "bg-orange-400", label: "HIGH" },
  normal:   { bg: "bg-blue-500", pill: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-400", label: "UPDATE" },
  low:      { bg: "bg-gray-400", pill: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400", label: "INFO" },
};

function StatCard({ icon: Icon, value, label, to, color = "text-primary" }) {
  const inner = (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 10px 20px rgba(0,0,0,0.08)" }}
      className="glass-card p-5 text-center flex flex-col items-center gap-2"
    >
      <Icon size={28} className={color} />
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
    </motion.div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

function LiveBanner({ events }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (events.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % events.length), 5000);
    return () => clearInterval(t);
  }, [events.length]);

  if (!events.length) return null;
  const ev = events[idx];
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
    >
      <Link to={`/public-health/events/${ev._id}`}>
        <div className="bg-red-600 text-white px-5 py-3 flex items-center gap-4 hover:bg-red-700 transition">
          <span className="flex items-center gap-1.5 font-bold text-sm shrink-0">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            LIVE NOW
          </span>
          <span className="flex-1 font-medium text-sm truncate">{ev.title}</span>
          <span className="flex items-center gap-1 text-sm shrink-0 opacity-80">
            <Play size={13} fill="white" /> Watch
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function UrgencyPill({ level }) {
  const cfg = urgencyConfig[level] || urgencyConfig.low;
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${cfg.pill}`}>
      {cfg.label}
    </span>
  );
}

function NewsItem({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link
        to={`/public-health/news/${item._id}`}
        className="flex gap-3 p-3 rounded-xl hover:bg-white/70 transition group"
      >
        <div className="flex flex-col items-center pt-1 shrink-0">
          <span className={`w-2 h-2 rounded-full ${urgencyConfig[item.urgencyLevel]?.dot || "bg-gray-400"}`} />
          <span className="flex-1 w-0.5 bg-gray-100 mt-1.5" style={{ minHeight: 24 }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <UrgencyPill level={item.urgencyLevel} />
            {item.institutionName && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Building2 size={10} /> {item.institutionName}
              </span>
            )}
          </div>
          <p className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-primary transition line-clamp-2">
            {item.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.summary}</p>
        </div>
        <ChevronRight size={15} className="text-gray-300 group-hover:text-primary transition shrink-0 mt-2" />
      </Link>
    </motion.div>
  );
}

function EventItem({ event }) {
  const isLive = event.status === "live";
  return (
    <Link
      to={`/public-health/events/${event._id}`}
      className={`block p-3.5 rounded-xl transition ${isLive
        ? "bg-red-50 border border-red-200 hover:bg-red-100"
        : "hover:bg-white/70 border border-transparent hover:border-white/60"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {isLive ? (
          <span className="flex items-center gap-1.5 text-xs text-red-600 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-blue-600">
            <Clock size={11} /> Upcoming
          </span>
        )}
        <span className="text-xs text-gray-400 ml-auto">
          {new Date(event.scheduledAt).toLocaleDateString([], { month: "short", day: "numeric" })}
        </span>
      </div>
      <p className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2">{event.title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{event.hostName} · {event.organization}</p>
      {isLive && (
        <div className="flex items-center gap-1.5 mt-2 text-red-600 text-xs font-semibold">
          <Play size={12} fill="currentColor" /> Watch live stream now
        </div>
      )}
    </Link>
  );
}

function AlertCard({ item }) {
  const cfg = urgencyConfig[item.urgencyLevel] || urgencyConfig.normal;
  return (
    <Link to={`/public-health/news/${item._id}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={`rounded-2xl overflow-hidden border-l-4 bg-white/60 backdrop-blur p-4 hover:bg-white/80 transition ${
          item.urgencyLevel === "critical" ? "border-red-500" : "border-orange-400"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}>
            <AlertTriangle size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <UrgencyPill level={item.urgencyLevel} />
              {item.institutionName && (
                <span className="text-xs text-gray-500">{item.institutionName}</span>
              )}
            </div>
            <p className="font-bold text-gray-900 text-sm leading-snug">{item.title}</p>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.summary}</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function InstitutionBadge({ name, badge }) {
  return (
    <div className="flex items-center gap-2.5 bg-white/60 border border-white/50 rounded-xl px-4 py-2.5">
      {badge ? (
        <img
          src={badge}
          alt={name}
          className="h-8 w-8 rounded-full object-cover border border-gray-200"
          onError={(e) => { e.target.style.display = "none"; }}
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Building2 size={16} className="text-primary" />
        </div>
      )}
      <div>
        <p className="text-xs font-semibold text-gray-800">{name}</p>
        <div className="flex items-center gap-1">
          <Shield size={10} className="text-accent" />
          <span className="text-xs text-accent font-medium">Verified</span>
        </div>
      </div>
    </div>
  );
}

const PublicHealth = () => {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHome = useCallback(async () => {
    try {
      const res = await api.get("/public-health/home");
      setHomeData(res.data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchHome();
    connectSocket();
    joinPublicHealthHub();
    return () => leavePublicHealthHub();
  }, [fetchHome]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        <p className="text-gray-400 text-sm">Loading Public Health Hub…</p>
      </div>
    );
  }

  const allNews       = homeData?.latestNews || [];
  const urgentNews    = homeData?.urgentNews || [];
  const liveEvents    = homeData?.liveEvents || [];
  const upcomingEvents = homeData?.upcomingEvents || [];
  const allEvents     = [...liveEvents, ...upcomingEvents];

  const institutions = [];
  const seen = new Set();
  [...allNews, ...urgentNews].forEach(n => {
    if (n.institutionName && !seen.has(n.institutionName)) {
      seen.add(n.institutionName);
      institutions.push({ name: n.institutionName, badge: n.institutionBadge });
    }
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-8">

      {/* Live events ticker */}
      {liveEvents.length > 0 && <LiveBanner events={liveEvents} />}

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl"
        style={{ background: "linear-gradient(135deg, #1e40af 0%, #4f46e5 50%, #7c3aed 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10 bg-white" />

        <div className="relative z-10 px-8 py-12 md:py-16 md:px-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur">
              <HeartPulse size={26} className="text-white" />
            </div>
            <span className="text-white/70 text-sm font-medium uppercase tracking-widest">
              Official Platform
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-3">
            Rwanda Public<br />Health Hub
          </h1>
          <p className="text-white/75 text-base md:text-lg max-w-lg mb-8 leading-relaxed">
            Verified health updates, urgent alerts, and live teaching sessions from Rwanda's leading medical institutions.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/public-health/news"
              className="flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2.5 rounded-full hover:bg-blue-50 transition text-sm"
            >
              <Newspaper size={15} /> Browse Updates
            </Link>
            <Link
              to="/public-health/events"
              className="flex items-center gap-2 bg-white/20 backdrop-blur text-white font-semibold px-5 py-2.5 rounded-full hover:bg-white/30 transition text-sm border border-white/30"
            >
              <Radio size={15} /> Join Live Events
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard to="/public-health/news" icon={BookOpen} value={allNews.length} label="Latest Updates" color="text-primary" />
        <StatCard icon={AlertTriangle} value={urgentNews.length} label="Active Alerts" color="text-red-500" />
        <StatCard to="/public-health/events" icon={Radio} value={liveEvents.length} label="Live Now" color="text-red-600" />
        <StatCard to="/public-health/events" icon={Calendar} value={upcomingEvents.length} label="Upcoming Events" color="text-blue-600" />
      </div>

      {/* Emergency Alerts */}
      <AnimatePresence>
        {urgentNews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2 text-red-700">
                <AlertTriangle size={20} className="text-red-500" />
                Active Health Alerts
              </h2>
              <Link to="/public-health/news?filter=critical" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {urgentNews.slice(0, 4).map(n => <AlertCard key={n._id} item={n} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* News Column */}
        <div className="lg:col-span-3 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-xl flex items-center gap-2">
              <Activity className="text-primary" size={20} />
              Latest Health Updates
            </h2>
            <Link
              to="/public-health/news"
              className="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
            >
              See all <ArrowRight size={14} />
            </Link>
          </div>
          {allNews.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Newspaper size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No updates published yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100/50">
              {allNews.slice(0, 6).map((n, i) => <NewsItem key={n._id} item={n} index={i} />)}
            </div>
          )}
          <Link
            to="/public-health/news"
            className="mt-4 flex items-center justify-center gap-2 text-sm text-primary hover:underline pt-4 border-t border-gray-100/60"
          >
            Browse all health updates <ArrowRight size={14} />
          </Link>
        </div>

        {/* Events Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="glass-card p-6 flex-1">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-xl flex items-center gap-2">
                <Calendar className="text-primary" size={20} />
                Teaching Events
              </h2>
              <Link
                to="/public-health/events"
                className="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
              >
                See all <ArrowRight size={14} />
              </Link>
            </div>
            {allEvents.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Calendar size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No events scheduled.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allEvents.slice(0, 5).map(e => <EventItem key={e._id} event={e} />)}
              </div>
            )}
          </div>

          {/* Quick tip card */}
          <div
            className="glass-card p-5 text-center"
            style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(59,130,246,0.08))" }}
          >
            <Bell size={22} className="mx-auto text-accent mb-2" />
            <p className="text-sm font-semibold text-gray-800 mb-1">Stay Informed</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              All updates on this platform are verified by Rwanda's official health institutions.
            </p>
            <div className="flex items-center justify-center gap-1 mt-3">
              <Shield size={13} className="text-accent" />
              <span className="text-xs text-accent font-semibold">Verified Official Source</span>
            </div>
          </div>
        </div>
      </div>

      {/* Institution Partners */}
      {institutions.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building2 size={18} className="text-primary" />
            <h2 className="font-bold text-lg">Trusted Partner Institutions</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {institutions.map(inst => (
              <InstitutionBadge key={inst.name} name={inst.name} badge={inst.badge} />
            ))}
          </div>
        </div>
      )}

      {/* CTA Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: "/public-health/news", icon: BookOpen, label: "Browse All Updates", desc: "Explore verified health news and alerts" },
          { to: "/public-health/events", icon: Radio, label: "Join Live Events", desc: "Watch live teaching sessions and ask questions" },
          { to: "/public-health/saved", icon: Zap, label: "My Saved Items", desc: "Access your bookmarked health content" },
        ].map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to}>
            <motion.div
              whileHover={{ y: -3, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
              className="glass-card p-5 flex items-center gap-4 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition">
                <Icon size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{desc}</p>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition" />
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default PublicHealth;
