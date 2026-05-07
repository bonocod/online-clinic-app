import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { connectSocket, joinPublicHealthHub, leavePublicHealthHub } from "../utils/socket";
import { Calendar, Play, Radio, Clock, Users, ChevronRight, Search, X, Mic } from "lucide-react";

function useCountdown(targetDate) {
  const calc = (d) => {
    const diff = new Date(d).getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000)  / 60000),
      seconds: Math.floor((diff % 60000)    / 1000),
    };
  };

  const [t, setT] = useState(() => calc(targetDate));
  useEffect(() => {
    setT(calc(targetDate));
    const id = setInterval(() => setT(calc(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return t;
}

function CountdownDisplay({ targetDate }) {
  const t = useCountdown(targetDate);
  if (!t) return <span className="text-xs text-gray-400">Starting soon</span>;
  return (
    <div className="flex items-center gap-1.5">
      {t.days > 0 && (
        <span className="flex flex-col items-center bg-blue-50 border border-blue-100 rounded-lg px-2 py-1">
          <span className="text-sm font-bold text-blue-700 leading-none">{t.days}</span>
          <span className="text-xs text-blue-400 leading-none">d</span>
        </span>
      )}
      <span className="flex flex-col items-center bg-blue-50 border border-blue-100 rounded-lg px-2 py-1">
        <span className="text-sm font-bold text-blue-700 leading-none">{String(t.hours).padStart(2,"0")}</span>
        <span className="text-xs text-blue-400 leading-none">h</span>
      </span>
      <span className="flex flex-col items-center bg-blue-50 border border-blue-100 rounded-lg px-2 py-1">
        <span className="text-sm font-bold text-blue-700 leading-none">{String(t.minutes).padStart(2,"0")}</span>
        <span className="text-xs text-blue-400 leading-none">m</span>
      </span>
      <span className="flex flex-col items-center bg-blue-50 border border-blue-100 rounded-lg px-2 py-1">
        <span className="text-sm font-bold text-blue-700 tabular-nums leading-none">{String(t.seconds).padStart(2,"0")}</span>
        <span className="text-xs text-blue-400 leading-none">s</span>
      </span>
    </div>
  );
}

function RoleTag({ role }) {
  const colors = {
    doctor:     "bg-blue-100 text-blue-700",
    nurse:      "bg-green-100 text-green-700",
    chw:        "bg-teal-100 text-teal-700",
    specialist: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[role] || "bg-gray-100 text-gray-600"}`}>
      {role}
    </span>
  );
}

function LiveEventCard({ event }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2, boxShadow: "0 16px 32px rgba(220,38,38,0.15)" }}
    >
      <Link to={`/public-health/events/${event._id}`}>
        <div className="rounded-2xl overflow-hidden border-2 border-red-400 bg-white shadow-lg">
          {/* Live header */}
          <div className="bg-red-600 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span className="text-white font-bold text-sm tracking-wide">LIVE NOW</span>
            </div>
            <span className="text-white/70 text-xs">Join & watch →</span>
          </div>
          {/* Content */}
          <div className="p-5">
            <h3 className="font-bold text-lg text-gray-900 leading-snug mb-2">{event.title}</h3>
            {event.description && (
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{event.description}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <Mic size={14} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{event.hostName}</p>
                <p className="text-xs text-gray-500">{event.organization}</p>
              </div>
              <RoleTag role={event.hostRole} />
            </div>
            <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              <Play size={16} className="text-red-600" fill="currentColor" />
              <span className="text-red-700 font-semibold text-sm">Watch Live Stream</span>
              <ChevronRight size={14} className="text-red-400 ml-auto" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function UpcomingEventCard({ event, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -2 }}
    >
      <Link to={`/public-health/events/${event._id}`}>
        <div className="glass-card hover:bg-white/70 transition h-full">
          {/* Date strip */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs text-blue-600 font-medium bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
              <Calendar size={12} /> Upcoming
            </div>
            <span className="text-xs text-gray-400">
              {new Date(event.scheduledAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-base text-gray-900 leading-snug mb-2">{event.title}</h3>
          {event.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{event.description}</p>
          )}

          {/* Host info */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Users size={13} className="text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{event.hostName}</p>
              <p className="text-xs text-gray-400 truncate">{event.organization}</p>
            </div>
            <RoleTag role={event.hostRole} />
          </div>

          {/* Countdown */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Starts in</p>
            <CountdownDisplay targetDate={event.scheduledAt} />
          </div>

          {/* Time */}
          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400 border-t border-gray-100/60 pt-3">
            <Clock size={11} />
            {new Date(event.scheduledAt).toLocaleString("en-GB", {
              weekday: "short", month: "short", day: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function PastEventCard({ event, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/public-health/events/${event._id}`}>
        <div className="glass-card hover:bg-white/70 transition opacity-80 hover:opacity-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs bg-gray-100 text-gray-500 border border-gray-200 px-2.5 py-1 rounded-full font-medium">
              Past
            </span>
            <span className="text-xs text-gray-400">
              {new Date(event.scheduledAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <h3 className="font-semibold text-sm text-gray-700 line-clamp-2 mb-2">{event.title}</h3>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Users size={11} />
            <span className="truncate">{event.hostName} · {event.organization}</span>
          </div>
          {event.replayUrl && (
            <div className="mt-2 flex items-center gap-1 text-xs text-primary">
              <Play size={11} /> Recording available
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

const STATUS_FILTERS = [
  { key: "all",      label: "All Events" },
  { key: "live",     label: "Live Now" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past",     label: "Past" },
];

const PublicHealthEvents = () => {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const [search, setSearch]   = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.get("/public-health/events?limit=100");
      setEvents(res.data.items || res.data || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchEvents();
    const s = connectSocket();
    joinPublicHealthHub();
    s.on("publicHealth:eventStarted", fetchEvents);
    s.on("publicHealth:eventEnded",   fetchEvents);
    s.on("publicHealth:eventUpdated", fetchEvents);
    return () => {
      leavePublicHealthHub();
      s.off("publicHealth:eventStarted", fetchEvents);
      s.off("publicHealth:eventEnded",   fetchEvents);
      s.off("publicHealth:eventUpdated", fetchEvents);
    };
  }, [fetchEvents]);

  const liveEvents     = events.filter(e => e.status === "live");
  const upcomingEvents = events.filter(e => e.status === "upcoming");
  const pastEvents     = events.filter(e => e.status === "past");

  const counts = {
    all:      events.length,
    live:     liveEvents.length,
    upcoming: upcomingEvents.length,
    past:     pastEvents.length,
  };

  const getFiltered = () => {
    let pool = filter === "all" ? events
      : filter === "live" ? liveEvents
      : filter === "upcoming" ? upcomingEvents
      : pastEvents;

    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.hostName?.toLowerCase().includes(q) ||
        e.organization?.toLowerCase().includes(q)
      );
    }
    return pool;
  };

  const filtered = getFiltered();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        <p className="text-gray-400 text-sm">Loading events…</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-8">

      {/* Header */}
      <div className="glass-card p-6 flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-gray-900">
              <Calendar className="text-primary" size={28} />
              Live Teaching Events
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Join Rwanda's health professionals for live Q&amp;A and medical education
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
            placeholder="Search events by title, host, or organization…"
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

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-sm border font-medium transition flex items-center gap-1.5 ${
                filter === key
                  ? key === "live"
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-primary text-white border-primary"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {key === "live" && <Radio size={12} />}
              {label}
              {counts[key] > 0 && (
                <span className={`text-xs ${filter === key ? "opacity-70" : "text-gray-400"}`}>
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Live section always shows when filter=all or live */}
      {(filter === "all" || filter === "live") && liveEvents.length > 0 && !search && (
        <AnimatePresence>
          <div className="space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-red-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              Streaming Live Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveEvents.map(e => <LiveEventCard key={e._id} event={e} />)}
            </div>
          </div>
        </AnimatePresence>
      )}

      {/* Upcoming section */}
      {(filter === "all" || filter === "upcoming") && (
        (() => {
          const items = search
            ? filtered.filter(e => e.status === "upcoming")
            : upcomingEvents;
          if (!items.length) return null;
          return (
            <div className="space-y-4">
              {filter === "all" && (
                <h2 className="font-bold text-lg flex items-center gap-2 text-blue-700">
                  <Calendar size={18} className="text-blue-500" />
                  Upcoming Events
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((e, i) => <UpcomingEventCard key={e._id} event={e} index={i} />)}
              </div>
            </div>
          );
        })()
      )}

      {/* Past section */}
      {(filter === "all" || filter === "past") && (
        (() => {
          const items = search
            ? filtered.filter(e => e.status === "past")
            : pastEvents;
          if (!items.length) return null;
          return (
            <div className="space-y-4">
              {filter === "all" && (
                <h2 className="font-bold text-base flex items-center gap-2 text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  Past Events
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((e, i) => <PastEventCard key={e._id} event={e} index={i} />)}
              </div>
            </div>
          );
        })()
      )}

      {/* Filtered search results (when filter=all and search active) */}
      {search && filtered.length === 0 && (
        <div className="glass-card p-16 text-center">
          <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No events match your search.</p>
          <button onClick={() => setSearch("")} className="mt-2 text-sm text-primary hover:underline">
            Clear search
          </button>
        </div>
      )}

      {/* Filtered single-status no results */}
      {!search && filter !== "all" && filtered.length === 0 && (
        <div className="glass-card p-16 text-center">
          <Radio size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">
            {filter === "live" ? "No events are live right now." :
             filter === "upcoming" ? "No upcoming events scheduled yet." :
             "No past events yet."}
          </p>
          <button onClick={() => setFilter("all")} className="mt-3 text-sm text-primary hover:underline">
            View all events
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default PublicHealthEvents;
