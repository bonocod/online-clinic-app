import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { Calendar, Bookmark } from "lucide-react";

const PublicHealthCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await api.get("/public-health/campaigns");
        setCampaigns(res.data.items || res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  if (loading) return <p className="text-center py-10">Loading campaigns...</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-3xl font-bold">Public Health Campaigns</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((c) => (
          <div key={c._id} className="glass-card p-6">
            <div className="flex justify-between">
              <h3 className="font-bold text-xl">{c.title}</h3>
              {c.isUrgent && <span className="text-red-600 text-xs font-medium">URGENT</span>}
            </div>
            <p className="text-sm text-gray-600 mt-2 line-clamp-3">{c.summary}</p>
            <div className="mt-4 flex gap-4 text-xs text-gray-500">
              <span>By {c.organization}</span>
              <span>{new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()}</span>
            </div>
            <Link to={`/public-health`} className="btn-primary mt-6 inline-block">
              Learn More & Save Reminder
            </Link>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PublicHealthCampaigns;