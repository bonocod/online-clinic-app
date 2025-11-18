import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const HealthChart = ({ logs }) => {
  const { t } = useTranslation();

  const chartData = {
    labels: logs.slice(0, 7).map(log => new Date(log.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Systolic BP',
        data: logs.slice(0, 7).map(log => log.vitals.bp ? parseInt(log.vitals.bp.split('/')[0]) : 0),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Diastolic BP',
        data: logs.slice(0, 7).map(log => log.vitals.bp ? parseInt(log.vitals.bp.split('/')[1]) : 0),
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Heart Rate',
        data: logs.slice(0, 7).map(log => log.vitals.heartRate || 0),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#1F2937',
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: t('healthTracker.bpTrend'),
        color: '#1F2937',
        font: {
          size: 18,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 40,
        max: 180,
        title: {
          display: true,
          text: 'Value',
          color: '#1F2937',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
          color: '#1F2937',
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card"
    >
      <Line data={chartData} options={options} />
    </motion.div>
  );
};

export default HealthChart;