import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SymptomChecker from './pages/SymptomChecker'
import DiseaseList from './pages/DiseaseList'
import HealthTracker from './pages/HealthTracker'
import Profile from './pages/Profile'
import DiseaseDetail from './pages/DiseaseDetail'
import SpecialCases from './pages/SpecialCases';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/symptom-checker" element={<SymptomChecker />} />
          <Route path="/diseases" element={<DiseaseList />} />
          <Route path="/health-tracker" element={<HealthTracker />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/diseases/:id" element={<DiseaseDetail />} />
          <Route path="/special-cases" element={<SpecialCases />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
