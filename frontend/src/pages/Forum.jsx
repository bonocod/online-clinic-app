//# FILE: frontend/src/pages/Forum.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Users, TrendingUp, Mic, Trophy, Stethoscope, Users as CircleIcon, Grid, Star, BarChart, ChevronRight, AlertCircle } from 'lucide-react';

const Forum = () => {
  const { t } = useTranslation();
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]); // For MVP static/empty
  const [challenges, setChallenges] = useState([]); // For MVP static/empty
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [circles, setCircles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [insights, setInsights] = useState({}); // For MVP static
  const [myCircles, setMyCircles] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resProfile = await api.get('/auth/profile');
        setUser(resProfile.data);
      } catch (err) {
        console.error('Failed to load profile', err);
      }

      try {
        // Fetch trending
        const resTrending = await api.get('/forum/posts/trending');
        setTrendingPosts(Array.isArray(resTrending.data) ? resTrending.data : []);
      } catch (err) {
        console.error('Failed to load trending posts', err);
      }

      try {
        // Fetch categories
        const resCats = await api.get('/forum/categories');
        setCategories(Array.isArray(resCats.data) ? resCats.data : []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }

      try {
        // Fetch groups/circles
        const resGroups = await api.get('/forum/groups');
        const allGroups = Array.isArray(resGroups.data) ? resGroups.data : [];
        setCircles(allGroups.filter(g => g.type === 'circle'));
        setMyCircles(allGroups.filter(g => g.type === 'circle' && g.members.some(m => m.toString() === user?._id)));
      } catch (err) {
        console.error('Failed to load groups', err);
      }

      try {
        // Fetch top contributors
        const resTop = await api.get('/users/top');
        setTopContributors(Array.isArray(resTop.data) ? resTop.data : []);
      } catch (err) {
        console.error('Failed to load top contributors', err);
        setTopContributors([]); // Set to empty if fails
      }

      // Insights mock for MVP
      setInsights({
        discussedCategories: ['Mental Health', 'Nutrition'],
        risingSymptoms: ['fatigue', 'headache'],
        activeChallenges: 2,
        activeCircles: 5
      });

      try {
        // Unanswered questions: posts with type 'question' no comments from doctors
        // For MVP, fetch recent questions
        const resQuestions = await api.get('/forum/posts?type=question&sort=recent&limit=3');
        setUnansweredQuestions(Array.isArray(resQuestions.data) ? resQuestions.data.filter(p => p.comments.length === 0) : []);
      } catch (err) {
        console.error('Failed to load questions', err);
      }

      // Live sessions and challenges static for MVP
      setLiveSessions([{ title: 'Q&A on Nutrition', doctor: 'Dr. Smith', active: true }]);
      setChallenges([{ name: '30 Day Fitness', progress: 50, participants: 120, duration: '30 days' }]);

      setLoading(false);
    };
    fetchData();
  }, [user?._id]); // Re-run if user changes

  if (loading) return <p className="text-center text-lg py-10">Loading...</p>;
  if (error) return <p className="text-red-500 text-center flex items-center justify-center py-10"><AlertCircle className="mr-2" />{error}</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      {/* Top Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trending Topics */}
        <div className="glass-card col-span-1 md:col-span-1">
          <h2 className="text-xl font-bold mb-4 flex items-center"><TrendingUp className="mr-2" />Trending Topics</h2>
          <ul className="space-y-4">
            {Array.isArray(trendingPosts) && trendingPosts.map(post => (
              <li key={post._id} className="border-b pb-2">
                <Link to={`/post/${post._id}`} className="font-medium hover:text-primary">{post.title}</Link>
                <p className="text-sm text-gray-600 flex items-center gap-4">
                  <span>{post.category}</span>
                  <span>{post.comments} replies</span>
                  <span>{post.upvotes} upvotes</span>
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Live Q&A */}
        <div className="glass-card col-span-1 md:col-span-1">
          <h2 className="text-xl font-bold mb-4 flex items-center"><Mic className="mr-2" />Live Q&A</h2>
          {Array.isArray(liveSessions) && liveSessions.map(session => (
            <div key={session.title} className="mb-4">
              <h3 className="font-medium">{session.title}</h3>
              <p className="text-sm">By {session.doctor}</p>
              <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">Live</span>
            </div>
          ))}
        </div>

        {/* Ongoing Challenge */}
        <div className="glass-card col-span-1 md:col-span-1">
          <h2 className="text-xl font-bold mb-4 flex items-center"><Trophy className="mr-2" />Health Challenge</h2>
          {Array.isArray(challenges) && challenges.map(ch => (
            <div key={ch.name}>
              <h3 className="font-medium">{ch.name}</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${ch.progress}%` }}></div>
              </div>
              <p className="text-sm">{ch.participants} participants • {ch.duration}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Middle Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ask a Professional */}
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center"><Stethoscope className="mr-2" />Ask a Professional</h2>
          <ul className="space-y-2 mb-4">
            {Array.isArray(unansweredQuestions) && unansweredQuestions.map(q => (
              <li key={q._id}>{q.title}</li>
            ))}
          </ul>
          <Link to="/create-question" className="btn-primary block text-center">Create New Question</Link>
        </div>

        {/* Support Circles */}
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center"><CircleIcon className="mr-2" />Support Circles</h2>
          {Array.isArray(circles) && circles.map(circle => (
            <div key={circle._id} className="mb-4">
              <h3 className="font-medium">{circle.name}</h3>
              <p className="text-sm">{circle.members.length} members</p>
              <button className="btn-primary mt-2">Join</button>
            </div>
          ))}
        </div>

        {/* Category Grid */}
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center"><Grid className="mr-2" />Categories</h2>
          <div className="grid grid-cols-2 gap-4">
            {Array.isArray(categories) && categories.map(cat => (
              <Link key={cat._id} to={`/category/${cat._id}`} className="bg-neutral p-4 rounded-xl text-center">
                <p className="font-medium">{cat.name}</p>
                <p className="text-sm">{cat.description}</p>
                <button className="text-primary mt-2">Follow</button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Contributors */}
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center"><Star className="mr-2" />Top Contributors</h2>
          {Array.isArray(topContributors) && topContributors.length > 0 ? (
            topContributors.map(contrib => (
              <div key={contrib._id} className="flex items-center mb-4">
                <img src={`https://ui-avatars.com/api/?name=${contrib.name}`} alt="avatar" className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <p className="font-medium">{contrib.name}</p>
                  <p className="text-sm">{contrib.role}</p>
                </div>
                <p className="ml-auto">{contrib.reputation} pts</p>
              </div>
            ))
          ) : (
            <p>No contributors yet</p>
          )}
        </div>

        {/* Community Health Insights */}
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center"><BarChart className="mr-2" />Health Insights</h2>
          <p>Most discussed: {insights.discussedCategories.join(', ')}</p>
          <p>Rising symptoms: {insights.risingSymptoms.join(', ')}</p>
          <p>Active challenges: {insights.activeChallenges}</p>
          <p>Active circles: {insights.activeCircles}</p>
          <Link to="/insights" className="text-primary mt-4 block">View Full Insights</Link>
        </div>

        {/* My Support Circles */}
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center"><ChevronRight className="mr-2" />My Support Circles</h2>
          {Array.isArray(myCircles) && myCircles.length > 0 ? (
            myCircles.map(circle => (
              <Link key={circle._id} to={`/group/${circle._id}`} className="block mb-4">
                <h3 className="font-medium">{circle.name}</h3>
                <p className="text-sm">{circle.members.length} members</p>
              </Link>
            ))
          ) : (
            <p>No circles joined yet</p>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default Forum;