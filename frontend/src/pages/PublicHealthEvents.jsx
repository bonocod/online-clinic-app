import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { connectSocket, joinPublicHealthHub, leavePublicHealthHub } from "../utils/socket";
import { Calendar, Play, Radio, Clock, Users } from "lucide-react";

const statusBadge = (status) => {
  if (status === "live")
    return (
      <span className="flex items-center gap-1 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">
        <Radio size={12} /> LIVE
      </span>
    );
  if (status === "upcoming")
    return (
      <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
        <Clock size={12} /> Upcoming
      </span>
    );
  if (status === "past")
    return (
      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border">
        Past
      </span>
    );
  return null;
};

const PublicHealthEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchEvents = async () => {
    try {
      const res = await api.get("/public-health/events?limit=50");
      setEvents(res.data.items || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    connectSocket();
    joinPublicHealthHub();

    const s = connectSocket();
    s.on("publicHealth:eventStarted", fetchEvents);
    s.on("publicHealth:eventEnded", fetchEvents);
    s.on("publicHealth:eventUpdated", fetchEvents);

    return () => {
      leavePublicHealthHub();
      s.off("publicHealth:eventStarted", fetchEvents);
      s.off("publicHealth:eventEnded", fetchEvents);
      s.off("publicHealth:eventUpdated", fetchEvents);
    };
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );

  const filtered =
    filter === "all" ? events : events.filter((e) => e.status === filter);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="text-primary" />
            Live Teaching Events
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Join health professionals for live Q&amp;A sessions
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "live", "upcoming", "past"].map((f) => (
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
          No events found.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((event) => (
          <Link
            key={event._id}
            to={`/public-health/events/${event._id}`}
            className={`glass-card p-6 hover:bg-white/70 transition flex flex-col gap-3 ${
              event.status === "live" ? "border-2 border-red-400" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-lg text-gray-900 flex-1 leading-snug">
                {event.title}
              </h3>
              {statusBadge(event.status)}
            </div>

            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Users size={14} />
              <span>
                {event.hostName} · {event.organization}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar size={13} />
              <span>{new Date(event.scheduledAt).toLocaleString()}</span>
            </div>

            {event.status === "live" && (
              <div className="flex items-center gap-2 mt-1 text-red-600 text-sm font-medium">
                <Play size={14} fill="currentColor" />
                Watch live stream now
              </div>
            )}
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default PublicHealthEvents;
