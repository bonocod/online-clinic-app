// frontend/src/pages/DiseaseDetail.jsx
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
  Film
} from "lucide-react";

const DiseaseDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [disease, setDisease] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisease = async () => {
      try {
        const res = await api.get(`/diseases/${id}`);
        setDisease(res.data);
      } catch (err) {
        setError(t('diseaseDetail.errorFetch') || err.response?.data?.msg || "Error fetching disease");
      } finally {
        setLoading(false);
      }
    };
    fetchDisease();
  }, [id, t]);

  const getTranslated = (field) => {
    return typeof field === "object" && field !== null
      ? field[i18n.language] || field.en || ""
      : field || "";
  };

  const getSymptoms = (symptomsObj) => {
    if (!symptomsObj) return "";
    const lang = i18n.language;
    const list = symptomsObj[lang] || symptomsObj.en || [];
    return list.join(", ");
  };

  const sections = [
    { title: "symptoms", icon: Activity, content: getSymptoms },
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
        className="flex items-center justify-center min-h-[60vh] text-gray-500 text-lg"
      >
        <Film className="animate-spin mr-3" size={28} />
        {t('diseaseDetail.loading') || "Loading disease..."}
      </motion.div>
    );

  if (error)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[60vh] text-red-500 text-lg"
      >
        <AlertTriangle className="mr-3" size={28} />
        {error}
      </motion.div>
    );

  if (!disease)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[60vh] text-gray-500"
      >
        {t('diseaseDetail.noDisease') || "No disease found"}
      </motion.div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-4 md:px-8 py-10 max-w-6xl mx-auto"
    >
      {/* HEADER */}
      <div className="relative h-72 md:h-[420px] rounded-3xl overflow-hidden shadow-2xl mb-12">
        <img
          src={disease.imageUrl}
          alt={getTranslated(disease.name)}
          className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-700"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute bottom-8 left-8">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4">
            {getTranslated(disease.name)}
          </h1>

          <span
            className={`px-5 py-2 rounded-full text-sm font-semibold backdrop-blur-md border ${
              disease.severity === "mild"
                ? "bg-green-500/20 text-green-200 border-green-400/40"
                : disease.severity === "moderate"
                  ? "bg-yellow-500/20 text-yellow-200 border-yellow-400/40"
                  : "bg-red-500/20 text-red-200 border-red-400/40"
            }`}
          >
            {t(`diseaseSeverity.${disease.severity || "moderate"}`)}
          </span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* CONTENT SECTIONS */}
        <div className="lg:col-span-2 space-y-10">
          {sections.map((sec, i) => (
            <motion.section
              key={sec.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <h2 className="text-2xl font-bold mb-5 flex items-center text-gray-800">
                <sec.icon className="mr-3 text-blue-600" size={26} />
                {t(`diseaseDetail.${sec.title}`)}
              </h2>

              <p className="text-gray-600 leading-relaxed text-lg">
                {sec.content(disease[sec.title])}
              </p>
            </motion.section>
          ))}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-10">
          {/* VIDEO */}
          {disease.videoUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-28"
            >
              <h2 className="text-xl font-bold mb-5 flex items-center text-gray-800">
                <Film className="mr-3 text-blue-600" size={24} />
                Educational Video
              </h2>

              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
                <video
                  src={disease.videoUrl}
                  controls
                  poster={disease.imageUrl}
                  className="w-full h-full object-cover"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          )}

          {/* RELATED DISEASES */}
          {disease.relatedDiseases && disease.relatedDiseases.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-gray-100"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                <Activity className="mr-3 text-blue-600" size={22} />
                Related Diseases
              </h2>

              <div className="space-y-4">
                {disease.relatedDiseases.map((rel) => (
                  <Link
                    key={rel._id}
                    to={`/diseases/${rel._id}`}
                    className="group flex items-center p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <HeartPulse
                      className="mr-3 text-blue-500 group-hover:scale-110 transition-transform"
                      size={18}
                    />
                    <span className="text-gray-700 group-hover:text-blue-700 font-medium">
                      {rel.name?.[i18n.language] || rel.name?.en}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DiseaseDetail;