import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";

const PublicHealthNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get("/public-health/news");
        setNews(res.data.items || res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) return <p className="text-center py-10">Loading news...</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-3xl font-bold">Official Health News</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {news.map((item) => (
          <div key={item._id} className="glass-card p-6">
            <div className="flex justify-between items-center">
              <span className={`text-xs px-3 py-1 rounded-full ${item.urgencyLevel === 'critical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                {item.urgencyLevel.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">{new Date(item.publishedAt).toLocaleDateString()}</span>
            </div>
            <h3 className="font-bold text-xl mt-3">{item.title}</h3>
            <p className="text-sm text-gray-600 mt-2 line-clamp-4">{item.summary}</p>
            <p className="text-xs text-gray-500 mt-4">Source: {item.sourceName}</p>
            <Link to={`/public-health`} className="text-primary mt-6 inline-block">Read full update →</Link>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PublicHealthNews;