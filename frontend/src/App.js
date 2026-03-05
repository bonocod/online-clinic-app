// FILE: frontend/src/App.js
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DiseaseList from './pages/DiseaseList'
import HealthBehaviors from './pages/HealthBehaviors'
import Profile from './pages/Profile'
import DiseaseDetail from './pages/DiseaseDetail'
import ProfileSetup from './pages/ProfileSetup'
import Forum from './pages/Forum'
import Group from './pages/Group'
import CreatePost from './pages/CreatePost'
import HealthVideos from './pages/HealthVideos'
import Admin from './pages/Admin'
import Post from './pages/Post'
import Category from './pages/Category'
import DoctorConsole from './pages/professional/DoctorConsole'
import CHWConsole from './pages/professional/CHWConsole'
import Discussion from './pages/Discussion'

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
            <Route path="/diseases" element={<DiseaseList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/diseases/:id" element={<DiseaseDetail />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/health-behaviors" element={<HealthBehaviors />} />

            <Route path="/forum" element={<Forum />} />
            <Route path="/group/:id" element={<Group />} />
            <Route path="/group/:id/create-post" element={<CreatePost />} />

            <Route path="/category/:id/create-post" element={<CreatePost />} />
            <Route path="/category/:id" element={<Category />} />

            <Route path="/post/:id" element={<Post />} />
            <Route path="/discussion/:id" element={<Discussion />} />

            <Route path="/health-videos" element={<HealthVideos />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/professional/doctor" element={<DoctorConsole />} />
            <Route path="/professional/chw" element={<CHWConsole />} />
          </Routes>
        </div>
      </AnimatePresence>
    </Router>
  )
}

export default App