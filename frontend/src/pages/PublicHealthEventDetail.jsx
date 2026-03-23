import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { connectSocket, joinPublicHealthEvent, leavePublicHealthEvent } from "../utils/socket";
import { Play, Calendar, Users } from "lucide-react";

const PublicHealthEventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/public-health/events/${id}`);
        setEvent(res.data.event);
        setQuestions(res.data.approvedQuestions || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();

    const s = connectSocket();
    joinPublicHealthEvent(id);
    return () => leavePublicHealthEvent(id);
  }, [id]);

  if (loading) return <p className="text-center py-10">Loading event...</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <Link to="/public-health/events" className="text-primary flex items-center gap-2">← Back to Events</Link>
      
      <div className="glass-card p-8">
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <p className="text-gray-600 mt-2">{event.hostName} • {event.organization}</p>
        <p className="text-xs text-gray-500 mt-4">{new Date(event.scheduledAt).toLocaleString()} – {new Date(event.endAt).toLocaleString()}</p>
        
        {event.status === "live" && <span className="inline-block mt-4 bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm">LIVE NOW</span>}
      </div>

      <div className="glass-card p-6">
        <h2 className="font-bold text-xl mb-4">Moderated Questions</h2>
        {questions.length === 0 ? (
          <p className="text-gray-600">No approved questions yet.</p>
        ) : (
          questions.map((q) => (
            <div key={q._id} className="border-l-4 border-primary pl-4 mb-6">
              <p className="text-sm text-gray-600">{q.askedBy?.name || "Anonymous"}</p>
              <p className="font-medium mt-1">{q.questionText}</p>
              {q.answerText && <p className="mt-3 text-green-700">Answer: {q.answerText}</p>}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default PublicHealthEventDetail;