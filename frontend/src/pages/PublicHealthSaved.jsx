import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import { Bookmark, Calendar } from "lucide-react";

const PublicHealthSaved = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await api.get("/public-health/saved-items");
        setSavedItems(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  if (loading) return <p className="text-center py-10">Loading saved items...</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-3xl font-bold">My Saved Items & Reminders</h1>
      {savedItems.length === 0 ? (
        <p className="text-gray-600">No saved items yet. Save campaigns, news, tips or events to get reminders.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedItems.map((item) => (
            <div key={item._id} className="glass-card p-6">
              <div className="flex justify-between">
                <h3 className="font-bold">{item.item?.title}</h3>
                <Bookmark className="text-primary" />
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.item?.summary || item.item?.shortText}</p>
              {item.reminderDateTime && (
                <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
                  <Calendar size={14} /> Reminder: {new Date(item.reminderDateTime).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PublicHealthSaved;