import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ title, children, className = '' }) => {
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {title && (
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          {title}
        </h3>
      )}
      <div className="text-gray-700 dark:text-gray-300">{children}</div>
    </motion.div>
  );
};

export default Card;
