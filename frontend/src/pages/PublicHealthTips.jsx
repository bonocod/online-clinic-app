import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";

const PublicHealthTips = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await api.get("/public-health/tips");
        setTips(res.data.items || res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, []);

  if (loading) return <p className="text-center py-10">Loading tips...</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-3xl font-bold">Micro-Education Tips</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tips.map((tip) => (
          <div key={tip._id} className="glass-card p-6">
            <span className="text-xs uppercase tracking-widest text-primary">{tip.type.replace('_', ' ')}</span>
            <h3 className="font-bold text-lg mt-3">{tip.title}</h3>
            <p className="text-gray-700 mt-2 line-clamp-4">{tip.shortText}</p>
            {tip.imageUrl && <img src={tip.imageUrl} alt="" className="mt-4 rounded-xl" />}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PublicHealthTips;