import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
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
import ProfileSetup from './pages/ProfileSetup';
import MentalHealth from './pages/MentalHealth';
import PregnancyManager from './pages/PregnancyManager';
import HealthBehaviors from './pages/HealthBehaviors';
import MyDiseases from './pages/MyDiseases';
import Forum from './pages/Forum';
import Group from './pages/Group';
import Post from './pages/Post';
function App() {
  return (
    <Router>
      <Navbar />
      <AnimatePresence mode="wait">
        <div className="container mx-auto p-4 max-w-7xl">
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
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/mental-health" element={<MentalHealth />} />
            <Route path="/pregnancy-manager" element={<PregnancyManager />} />
            <Route path="/health-behaviors" element={<HealthBehaviors />} />
            <Route path="/my-diseases" element={<MyDiseases />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/group/:id" element={<Group />} />
            <Route path="/post/:id" element={<Post />} />
          </Routes>
        </div>
      </AnimatePresence>
    </Router>
  );
}
export default App;