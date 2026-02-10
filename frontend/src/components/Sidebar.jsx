import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-white dark:bg-gray-800 min-h-screen shadow-md"
    >
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {t('sidebar.title')}
        </h2>
        <ul className="mt-6 space-y-4">
          <li>
            <Link
              to="/dashboard"
              className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              {t('sidebar.dashboard')}
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              {t('sidebar.profile')}
            </Link>
          </li>
          <li>
            <Link
              to="/diseases"
              className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              {t('sidebar.diseases')}
            </Link>
          </li>
          <li>
            <Link
              to="/symptom-checker"
              className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              {t('sidebar.symptomChecker')}
            </Link>
          </li>
        </ul>
      </div>
    </motion.div>
  );
};

export default Sidebar;
