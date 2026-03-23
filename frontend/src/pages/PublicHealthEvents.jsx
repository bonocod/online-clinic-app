import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { Calendar, Play } from "lucide-react";

const PublicHealthEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/public-health/events");
        setEvents(res.data.items || res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <p className="text-center py-10">Loading events...</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-3xl font-bold">Live Teaching Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <Link key={event._id} to={`/public-health/events/${event._id}`} className="glass-card p-6 hover:bg-white/70 transition">
            <div className="flex justify-between">
              <h3 className="font-bold text-xl">{event.title}</h3>
              {event.status === "live" && <span className="text-red-600 text-xs font-medium flex items-center gap-1"><Play size={14} /> LIVE</span>}
            </div>
            <p className="text-sm text-gray-600 mt-2">{event.hostName} • {event.organization}</p>
            <p className="text-xs text-gray-500 mt-4">{new Date(event.scheduledAt).toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default PublicHealthEvents;