import React, { useState, useEffect } from 'react';
import api from '../services/api';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const HealthTracker = () => {
  const [logs, setLogs] = useState([]);
  const [vitals, setVitals] = useState({ bp: '', temp: '', heartRate: '' });
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const lang = localStorage.getItem('lang') || 'en';

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/logs');
      setLogs(res.data.logs);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error fetching logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/logs', { vitals, notes });
      setVitals({ bp: '', temp: '', heartRate: '' });
      setNotes('');
      fetchLogs();  // Refresh list
    } catch (err) {
      setError(err.response?.data?.msg || 'Error adding log');
    }
  };

  // Chart data for BP trend (example)
  const chartData = {
    labels: logs.slice(0, 5).map(log => new Date(log.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Blood Pressure (Systolic)',
        data: logs.slice(0, 5).map(log => log.vitals.bp ? parseInt(log.vitals.bp.split('/')[0]) : 0),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  if (loading) return <div className="p-4">Loading logs...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Health Tracker</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          placeholder="BP (e.g., 120/80)"
          value={vitals.bp}
          onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Temperature (°C)"
          value={vitals.temp}
          onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Heart Rate (bpm)"
          value={vitals.heartRate}
          onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
          Add Log
        </button>
      </form>

      <h2 className="text-xl mb-2">Recent Logs</h2>
      <div className="space-y-2 mb-8">
        {logs.slice(0, 5).map((log) => (
          <div key={log._id} className="border p-2 rounded">
            <p>Date: {new Date(log.date).toLocaleDateString()}</p>
            <p>BP: {log.vitals.bp}</p>
            <p>Temp: {log.vitals.temp}°C</p>
            <p>Heart Rate: {log.vitals.heartRate} bpm</p>
            <p>Notes: {log.notes}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl mb-2">BP Trend</h2>
      <Line data={chartData} />
    </div>
  );
};

export default HealthTracker;