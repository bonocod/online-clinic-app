import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { connectSocket, joinPublicHealthHub, leavePublicHealthHub } from "../utils/socket";
import { HeartPulse, Calendar, BookOpen, Users, Bookmark } from "lucide-react";

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

    const s = connectSocket();
    joinPublicHealthHub();
    return () => {
      leavePublicHealthHub();
    };
  }, []);

  if (loading) return <p className="text-center py-10">Loading Public Health Hub...</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-dark flex items-center justify-center gap-3">
          <HeartPulse className="text-primary" size={36} />
          Public Health Hub
        </h1>
        <p className="text-gray-600 mt-2">Official health information • Campaigns • Education • Live events</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/public-health/campaigns" className="glass-card p-6 text-center hover:bg-white/70 transition">
          <Calendar size={32} className="mx-auto text-primary mb-2" />
          <p className="font-bold text-xl">{homeData?.campaigns?.length || 0}</p>
          <p className="text-sm text-gray-600">Active Campaigns</p>
        </Link>
        <Link to="/public-health/news" className="glass-card p-6 text-center hover:bg-white/70 transition">
          <BookOpen size={32} className="mx-auto text-primary mb-2" />
          <p className="font-bold text-xl">{homeData?.latestNews?.length || 0}</p>
          <p className="text-sm text-gray-600">Latest News</p>
        </Link>
        <Link to="/public-health/tips" className="glass-card p-6 text-center hover:bg-white/70 transition">
          <Users size={32} className="mx-auto text-primary mb-2" />
          <p className="font-bold text-xl">{homeData?.featuredTips?.length || 0}</p>
          <p className="text-sm text-gray-600">Health Tips</p>
        </Link>
        <Link to="/public-health/events" className="glass-card p-6 text-center hover:bg-white/70 transition">
          <HeartPulse size={32} className="mx-auto text-primary mb-2" />
          <p className="font-bold text-xl">{homeData?.liveEvents?.length || 0}</p>
          <p className="text-sm text-gray-600">Live Events</p>
        </Link>
      </div>

      {/* Featured Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Campaigns */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Calendar className="text-primary" /> Featured Campaigns
          </h2>
          {homeData?.campaigns?.slice(0, 3).map((c) => (
            <Link key={c._id} to={`/public-health/campaigns`} className="block mb-4 hover:bg-white/70 p-3 rounded-xl transition">
              <p className="font-semibold">{c.title}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{c.summary}</p>
            </Link>
          ))}
        </div>

        {/* Urgent News */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
            <BookOpen className="text-red-500" /> Urgent News
          </h2>
          {homeData?.urgentNews?.slice(0, 3).map((n) => (
            <Link key={n._id} to={`/public-health/news`} className="block mb-4 hover:bg-white/70 p-3 rounded-xl transition">
              <p className="font-semibold text-red-700">{n.title}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{n.summary}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-6">
        <Link to="/public-health/campaigns" className="btn-primary flex items-center gap-2">
          Browse Campaigns
        </Link>
        <Link to="/public-health/events" className="btn-primary flex items-center gap-2">
          Join Live Events
        </Link>
        <Link to="/public-health/saved" className="btn-primary flex items-center gap-2">
          My Saved Items
        </Link>
      </div>
    </motion.div>
  );
};

export default PublicHealth;