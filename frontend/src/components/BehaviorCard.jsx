import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Shield } from 'lucide-react';
import api from '../services/api';

const BehaviorCard = ({ behavior, language = 'en' }) => {
  const [isActive, setIsActive] = useState(false);

  const title = behavior.title[language] || behavior.title.en;
  const desc = behavior.description[language] || behavior.description.en;
  const isGood = behavior.type === 'good';

  const toggleStatus = async () => {
    setIsActive(!isActive);
    // Optional: Save to backend later
    try {
      await api.post('/users/behavior-status', {
        behaviorId: behavior._id,
        status: isActive ? 'inactive' : 'active'
      });
    } catch (err) {
      console.log("Status updated (demo)");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      className="glass-card overflow-hidden group"
    >
      {/* Image */}
      <div className="h-48 overflow-hidden">
        <img
          src={behavior.imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Health'; }}
        />
      </div>

      <div className="p-6">
        <div className="text-4xl mb-3 text-center">{behavior.emoji}</div>
        
        <h3 className="text-xl font-bold text-center mb-3 text-dark">{title}</h3>
        
        <p className="text-gray-600 text-sm leading-relaxed text-center mb-6 line-clamp-3">
          {desc}
        </p>

        <button
          onClick={toggleStatus}
          className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
            isActive 
              ? isGood 
                ? 'bg-green-500 text-white' 
                : 'bg-orange-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {isActive ? (
            <>
              {isGood ? <CheckCircle2 size={20} /> : <Shield size={20} />}
              {isGood ? "I Practice This" : "I'm Avoiding This"}
            </>
          ) : (
            <>
              {isGood ? "I Practice This" : "I Want to Avoid This"}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default BehaviorCard;