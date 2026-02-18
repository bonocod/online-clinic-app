import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import api from "../services/api";
import {
  Activity,
  AlertTriangle,
  Shield,
  HeartPulse,
  Pill,
  BookOpen,
  MessageCircle,
  Heart,
  CornerDownLeft,
} from "lucide-react";

const DiseaseDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [disease, setDisease] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tipsList, setTipsList] = useState([]);
  const [newTip, setNewTip] = useState('');
  const [tipError, setTipError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [replies, setReplies] = useState({});  // { tipId: [replies] }
  const [newReply, setNewReply] = useState({});  // { tipId: 'text' }

  useEffect(() => {
    const fetchDisease = async () => {
      try {
        const res = await api.get(`/diseases/${id}`);
        setDisease(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || "Error fetching disease");
      } finally {
        setLoading(false);
      }
    };
    fetchDisease();
  }, [id]);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await api.get(`/feedback/${id}`);
        setTipsList(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTips();
  }, [id]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get('/auth/profile');
        setCurrentUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleAddTip = async (e) => {
    e.preventDefault();
    setTipError('');

    if (!newTip.trim()) {
      setTipError('Please share your tip');
      return;
    }

    try {
      const res = await api.post(`/feedback/${id}`, { comment: newTip });
      setTipsList(prev => [res.data, ...prev]);
      setNewTip('');
    } catch (err) {
      setTipError(err.response?.data?.msg || 'Failed to share tip');
    }
  };

  const handleLikeTip = async (tipId) => {
    try {
      await api.post(`/feedback/${tipId}/like`);
      setTipsList(prev => prev.map(tip => 
        tip._id === tipId ? { ...tip, helpful: (tip.helpful || 0) + 1 } : tip
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReply = async (tipId) => {
    const replyText = newReply[tipId];
    if (!replyText?.trim()) return;

    try {
      const res = await api.post(`/feedback/${tipId}/reply`, { comment: replyText });
      setReplies(prev => ({
        ...prev,
        [tipId]: [...(prev[tipId] || []), res.data]
      }));
      setNewReply(prev => ({ ...prev, [tipId]: '' }));
    } catch (err) {
      console.error(err);
    }
  };

  // Simple relative time function
  const timeAgo = (date) => {
    const now = new Date();
    const seconds = Math.floor((now - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} years ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;
    return `${seconds} seconds ago`;
  };

  // Helper for normal translated fields (causes, effects, etc.)
  const getTranslated = (field) => {
    return typeof field === "object" && field !== null
      ? field[i18n.language] || field.en || ""
      : field || "";
  };

  // Special handler for symptoms (now multilingual array)
  const getSymptoms = (symptomsObj) => {
    if (!symptomsObj) return "";
    const lang = i18n.language;
    const list = symptomsObj[lang] || symptomsObj.en || [];
    return list.join(", ");
  };

  const sections = [
    {
      title: "symptoms",
      icon: Activity,
      content: getSymptoms,
    },
    { title: "causes", icon: AlertTriangle, content: getTranslated },
    { title: "effects", icon: HeartPulse, content: getTranslated },
    { title: "prevention", icon: Shield, content: getTranslated },
    { title: "behaviorGuidelines", icon: BookOpen, content: getTranslated },
    { title: "treatment", icon: Pill, content: getTranslated },
  ];

  if (loading)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 text-center"
      >
        Loading disease...
      </motion.div>
    );

  if (error)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 text-red-500 text-center"
      >
        {error}
      </motion.div>
    );

  if (!disease)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 text-center"
      >
        No disease found
      </motion.div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-3xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-dark">
        {getTranslated(disease.name)}
      </h1>

      <div className="space-y-6">
        {sections.map((sec, i) => (
          <motion.section
            key={sec.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card"
          >
            <h2 className="text-xl font-bold mb-3 flex items-center text-secondary">
              <sec.icon className="mr-2" />
              {t(`diseaseDetail.${sec.title}`)}
            </h2>
            <p className="text-gray-700">{sec.content(disease[sec.title])}</p>
          </motion.section>
        ))}
      </div>
      {/* Severity Badge */}
      <div className="flex justify-center mb-8">
        <span
          className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
            disease.severity === "mild"
              ? "bg-green-100 text-green-700"
              : disease.severity === "moderate"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {t(`diseaseSeverity.${disease.severity || "moderate"}`)}
        </span>
      </div>

      {/* Related Diseases */}
      {disease.relatedDiseases && disease.relatedDiseases.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card mt-10"
        >
          <h2 className="text-xl font-bold mb-4">Related Diseases</h2>
          <div className="flex flex-wrap gap-3">
            {disease.relatedDiseases.map((rel) => (
              <Link
                key={rel._id}
                to={`/diseases/${rel._id}`}
                className="bg-white px-4 py-2 rounded-full text-sm border hover:border-primary transition-colors"
              >
                {rel.name?.[i18n.language] || rel.name?.en}
              </Link>
            ))}
          </div>
        </motion.section>
      )}
      {/* Tips/Experiences Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card mt-10"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center text-secondary">
          <MessageCircle className="mr-2" />
          {t("diseaseDetail.tipsTitle") ||
            "Additional Tips, Experiences & Knowledge from Users"}
        </h2>

        {/* Tips List */}
        <div className="space-y-6 mb-6">
          {tipsList.map((tip) => (
            <motion.div 
              key={tip._id} 
              className="border-b pb-4 hover:bg-neutral/50 transition-colors rounded-lg p-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {tip.user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="font-medium mr-2">
                      {tip.user?._id === currentUser?._id ? 'You' : tip.user?.name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-500">
                      • {timeAgo(tip.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{tip.comment}</p>
                  {/* Engagement */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <button 
                      onClick={() => handleLikeTip(tip._id)}
                      className="flex items-center hover:text-primary transition-colors"
                    >
                      <Heart className="w-4 h-4 mr-1" /> {t('diseaseDetail.helpful') || 'Helpful'} ({tip.helpful || 0})
                    </button>
                    <button 
                      onClick={() => {
                        // Toggle reply input for this tip
                        setNewReply(prev => ({ ...prev, [tip._id]: prev[tip._id] ? '' : ' ' }));
                      }}
                      className="flex items-center hover:text-primary transition-colors"
                    >
                      <CornerDownLeft className="w-4 h-4 mr-1" /> {t('diseaseDetail.reply') || 'Reply'}
                    </button>
                  </div>

                  {/* Replies */}
                  {replies[tip._id] && replies[tip._id].length > 0 && (
                    <div className="mt-4 space-y-3">
                      {replies[tip._id].map((reply) => (
                        <div key={reply._id} className="ml-8 text-sm text-gray-600">
                          <span className="font-medium">{reply.user.name || 'Anonymous'}: </span>{reply.comment}
                          <p className="text-xs text-gray-400 mt-1">{timeAgo(reply.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Reply Input */}
                  {newReply[tip._id] && (
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleAddReply(tip._id); }}
                      className="mt-4 ml-8 flex gap-2"
                    >
                      <input
                        value={newReply[tip._id]}
                        onChange={(e) => setNewReply(prev => ({ ...prev, [tip._id]: e.target.value }))}
                        placeholder={t('diseaseDetail.addReply') || "Add your reply..."}
                        className="input-field flex-1 text-sm py-2"
                      />
                      <button type="submit" className="btn-primary px-4 py-2 text-sm">
                        {t('diseaseDetail.submitReply') || "Reply"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {tipsList.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500"
            >
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">{t('diseaseDetail.noTipsTitle') || "No tips shared yet"}</p>
              <p>{t('diseaseDetail.noTipsMessage') || "Be the first to share your experience and help others!"}</p>
            </motion.div>
          )}
        </div>

        {/* Add Tip Form */}
        <form onSubmit={handleAddTip} className="space-y-4">
          {tipError && <p className="text-red-500">{tipError}</p>}
          <textarea
            value={newTip}
            onChange={(e) => setNewTip(e.target.value)}
            placeholder={
              t("diseaseDetail.tipsPlaceholder") ||
              "Share your tip, personal experience, or additional knowledge about this disease..."
            }
            className="input-field min-h-[120px]"
            required
          />
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5" />
            {t("diseaseDetail.submitTip") || "Share Your Tip"}
          </button>
        </form>
      </motion.section>
    </motion.div>
  );
};

export default DiseaseDetail;