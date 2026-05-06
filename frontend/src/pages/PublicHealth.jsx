import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { connectSocket, joinPublicHealthHub, leavePublicHealthHub } from "../utils/socket";
import { HeartPulse, Calendar, BookOpen, Radio, AlertTriangle, Building2 } from "lucide-react";

const urgencyColor = (level) => {
  if (level === "critical") return "bg-red-100 text-red-700 border-red-200";
  if (level === "high") return "bg-orange-100 text-orange-700 border-orange-200";
  if (level === "normal") return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
};

const PublicHealth = () => {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const res = await api.get("/public-health/home");
        setHomeData(res.data);
      } catch (e) {
        console.error("Failed to load Public Health home");
      } finally {
        setLoading(false);
      }
    };
    fetchHome();

    connectSocket();
    joinPublicHealthHub();
    return () => {
      leavePublicHealthHub();
    };
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );

  const allNews = homeData?.latestNews || [];
  const urgentNews = homeData?.urgentNews || [];
  const liveEvents = homeData?.liveEvents || [];
  const upcomingEvents = homeData?.upcomingEvents || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-dark flex items-center justify-center gap-3">
          <HeartPulse className="text-primary" size={36} />
          Public Health Hub
        </h1>
        <p className="text-gray-600 mt-2">
          Official health updates • Alerts • Live teaching events
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link
          to="/public-health/news"
          className="glass-card p-6 text-center hover:bg-white/70 transition"
        >
          <BookOpen size={32} className="mx-auto text-primary mb-2" />
          <p className="font-bold text-xl">{allNews.length}</p>
          <p className="text-sm text-gray-600">Latest Updates</p>
        </Link>
        <div className="glass-card p-6 text-center">
          <AlertTriangle size={32} className="mx-auto text-red-500 mb-2" />
          <p className="font-bold text-xl">{urgentNews.length}</p>
          <p className="text-sm text-gray-600">Urgent Alerts</p>
        </div>
        <Link
          to="/public-health/events"
          className="glass-card p-6 text-center hover:bg-white/70 transition"
        >
          <Radio size={32} className="mx-auto text-primary mb-2" />
          <p className="font-bold text-xl">{liveEvents.length}</p>
          <p className="text-sm text-gray-600">Live Now</p>
        </Link>
      </div>

      {/* Urgent Alerts Banner */}
      {urgentNews.length > 0 && (
        <div className="glass-card p-6 border-l-4 border-red-500">
          <h2 className="font-bold text-xl mb-4 flex items-center gap-2 text-red-700">
            <AlertTriangle size={20} /> Urgent Health Alerts
          </h2>
          <div className="space-y-4">
            {urgentNews.slice(0, 3).map((n) => (
              <Link
                key={n._id}
                to="/public-health/news"
                className="block hover:bg-white/60 p-3 rounded-xl transition"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${urgencyColor(
                      n.urgencyLevel
                    )}`}
                  >
                    {n.urgencyLevel?.toUpperCase()}
                  </span>
                  {n.institutionName && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Building2 size={12} />
                      {n.institutionName}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{n.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Updates / News */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl flex items-center gap-2">
              <BookOpen className="text-primary" size={20} /> Latest Updates
            </h2>
            <Link to="/public-health/news" className="text-sm text-primary hover:underline">
              See all →
            </Link>
          </div>
          {allNews.length === 0 ? (
            <p className="text-gray-500 text-sm">No updates yet.</p>
          ) : (
            <div className="space-y-4">
              {allNews.slice(0, 4).map((n) => (
                <Link
                  key={n._id}
                  to="/public-health/news"
                  className="block hover:bg-white/70 p-3 rounded-xl transition"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${urgencyColor(
                        n.urgencyLevel
                      )}`}
                    >
                      {n.urgencyLevel?.toUpperCase()}
                    </span>
                    {n.institutionName && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Building2 size={11} />
                        {n.institutionName}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{n.summary}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Live & Upcoming Events */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl flex items-center gap-2">
              <Calendar className="text-primary" size={20} /> Teaching Events
            </h2>
            <Link to="/public-health/events" className="text-sm text-primary hover:underline">
              See all →
            </Link>
          </div>
          {liveEvents.length === 0 && upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">No events scheduled.</p>
          ) : (
            <div className="space-y-3">
              {liveEvents.map((e) => (
                <Link
                  key={e._id}
                  to={`/public-health/events/${e._id}`}
                  className="block bg-red-50 border border-red-200 p-3 rounded-xl hover:bg-red-100 transition"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                      ● LIVE NOW
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{e.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {e.hostName} · {e.organization}
                  </p>
                </Link>
              ))}
              {upcomingEvents.slice(0, 3).map((e) => (
                <Link
                  key={e._id}
                  to={`/public-health/events/${e._id}`}
                  className="block hover:bg-white/70 p-3 rounded-xl transition"
                >
                  <p className="font-semibold text-gray-900 text-sm">{e.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(e.scheduledAt).toLocaleString()} · {e.organization}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/public-health/news" className="btn-primary flex items-center gap-2">
          <BookOpen size={16} /> Browse Updates
        </Link>
        <Link to="/public-health/events" className="btn-primary flex items-center gap-2">
          <Radio size={16} /> Join Live Events
        </Link>
        <Link to="/public-health/saved" className="btn-primary flex items-center gap-2">
          View Saved Items
        </Link>
      </div>
    </motion.div>
  );
};

export default PublicHealth;
