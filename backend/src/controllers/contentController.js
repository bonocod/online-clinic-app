


================================================
FILE: frontend/README.md
================================================
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)



================================================
FILE: frontend/package.json
================================================
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.7.7",
    "chart.js": "^4.5.1",
    "framer-motion": "^12.23.24",
    "i18next": "^25.6.2",
    "i18next-browser-languagedetector": "^8.2.0",
    "i18next-http-backend": "^3.0.2",
    "lucide-react": "^0.553.0",
    "react": "^18.3.1",
    "react-chartjs-2": "^5.3.1",
    "react-dom": "^18.3.1",
    "react-i18next": "^16.3.3",
    "react-router-dom": "^6.26.2",
    "react-scripts": "5.0.1",
    "socket.io-client": "^4.8.1",
    "web-vitals": "^2.1.4"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.1.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "vite": "^7.3.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": [
    ">0.2%",
    "not dead",
    "not op_mini all"
  ],
  "main": "index.js",
  "license": "MIT"
}



================================================
FILE: frontend/postcss.config.js
================================================
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};


================================================
FILE: frontend/tailwind.config.js
================================================
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6', // blue-500
        secondary: '#6366F1', // indigo-500
        accent: '#10B981', // green-500
        neutral: '#F3F4F6', // gray-100
        dark: '#1F2937', // gray-800
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}


================================================
FILE: frontend/public/index.html
================================================
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Online Clinic</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>


================================================
FILE: frontend/public/manifest.json
================================================
{
  "short_name": "React App",
  "name": "Create React App Sample",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}



================================================
FILE: frontend/public/robots.txt
================================================
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:



================================================
FILE: frontend/src/App.js
================================================
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DiseaseList from "./pages/DiseaseList";
import HealthBehaviors from "./pages/HealthBehaviors";
import Profile from "./pages/Profile";
import DiseaseDetail from "./pages/DiseaseDetail";
import ProfileSetup from "./pages/ProfileSetup";
import Forum from "./pages/Forum";
import Group from "./pages/Group";
import CreatePost from "./pages/CreatePost";
import HealthVideos from "./pages/HealthVideos";
import Admin from "./pages/Admin";
import Post from "./pages/Post";
import Category from "./pages/Category";
import DoctorConsole from "./pages/professional/DoctorConsole";
import CHWConsole from "./pages/professional/CHWConsole";
import Discussion from "./pages/Discussion";
import LiveSession from "./pages/LiveSession";
import PastSessions from "./pages/PastSessions";

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
            <Route path="/live-sessions/past" element={<PastSessions />} />
            <Route path="/live-sessions/:id" element={<LiveSession />} />
            <Route path="/health-videos" element={<HealthVideos />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/professional/doctor" element={<DoctorConsole />} />
            <Route path="/professional/chw" element={<CHWConsole />} />
          </Routes>
        </div>
      </AnimatePresence>
    </Router>
  );
}

export default App;


================================================
FILE: frontend/src/i18n.js
================================================
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './locales/en/translation.json';
import translationRW from './locales/rw/translation.json';
import translationFR from './locales/fr/translation.json';

const resources = {
  en: { translation: translationEN },
  rw: { translation: translationRW },
  fr: { translation: translationFR }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('lang') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;



================================================
FILE: frontend/src/index.css
================================================
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen font-sans antialiased text-gray-900;
  }
  h1, h2, h3 {
    @apply font-display;
  }
}

@layer components {
  .glass-card {
    @apply bg-white/40 backdrop-blur-lg border border-white/30 rounded-2xl shadow-card p-6 transition-all duration-300 hover:shadow-card-hover hover:bg-white/50;
  }
  .btn-primary {
    @apply bg-gradient-to-r from-primary to-secondary text-white py-3 px-6 rounded-full font-semibold shadow-md hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:-translate-y-1;
  }
  .input-field {
    @apply w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 shadow-sm bg-white/80;
  }
  .nav-link {
    @apply text-white hover:text-gray-200 transition-colors duration-200 font-medium;
  }
  .icon-btn {
    @apply p-2 rounded-full hover:bg-white/10 transition-colors;
  }
}


================================================
FILE: frontend/src/index.js
================================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



================================================
FILE: frontend/src/components/BehaviorCard.jsx
================================================
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


================================================
FILE: frontend/src/components/Card.jsx
================================================
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



================================================
FILE: frontend/src/components/DiseaseCard.jsx
================================================
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Activity } from 'lucide-react';

const DiseaseCard = ({ disease, language, searchQuery = '' }) => {  // ← Added searchQuery prop
  const { t } = useTranslation();
  const lang = language || 'en';

  const name = typeof disease.name === 'object' 
    ? disease.name[lang] || disease.name.en 
    : disease.name;

  // Robust symptoms handling
  let symptomsList = [];
  if (disease.symptoms) {
    if (Array.isArray(disease.symptoms)) {
      symptomsList = disease.symptoms;
    } else if (typeof disease.symptoms === 'object') {
      symptomsList = disease.symptoms[lang] || disease.symptoms.en || [];
    }
  }

  // Highlight function
  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => (
      <span key={i} className={part.toLowerCase() === query.toLowerCase() ? 'bg-yellow-200 font-medium' : ''}>
        {part}
      </span>
    ));
  };

  const symptoms = symptomsList.length > 0 
    ? highlightText(symptomsList.join(', '), searchQuery) 
    : 'No symptoms listed';

  const severityKey = disease.severity || 'moderate';
  const severityText = t(`diseaseSeverity.${severityKey}`);

  const severityColor = {
    mild: 'bg-green-100 text-green-700',
    moderate: 'bg-yellow-100 text-yellow-700',
    serious: 'bg-red-100 text-red-700'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden group"
    >
      <div className="h-40 overflow-hidden">
        <img
          src={disease.imageUrl || 'https://via.placeholder.com/600x400?text=Disease'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-dark">{name}</h3>
          <span className={`text-xs px-3 py-1 rounded-full font-medium uppercase ${severityColor[severityKey] || 'bg-gray-100'}`}>
            {severityText}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {t('diseaseList.symptoms')}: {symptoms}
        </p>

        <Link
          to={`/diseases/${disease._id}`}
          className="text-primary hover:text-secondary font-medium flex items-center"
        >
          {t('diseaseList.viewDetails')} <span className="ml-1">→</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default DiseaseCard;


================================================
FILE: frontend/src/components/Footer.jsx
================================================
import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          &copy; {new Date().getFullYear()} {t('footer.company')}. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;



================================================
FILE: frontend/src/components/HealthLogForm.jsx
================================================
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Heart, Thermometer, Activity, FileText } from 'lucide-react';

const HealthLogForm = ({ vitals, setVitals, notes, setNotes, handleSubmit, error }) => {
  const { t } = useTranslation();

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card space-y-6"
    >
      <div className="relative">
        <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
        <input
          type="text"
          placeholder={t('healthTracker.bpPlaceholder')}
          value={vitals.bp}
          onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
          className="input-field pl-10"
        />
      </div>
      <div className="relative">
        <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
        <input
          type="number"
          placeholder={t('healthTracker.tempPlaceholder')}
          value={vitals.temp}
          onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
          className="input-field pl-10"
        />
      </div>
      <div className="relative">
        <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
        <input
          type="number"
          placeholder={t('healthTracker.heartRatePlaceholder')}
          value={vitals.heartRate}
          onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
          className="input-field pl-10"
        />
      </div>
      <div className="relative">
        <FileText className="absolute left-3 top-3 text-primary w-5 h-5" />
        <textarea
          placeholder={t('healthTracker.notesPlaceholder')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field pl-10 pt-3 min-h-[100px] resize-y"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="btn-primary w-full">
        {t('healthTracker.addLog')}
      </button>
    </motion.form>
  );
};

export default HealthLogForm;


================================================
FILE: frontend/src/components/Navbar.jsx
================================================
// FILE: frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, User, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const role = localStorage.getItem('role');

  const changeLang = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const dashboardPath = () => {
    if (isAdmin) return '/admin';
    if (role === 'doctor') return '/professional/doctor';
    if (role === 'chw') return '/professional/chw';
    return '/dashboard';
  };

  const dashboardLabel = () => {
    if (isAdmin) return 'Admin';
    if (role === 'doctor') return 'Doctor Console';
    if (role === 'chw') return 'CHW Console';
    return t('navbar.dashboard');
  };

  return (
    <motion.nav
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-primary to-secondary text-white p-4 shadow-lg"
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center">
          <User className="mr-2" />
          {t('navbar.brand')}
        </Link>
        <div className="flex items-center gap-6">
          {token ? (
            <>
              <Link to={dashboardPath()} className="nav-link">
                {dashboardLabel()}
              </Link>
              {role !== 'admin' && <Link to="/dashboard" className="nav-link">User Dashboard</Link>}
              <button onClick={logout} className="icon-btn flex items-center">
                <LogOut className="mr-1" size={18} />
                {t('navbar.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">{t('navbar.login')}</Link>
              <Link to="/register" className="nav-link">{t('navbar.register')}</Link>
            </>
          )}
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
            <select
              value={i18n.language}
              onChange={changeLang}
              className="bg-white/20 text-white pl-10 pr-4 py-2 rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="en">EN</option>
              <option value="rw">RW</option>
              <option value="fr">FR</option>
            </select>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;


================================================
FILE: frontend/src/components/Sidebar.jsx
================================================
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



================================================
FILE: frontend/src/locales/en/translation.json
================================================
{
  "navbar": {
    "brand": "Online Clinic",
    "dashboard": "Dashboard",
    "logout": "Logout",
    "login": "Login",
    "register": "Register"
  },
  "landing": {
    "title": "Welcome to Online Clinic",
    "subtitle": "Track your health, check symptoms, learn about diseases",
    "description": "Your personal health assistant. Get insights in English, Kinyarwanda, or French.",
    "cta1": "Login",
    "cta2": "Register"
  },
  "login": {
    "title": "Login",
    "email": "Email",
    "password": "Password",
    "button": "Login"
  },
  "register": {
    "title": "Register",
    "name": "Name",
    "email": "Email",
    "password": "Password",
    "button": "Register"
  },
  "dashboard": {
    "welcome": "Welcome, {{name}}!",
    "symptomChecker": "Symptom Checker",
    "diseases": "Diseases",
    "healthTracker": "Health Tracker",
    "specialCases": "Special Cases",
    "profile": "My Profile",
    "healthStatus": "My Health Status",
    "ihave": "(I have)",
    "info": "(Info)",
    "goodBehaviors": "Good Health Behaviors",
    "badBehaviors": "Bad Health Behaviors",
    "diseasesIHave": "Diseases I Have",
    "setReminder": "Set Reminder Time",
    "reminders": "Reminders",
    "mentalHealth": "Mental Health",
    "pregnancyManager": "Pregnancy Manager",
    "healthBehaviors": "Health Behaviors",
    "myDiseases": "My Diseases",
    "forum": "Community Forum"
  },
  "diseaseList": {
    "title": "Disease List",
    "searchPlaceholder": "Search by name or symptoms",
    "symptoms": "Symptoms",
    "viewDetails": "View Details",
    "noResults": "No diseases found."
  },
  "diseaseDetail": {
    "symptoms": "Symptoms",
    "causes": "Causes",
    "effects": "Effects",
    "prevention": "Prevention",
    "behaviorGuidelines": "Behavior Guidelines",
    "treatment": "Treatment",
    "errorFetch": "Error fetching disease",
    "noDisease": "No disease found",
    "loading": "Loading disease...",
    "tipsTitle": "Additional Tips, Experiences & Knowledge from Users",
    "tipsPlaceholder": "Share your tip, personal experience, or additional knowledge about this disease...",
    "submitTip": "Share Your Tip",
    "noTipsTitle": "No tips shared yet",
    "noTipsMessage": "Be the first to share your experience and help others!",
    "helpful": "Helpful",
    "reply": "Reply",
    "addReply": "Add your reply...",
    "submitReply": "Reply",
    "tipRequired": "Please share your tip",
    "tipFailed": "Failed to share tip",
    "you": "You",
    "anonymous": "Anonymous"
  },
  "healthTracker": {
    "title": "Health Tracker",
    "bpPlaceholder": "BP (e.g., 120/80)",
    "tempPlaceholder": "Temperature (°C)",
    "heartRatePlaceholder": "Heart Rate (bpm)",
    "notesPlaceholder": "Notes",
    "addLog": "Add Log",
    "recentLogs": "Recent Logs",
    "date": "Date",
    "bp": "BP",
    "temp": "Temp",
    "heartRateLabel": "Heart Rate",
    "notesLabel": "Notes",
    "bpTrend": "BP Trend"
  },
  "profile": {
    "title": "My Health Profile",
    "age": "Age",
    "gender": "Gender",
    "height": "Height (cm)",
    "weight": "Weight (kg)",
    "bmi": "BMI: {{bmi}}",
    "bmiUnderweight": "Underweight",
    "bmiNormal": "Normal",
    "bmiOverweight": "Overweight",
    "bmiObese": "Obese",
    "pregnant": "I am pregnant",
    "medicalHistory": "Medical History",
    "addButton": "Add",
    "myConditions": "My Conditions",
    "preferredLanguage": "Preferred Language",
    "saveButton": "Save Profile",
    "errorAge": "Age must be between 1 and 120",
    "errorHeight": "Height must be between 100 and 250 cm",
    "errorWeight": "Weight must be between 20 and 300 kg",
    "loading": "Loading profile...",
    "select": "Select",
    "male": "Male",
    "female": "Female",
    "other": "Other"
  },
  "specialCaseModal": {
    "prompt": "What would you like to do?",
    "optionHas": "I have this",
    "optionInfo": "Just want info",
    "cancel": "Cancel"
  },
  "specialCases": {
    "back": "Back to Dashboard",
    "title": "Special Cases",
    "loadingInfo": "Loading information...",
    "errorLoad": "Failed to load info",
    "myStatus": "My Status",
    "close": "Close",
    "pregnancy": "Pregnancy",
    "mentalHealth": "Mental Health",
    "hiv": "HIV",
    "cancer": "Cancer",
    "diabetes": "Diabetes",
    "ihave": "(I have)",
    "info": "(Info)"
  },
  "symptomChecker": {
    "title": "Symptom Checker",
    "placeholder": "Describe your symptoms (e.g., I have fever and cough)",
    "checkButton": "Check Symptoms",
    "possibleDiseases": "Possible Diseases",
    "causes": "Causes",
    "symptoms": "Symptoms"
  },
  "profileSetup": {
    "title": "Tell Us More About You",
    "next": "Next",
    "skip": "Skip",
    "finish": "Finish",
    "questions": {
      "age": "What is your age?",
      "gender": "What is your gender?",
      "height": "What is your height in cm?",
      "weight": "What is your weight in kg?",
      "pregnant": "Are you pregnant? (for females)",
      "conditions": "Do you have any chronic conditions? (comma separated)"
    }
  },
  "mentalHealth": {
    "title": "Mental Health Assistant",
    "send": "Send",
    "placeholder": "Type your message...",
    "botGreeting": "Hello! How are you feeling today?"
  },
  "pregnancyManager": {
    "title": "Pregnancy Manager",
    "trimesterInfo": "Trimester Information",
    "nutrition": "Nutrition Tips",
    "exercises": "Safe Exercises",
    "symptoms": "Common Symptoms",
    "doctor": "When to See a Doctor"
  },
  "behaviors": {
    "good": [
      "Drink at least 8 glasses of water daily",
      "Brush teeth twice a day",
      "Do physical exercises for 30 minutes daily",
      "Wash hands regularly",
      "Eat a balanced diet with fruits and vegetables"
    ],
    "bad": [
      "Smoking",
      "Excessive alcohol consumption",
      "Poor sleep habits",
      "Unhealthy eating",
      "Sedentary lifestyle"
    ]
  },
  "healthBehaviors": {
    "title": "Health Behaviors",
    "recommended": "Recommended Behaviors",
    "restricted": "Restricted Behaviors",
    "loading": "Loading behaviors...",
    "searchPlaceholder":"find behaviors"
  },
  "myDiseases": {
    "title": "My Diseases",
    "loading": "Loading...",
    "error": "Error loading profile"
  },
  "forum": {
    "title": "Community Forum",
    "joinGroup": "Join Group",
    "viewGroup": "View Group →",
    "noGroups": "No groups available yet.",
    "errorLoad": "Failed to load groups",
    "joinSuccess": "Joined successfully!",
    "joinFailed": "Failed to join group",
    "posts": "Posts",
    "createPost": "Create Post",
    "postTitle": "Post Title",
    "postContent": "Post Content",
    "viewThread": "View Thread",
    "replies": "replies",
    "groupChat": "Group Chat",
    "messagePlaceholder": "Type a message...",
    "createPostFailed": "Failed to create post",
    "loading": "Loading..."
  },
  "post": {
    "comments": "Comments",
    "addComment": "Add your comment...",
    "postComment": "Post Comment",
    "errorLoad": "Failed to load post",
    "commentFailed": "Failed to add comment",
    "loading": "Loading..."
  },
  "diseaseSeverity": {
    "mild": "Mild",
    "moderate": "Moderate",
    "serious": "Serious"
  }
}



================================================
FILE: frontend/src/locales/fr/translation.json
================================================
{
  "navbar": {
    "brand": "Clinique en Ligne",
    "dashboard": "Tableau de bord",
    "logout": "Déconnexion",
    "login": "Connexion",
    "register": "Inscription"
  },
  "landing": {
    "title": "Bienvenue à la Clinique en Ligne",
    "subtitle": "Suivez votre santé, vérifiez les symptômes, apprenez sur les maladies",
    "description": "Votre assistant santé personnel. Obtenez des informations en anglais, kinyarwanda ou français.",
    "cta1": "Se connecter",
    "cta2": "S'inscrire"
  },
  "login": {
    "title": "Connexion",
    "email": "Email",
    "password": "Mot de passe",
    "button": "Se connecter"
  },
  "register": {
    "title": "Inscription",
    "name": "Nom",
    "email": "Email",
    "password": "Mot de passe",
    "button": "S'inscrire"
  },
  "dashboard": {
    "welcome": "Bienvenue, {{name}}!",
    "symptomChecker": "Test de Symptômes",
    "diseases": "Maladies",
    "healthTracker": "Suivi Santé",
    "specialCases": "Cas Spéciaux",
    "profile": "Mon Profil",
    "healthStatus": "Mon État de Santé",
    "ihave": "(J'ai)",
    "info": "(Info)",
    "goodBehaviors": "Bonnes Pratiques de Santé",
    "badBehaviors": "Mauvaises Habitudes de Santé",
    "diseasesIHave": "Maladies que J'ai",
    "setReminder": "Définir l'Heure de Rappel",
    "reminders": "Rappels",
    "mentalHealth": "Santé Mentale",
    "pregnancyManager": "Gestion de Grossesse",
    "healthBehaviors": "Comportements de Santé",
    "myDiseases": "Mes Maladies",
    "forum": "Forum Communautaire"
  },
  "diseaseList": {
    "title": "Liste des Maladies",
    "searchPlaceholder": "Rechercher (ex : fièvre, mal de tête)",
    "symptoms": "Symptômes",
    "viewDetails": "Voir Détails",
    "noResults": "Aucune maladie trouvée."
  },
  "diseaseDetail": {
    "symptoms": "Symptômes",
    "causes": "Causes",
    "effects": "Effets",
    "prevention": "Prévention",
    "behaviorGuidelines": "Conseils Comportementaux",
    "treatment": "Traitement",
    "feedbackTitle": "What Others Know About This Disease",
    "feedbackPlaceholder": "Share your experience or knowledge...",
    "submitFeedback": "Add Feedback"
  },
  "healthTracker": {
    "title": "Suivi Santé",
    "bpPlaceholder": "TA (ex : 120/80)",
    "tempPlaceholder": "Température (°C)",
    "heartRatePlaceholder": "Fréquence cardiaque (bpm)",
    "notesPlaceholder": "Remarques",
    "addLog": "Ajouter Entrée",
    "recentLogs": "Entrées Récentes",
    "date": "Date",
    "bp": "TA",
    "temp": "Température",
    "heartRateLabel": "Fréquence cardiaque",
    "notesLabel": "Remarques",
    "bpTrend": "Tendance TA"
  },
  "profile": {
    "title": "Mon Profil de Santé",
    "age": "Âge",
    "gender": "Sexe",
    "height": "Taille (cm)",
    "weight": "Poids (kg)",
    "bmi": "IMC: {{bmi}}",
    "bmiUnderweight": "Insuffisance pondérale",
    "bmiNormal": "Normal",
    "bmiOverweight": "Surpoids",
    "bmiObese": "Obésité",
    "pregnant": "Je suis enceinte",
    "medicalHistory": "Antécédents médicaux",
    "addButton": "Ajouter",
    "myConditions": "Mes Affections",
    "preferredLanguage": "Langue préférée",
    "saveButton": "Enregistrer",
    "errorAge": "L'âge doit être entre 1 et 120",
    "errorHeight": "La taille doit être entre 100 et 250 cm",
    "errorWeight": "Le poids doit être entre 20 et 300 kg",
    "loading": "Chargement du profil...",
    "select": "Sélectionner",
    "male": "Homme",
    "female": "Femme",
    "other": "Autre"
  },
  "specialCaseModal": {
    "prompt": "Que souhaitez-vous faire ?",
    "optionHas": "J'ai ceci",
    "optionInfo": "Je veux juste des infos",
    "cancel": "Annuler"
  },
  "specialCases": {
    "back": "Retour au Tableau de Bord",
    "title": "Cas Spéciaux",
    "loadingInfo": "Chargement des informations...",
    "errorLoad": "Échec du chargement des infos",
    "myStatus": "Mon État",
    "close": "Fermer",
    "pregnancy": "Grossesse",
    "mentalHealth": "Santé Mentale",
    "hiv": "VIH",
    "cancer": "Cancer",
    "diabetes": "Diabète",
    "ihave": "(J'ai)",
    "info": "(Info)"
  },
  "symptomChecker": {
    "title": "Test de Symptômes",
    "placeholder": "Décrivez vos symptômes (ex : J'ai de la fièvre et une toux)",
    "checkButton": "Rechercher",
    "possibleDiseases": "Maladies Possibles",
    "causes": "Causes",
    "symptoms": "Symptômes"
  },
  "profileSetup": {
    "title": "Dites-nous en plus sur vous",
    "next": "Suivant",
    "skip": "Passer",
    "finish": "Terminer",
    "questions": {
      "age": "Quel est votre âge ?",
      "gender": "Quel est votre sexe ?",
      "height": "Quelle est votre taille en cm ?",
      "weight": "Quel est votre poids en kg ?",
      "pregnant": "Êtes-vous enceinte ? (pour les femmes)",
      "conditions": "Avez-vous des conditions chroniques ? (séparées par des virgules)"
    }
  },
  "mentalHealth": {
    "title": "Assistant Santé Mentale",
    "send": "Envoyer",
    "placeholder": "Tapez votre message...",
    "botGreeting": "Bonjour ! Comment vous sentez-vous aujourd'hui ?"
  },
  "pregnancyManager": {
    "title": "Gestion de Grossesse",
    "trimesterInfo": "Informations sur le Trimestre",
    "nutrition": "Conseils Nutrition",
    "exercises": "Exercices Sûrs",
    "symptoms": "Symptômes Courants",
    "doctor": "Quand Consulter un Médecin"
  },
  "behaviors": {
    "good": [
      "Buvez au moins 8 verres d'eau par jour",
      "Brossez les dents deux fois par jour",
      "Faites de l'exercice physique 30 minutes par jour",
      "Lavez les mains régulièrement",
      "Mangez une alimentation équilibrée avec fruits et légumes"
    ],
    "bad": [
      "Fumer",
      "Consommation excessive d'alcool",
      "Mauvaises habitudes de sommeil",
      "Alimentation malsaine",
      "Mode de vie sédentaire"
    ]
  },
  "healthBehaviors": {
    "title": "Comportements de santé",
    "recommended": "Comportements recommandés",
    "restricted": "Comportements restreints",
    "loading": "Chargement des comportements..."
  },

  "myDiseases": {
    "title": "Mes Maladies",
    "loading": "Chargement...",
    "error": "Erreur de chargement du profil"
  },
  "forum": {
    "title": "Forum Communautaire",
    "joinGroup": "Rejoindre le Groupe",
    "viewGroup": "Voir le Groupe →",
    "noGroups": "Aucun groupe disponible pour le moment.",
    "errorLoad": "Échec du chargement des groupes",
    "joinSuccess": "Rejoint avec succès !",
    "joinFailed": "Échec de la jointure au groupe",
    "posts": "Publications",
    "createPost": "Créer une Publication",
    "postTitle": "Titre de la Publication",
    "postContent": "Contenu de la Publication",
    "viewThread": "Voir le Fil",
    "replies": "réponses",
    "groupChat": "Chat de Groupe",
    "messagePlaceholder": "Tapez un message...",
    "createPostFailed": "Échec de la création de la publication",
    "loading": "Chargement..."
  },
  "post": {
    "comments": "Commentaires",
    "addComment": "Ajoutez votre commentaire...",
    "postComment": "Publier le Commentaire",
    "errorLoad": "Échec du chargement de la publication",
    "commentFailed": "Échec de l'ajout du commentaire",
    "loading": "Chargement..."
  },
  "diseaseSeverity": {
    "mild": "Léger",
    "moderate": "Modéré",
    "serious": "Grave"
  }
}



================================================
FILE: frontend/src/locales/rw/translation.json
================================================
{
  "navbar": {
    "brand": "Kliniki ku Murandasi",
    "dashboard": "Dashibodi",
    "logout": "Sohoka",
    "login": "Winjira",
    "register": "Iyandikishe"
  },
  "landing": {
    "title": "Murakaza neza mu Klinik ya kuri Internet",
    "subtitle": "Kurikira ubuzima bwawe, reba ibimenyetso, menya indwara",
    "description": "Umufasha wawe w'ubuzima. Menya byinshi mu Cyongereza, Ikinyarwanda, cyangwa Igifaransa.",
    "cta1": "Winjira",
    "cta2": "Iyandikishe"
  },
  "login": {
    "title": "Winjira",
    "email": "Email",
    "password": "Ijambo ry'ibanga",
    "button": "Winjira"
  },
  "register": {
    "title": "Iyandikishe",
    "name": "Izina",
    "email": "Email",
    "password": "Ijambo ry'ibanga",
    "button": "Iyandikishe"
  },
  "dashboard": {
    "welcome": "Murakaza neza, {{name}}!",
    "symptomChecker": "Ikizamini cy'Ibimenyetso",
    "diseases": "Indwara",
    "healthTracker": "Gukurikirana Ubuzima",
    "specialCases": "Ibyihariye",
    "profile": "Umwirondoro wanjye",
    "healthStatus": "Aho ubuzima bwanjye buhagaze",
    "ihave": "(mfite)",
    "info": "(amakuru)",
    "goodBehaviors": "Imyitwarire Myiza y'Ubuzima",
    "badBehaviors": "Imyitwarire Mibi y'Ubuzima",
    "diseasesIHave": "Indwara mfite",
    "setReminder": "Shyira Igihe cy'Iburira",
    "reminders": "Iburira",
    "mentalHealth": "Ubuzima bwo mu Mutwe",
    "pregnancyManager": "Imiyoborere y'Imbanyi",
    "healthBehaviors": "Imyitwarire y'Ubuzima",
    "myDiseases": "Indwara Zanjye",
    "forum": "Ihuriro ry'Abantu"
  },
  "diseaseList": {
    "title": "Urutonde rw'indwara",
    "searchPlaceholder": "Shakisha (urugero, umuriro, umusonga)",
    "symptoms": "Ibimenyetso",
    "viewDetails": "Reba amakuru arambuye",
    "noResults": "Nta ndwara yabonetse."
  },
  "diseaseDetail": {
    "symptoms": "Ibimenyetso",
    "causes": "Impamvu",
    "effects": "Ingaruka",
    "prevention": "Uburyo bwo Kwirinda",
    "behaviorGuidelines": "Amabwiriza y'Imyitwarire",
    "treatment": "Guvura",
    "feedbackTitle": "Ibyo Abandi Bazi Kuri Iyi Ndwara",
    "feedbackPlaceholder": "Twungure amakuru cyangwa ubumenyi ufite kuri iyi ndwara...",
    "submitFeedback": "twungure Ubumenyi",
    "tipsTitle": "tottenham"
  },
  "healthTracker": {
    "title": "Gukurikirana Ubuzima",
    "bpPlaceholder": "Umuvuduko w'amaraso (urugero, 120/80)",
    "tempPlaceholder": "Ubushyuhe (°C)",
    "heartRatePlaceholder": "Umutima (bpm)",
    "notesPlaceholder": "Amakuru",
    "addLog": "Ongeraho Inyandiko",
    "recentLogs": "Inyandiko z'Ubuzima ziheruka",
    "date": "Itariki",
    "bp": "Umuvuduko w'amaraso",
    "temp": "Ubushyuhe",
    "heartRateLabel": "Umutima",
    "notesLabel": "Amakuru",
    "bpTrend": "Imiterere y'Umuvuduko"
  },
  "profile": {
    "title": "Umwirondoro w'Ubuzima bwanjye",
    "age": "Imyaka",
    "gender": "Igitsina",
    "height": "Uburebure (cm)",
    "weight": "Ibiro (kg)",
    "bmi": "BMI: {{bmi}}",
    "bmiUnderweight": "Umubiri muke cyane",
    "bmiNormal": "Bisanzwe",
    "bmiOverweight": "Kurenga urugero",
    "bmiObese": "Ubuto bwinshi",
    "pregnant": "Ndi gutwita",
    "medicalHistory": "Amateka y'Ubuvuzi",
    "addButton": "Ongeraho",
    "myConditions": "Indwara mfite",
    "preferredLanguage": "Ururimi uhitamo",
    "saveButton": "Bika umwirondoro",
    "errorAge": "Imyaka igomba kuba hagati ya 1 na 120",
    "errorHeight": "Uburebure bugomba kuba hagati ya 100 na 250 cm",
    "errorWeight": "Ibiro bigomba kuba hagati ya 20 na 300 kg",
    "loading": "Gusoma umwirondoro...",
    "select": "Hitamo",
    "male": "Gabo",
    "female": "Gore",
    "other": "Ikindi"
  },
  "specialCaseModal": {
    "prompt": "Ni iki ushaka gukora?",
    "optionHas": "Mbifite",
    "optionInfo": "Ndashaka amakuru",
    "cancel": "Hagarika"
  },
  "specialCases": {
    "back": "Subira kuri Dashboard",
    "title": "Ibyihariye",
    "loadingInfo": "Kurimo gusoma amakuru...",
    "errorLoad": "Ntibashoboye kubona amakuru",
    "myStatus": "Aho ngeze ubuzima",
    "close": "Funga",
    "pregnancy": "Gutwita",
    "mentalHealth": "Ubuzima bwo mu Mutwe",
    "hiv": "SIDA",
    "cancer": "Kanseri",
    "diabetes": "Diabete",
    "ihave": "(mfite)",
    "info": "(amakuru)"
  },
  "symptomChecker": {
    "title": "Isuzuma ry'Ibimenyetso",
    "placeholder": "Sobanura ibimenyetso byawe (urugero, mfite umuriro n'inkorora)",
    "checkButton": "Shakisha",
    "possibleDiseases": "Indwara Zishoboka",
    "causes": "Impamvu",
    "symptoms": "Ibimenyetso"
  },
  "profileSetup": {
    "title": "Tubwire Byinshi Kuri Wowe",
    "next": "Ikindi",
    "skip": "Siba",
    "finish": "Rangiza",
    "questions": {
      "age": "Imyaka yawe ni iyihe?",
      "gender": "Igitsina cyawe ni iki?",
      "height": "Uburebure bwawe ni biki mu cm?",
      "weight": "Ibiro byawe ni biki mu kg?",
      "pregnant": "Wagutwitse? (ku bagore)",
      "conditions": "Ufite indwara zidapfa? (zitandukanijwe na,)"
    }
  },
  "mentalHealth": {
    "title": "Umufasha w'Ubuzima bwo mu Mutwe",
    "send": "Ohereza",
    "placeholder": "Andika izina ry'umuntu...",
    "botGreeting": "Mwaramutse! Urumva ute muri iyi sa?"
  },
  "pregnancyManager": {
    "title": "Imiyoborere y'Imbanyi",
    "trimesterInfo": "Amakuru ku Trimestre",
    "nutrition": "Inama ku Biryo",
    "exercises": "Ibikorwa by'Amagarama",
    "symptoms": "Ibimenyetso Bisanzwe",
    "doctor": "Igihe cyo Kureba Umuganga"
  },
  "behaviors": {
    "good": [
      "Nywa byibuze ibikombe 8 ry'amazi buri munsi",
      "Sukura ameno kabiri ku munsi",
      "Kora ibikorwa by'umubiri iminota 30 buri munsi",
      "Iyuhagira intoki buri gihe",
      "Rya ibiryo byuzuye hamwe imbuto n'imboga"
    ],
    "bad": [
      "Ifumuro",
      "Kunywa inzoga cyane",
      "Imyitwarire mibi y'isinzira",
      "Ibiryo bidafite ibiribwa",
      "Imibereho y'itagendera"
    ]
  },
  "healthBehaviors": {
    "title": "Imyitwarire y’Ubuzima",
    "recommended": "Imyitwarire isabwa",
    "restricted": "Imyitwarire ibujijwe",
    "loading": "Gutegereza imyitwarire..."
  },
  "myDiseases": {
    "title": "Indwara Zanjye",
    "loading": "Gusoma...",
    "error": "Ikosa ryokusoma umwirondoro"
  },
  "forum": {
    "title": "Ihuriro ry'Abantu",
    "joinGroup": "Injira mu Ihuriro",
    "viewGroup": "Reba Ihuriro →",
    "noGroups": "Nta huriro ribaho kugeza kugira ngo.",
    "errorLoad": "Ntibyashobokaga kusoma amahuriro",
    "joinSuccess": "Winjiriye neza!",
    "joinFailed": "Ntibyashobokaga kwinjira mu huriro",
    "posts": "Ibyanditswe",
    "createPost": "Andika Ibintu",
    "postTitle": "Izina ry'Ibyanditswe",
    "postContent": "Ibyanditswe",
    "viewThread": "Reba Ikiganiro",
    "replies": "Ibisubizo",
    "groupChat": "Ikiganiro cy'Ihuriro",
    "messagePlaceholder": "Andika igitekerezo...",
    "createPostFailed": "Ntibyashobokaga kwandika ibintu",
    "loading": "Gusoma..."
  },
  "post": {
    "comments": "Ibisubizo",
    "addComment": "Ongeraho igitekerezo cyawe...",
    "postComment": "Shyira Igitekerezo",
    "errorLoad": "Ntibyashobokaga kusoma ibyanditswe",
    "commentFailed": "Ntibyashobokaga kongeraho igitekerezo",
    "loading": "Gusoma..."
  },
  "diseaseSeverity": {
  "mild": "Byoroheje",
  "moderate": "Gufata hagati",
  "serious": "Icyorezo gikomeye"
}
}



================================================
FILE: frontend/src/pages/Category.jsx
================================================
// FILE: frontend/src/pages/Category.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUp,
  MessageCircle,
  ThumbsUp,
  Flag,
  Plus,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { connectSocket, joinCategory, leaveCategory } from "../utils/socket";

const Category = () => {
  const { id } = useParams();
  const location = useLocation();

  const qs = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialTab = qs.get("tab") || "posts";

  const [category, setCategory] = useState(null);
  const [user, setUser] = useState(null);

  // Required tabs
  const [tab, setTab] = useState(["posts", "discussions", "replies"].includes(initialTab) ? initialTab : "posts");

  // Posts state
  const [postSort, setPostSort] = useState("recent"); // recent | popular
  const [posts, setPosts] = useState([]);
  const [pinnedPosts, setPinnedPosts] = useState([]);
  const [postsPage, setPostsPage] = useState(1);
  const [postsHasMore, setPostsHasMore] = useState(true);

  // Discussions state
  const [openDiscussions, setOpenDiscussions] = useState([]);
  const [closedDiscussions, setClosedDiscussions] = useState([]);

  // Replies state
  const [replies, setReplies] = useState([]);
  const [repliesPage, setRepliesPage] = useState(1);
  const [repliesHasMore, setRepliesHasMore] = useState(true);

  // Support circles (existing)
  const [relatedCircles, setRelatedCircles] = useState([]);

  // Common UI state
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const limit = 10;

  const isProfessionalUser = !!user && ["doctor", "chw"].includes(user.role) && user.verified;
  const isPatientUser = !!user && user.role === "patient";
  const categoryLocked = !!category?.isLocked;

  const isProfessionalPost = (post) => {
    const a = post?.author;
    if (!a) return false;
    return ["doctor", "chw"].includes(a.role) && !!a.verified;
  };

  const sanitizeAnonLabel = (u) => {
    if (!u) return "Unknown User";
    return `${u.name} (${u.role}${u.verified ? " • Verified" : ""})`;
  };

  // ---------------------------
  // Helpers to update lists live
  // ---------------------------
  const mergePostById = useCallback((postId, patch) => {
    setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, ...patch } : p)));
    setPinnedPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, ...patch } : p)));
  }, []);

  const addCommentToPost = useCallback((postId, comment) => {
    const apply = (arr) =>
      arr.map((p) => {
        if (p._id !== postId) return p;
        const existing = Array.isArray(p.comments) ? p.comments : [];
        const already = existing.some((c) => c?._id === comment?._id);
        return already ? p : { ...p, comments: [...existing, comment] };
      });

    setPosts((prev) => apply(prev));
    setPinnedPosts((prev) => apply(prev));
  }, []);

  const prependPostIfNotExists = useCallback((post) => {
    if (!post?._id) return;
    if (String(post.category || "") !== String(id)) return;

    // Always keep likes compatibility
    const normalized = {
      ...post,
      likes: Array.isArray(post.likes) && post.likes.length ? post.likes : post.upvotes || [],
    };

    setPosts((prev) => {
      const exists = prev.some((p) => p._id === normalized._id);
      if (exists) return prev;
      return [normalized, ...prev];
    });

    if (normalized.isPinned) {
      setPinnedPosts((prev) => {
        const exists = prev.some((p) => p._id === normalized._id);
        if (exists) return prev;
        return [normalized, ...prev];
      });
    }
  }, [id]);

  const upsertReply = useCallback((q) => {
    if (!q?._id) return;
    const qCat = q.categoryId?._id || q.categoryId;
    if (String(qCat || "") !== String(id)) return;

    setReplies((prev) => {
      const exists = prev.some((x) => x._id === q._id);
      if (exists) {
        return prev.map((x) => (x._id === q._id ? { ...x, ...q } : x));
      }
      return [q, ...prev];
    });
  }, [id]);

  const moveDiscussionToClosed = useCallback((d) => {
    if (!d?._id) return;
    const dCat = d.categoryId?._id || d.categoryId;
    if (String(dCat || "") !== String(id)) return;

    setOpenDiscussions((prev) => prev.filter((x) => x._id !== d._id));
    setClosedDiscussions((prev) => {
      const exists = prev.some((x) => x._id === d._id);
      if (exists) return prev.map((x) => (x._id === d._id ? { ...x, ...d } : x));
      return [{ ...d }, ...prev];
    });
  }, [id]);

  const upsertOpenDiscussion = useCallback((d) => {
    if (!d?._id) return;
    const dCat = d.categoryId?._id || d.categoryId;
    if (String(dCat || "") !== String(id)) return;

    if (d.status === "closed") {
      moveDiscussionToClosed(d);
      return;
    }

    if (d.status !== "open") return; // we don't show waiting discussions in category page

    setClosedDiscussions((prev) => prev.filter((x) => x._id !== d._id));
    setOpenDiscussions((prev) => {
      const exists = prev.some((x) => x._id === d._id);
      if (exists) return prev.map((x) => (x._id === d._id ? { ...x, ...d } : x));
      return [{ ...d }, ...prev];
    });
  }, [id, moveDiscussionToClosed]);

  // ---------------------------
  // Base data: profile, category, circles
  // ---------------------------
  useEffect(() => {
    api.get("/auth/profile")
      .then((res) => setUser(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchBase = async () => {
      try {
        setLoading(true);
        setError("");

        const resCat = await api.get(`/forum/categories/${id}`);
        const resCircles = await api.get(`/forum/categories/${id}/circles`);

        if (!mounted) return;

        setCategory(resCat.data);
        setRelatedCircles(resCircles.data || []);
      } catch (e) {
        if (!mounted) return;
        setError("Failed to load category");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBase();
    return () => {
      mounted = false;
    };
  }, [id]);

  // ---------------------------
  // Fetch tab data
  // ---------------------------
  const fetchPosts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setPosts([]);
        setPinnedPosts([]);
        setPostsPage(1);
        setPostsHasMore(true);
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // pinned posts
      const resPinned = await api.get(`/forum/categories/${id}/posts?pinned=true`);
      setPinnedPosts(Array.isArray(resPinned.data) ? resPinned.data : []);

      const page = reset ? 1 : postsPage;
      const sortTab = postSort === "popular" ? "popular" : "recent";
      const resPosts = await api.get(`/forum/categories/${id}/posts?tab=${sortTab}&page=${page}&limit=${limit}`);

      const data = Array.isArray(resPosts.data) ? resPosts.data : [];
      setPosts((prev) => (reset ? data : [...prev, ...data]));
      setPostsHasMore(data.length === limit);
    } catch (e) {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [id, limit, postSort, postsPage]);

  const fetchDiscussions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/forum/categories/${id}/discussions`);
      setOpenDiscussions(Array.isArray(res.data?.open) ? res.data.open : []);
      setClosedDiscussions(Array.isArray(res.data?.closed) ? res.data.closed : []);
    } catch (e) {
      setError("Failed to load discussions");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReplies = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setReplies([]);
        setRepliesPage(1);
        setRepliesHasMore(true);
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const page = reset ? 1 : repliesPage;
      const res = await api.get(`/forum/categories/${id}/replies?page=${page}&limit=${limit}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setReplies((prev) => (reset ? data : [...prev, ...data]));
      setRepliesHasMore(data.length === limit);
    } catch (e) {
      setError("Failed to load replies");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [id, limit, repliesPage]);

  useEffect(() => {
    if (!id) return;
    if (tab === "posts") fetchPosts(true);
    if (tab === "discussions") fetchDiscussions();
    if (tab === "replies") fetchReplies(true);
  }, [id, tab, postSort, fetchPosts, fetchDiscussions, fetchReplies]);

  const loadMorePosts = async () => {
    if (!postsHasMore || loadingMore) return;
    const next = postsPage + 1;
    setPostsPage(next);
    try {
      setLoadingMore(true);
      const sortTab = postSort === "popular" ? "popular" : "recent";
      const resPosts = await api.get(`/forum/categories/${id}/posts?tab=${sortTab}&page=${next}&limit=${limit}`);
      const data = Array.isArray(resPosts.data) ? resPosts.data : [];
      setPosts((prev) => [...prev, ...data]);
      setPostsHasMore(data.length === limit);
    } catch (e) {
      setError("Failed to load more posts");
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMoreReplies = async () => {
    if (!repliesHasMore || loadingMore) return;
    const next = repliesPage + 1;
    setRepliesPage(next);
    try {
      setLoadingMore(true);
      const res = await api.get(`/forum/categories/${id}/replies?page=${next}&limit=${limit}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setReplies((prev) => [...prev, ...data]);
      setRepliesHasMore(data.length === limit);
    } catch (e) {
      setError("Failed to load more replies");
    } finally {
      setLoadingMore(false);
    }
  };

  // ---------------------------
  // LIVE SOCKETS (category room)
  // ---------------------------
  useEffect(() => {
    const s = connectSocket();
    joinCategory(id);

    // Posts
    const onNewPost = (post) => {
      // Works because backend emits to category room
      prependPostIfNotExists(post);
    };

    const onNewComment = (payload) => {
      // expected payload: { ...commentFields, post: postId }
      const postId = payload?.post;
      if (!postId) return;
      addCommentToPost(postId, payload);
    };

    // Likes/upvotes
    const onPostLiked = ({ postId, likes, upvotes }) => {
      if (!postId) return;
      // keep both in sync
      mergePostById(postId, { likes: likes || [], upvotes: upvotes || [] });
    };

    // Category lock/unlock updates (optional backend emit)
    const onCategoryUpdated = (cat) => {
      if (!cat?._id) return;
      if (String(cat._id) !== String(id)) return;
      setCategory(cat);
    };

    // Discussions live (optional backend emit)
    const onDiscussionApproved = (d) => upsertOpenDiscussion(d);
    const onDiscussionClosed = (d) => moveDiscussionToClosed(d);

    // Replies live (optional backend emit)
    const onQuestionAnswered = (q) => upsertReply(q);

    s.on("newPost", onNewPost);
    s.on("newComment", onNewComment);
    s.on("postLiked", onPostLiked);

    s.on("categoryUpdated", onCategoryUpdated);
    s.on("discussionApproved", onDiscussionApproved);
    s.on("discussionClosed", onDiscussionClosed);
    s.on("questionAnswered", onQuestionAnswered);

    return () => {
      leaveCategory(id);
      s.off("newPost", onNewPost);
      s.off("newComment", onNewComment);
      s.off("postLiked", onPostLiked);

      s.off("categoryUpdated", onCategoryUpdated);
      s.off("discussionApproved", onDiscussionApproved);
      s.off("discussionClosed", onDiscussionClosed);
      s.off("questionAnswered", onQuestionAnswered);
    };
  }, [id, prependPostIfNotExists, addCommentToPost, mergePostById, upsertOpenDiscussion, moveDiscussionToClosed, upsertReply]);

  // ---------------------------
  // UI actions
  // ---------------------------
  const changeTab = (newTab) => {
    setTab(newTab);
    setError("");
  };

  const handleJoinCircle = async (circleId) => {
    try {
      await api.post(`/forum/groups/${circleId}/join`);
      alert("Joined successfully");
    } catch {
      alert("Failed to join");
    }
  };

  // ---------------------------
  // Cards
  // ---------------------------
  const PostCard = ({ post }) => {
    const upvoted =
      user && (post.upvotes || []).some((pid) => pid?.toString?.() === user._id?.toString?.());

    const helpfulMarked =
      user && (post.helpful || []).some((pid) => pid?.toString?.() === user._id?.toString?.());

    const [commentText, setCommentText] = useState("");
    const [asking, setAsking] = useState(false);
    const [questionText, setQuestionText] = useState("");
    const [questionAnon, setQuestionAnon] = useState(false);
    const [questionLoading, setQuestionLoading] = useState(false);

    const proPost = isProfessionalPost(post);

    const canAskOnPost = isPatientUser && proPost;
    const canMarkHelpful = isProfessionalUser && post?.author?._id?.toString?.() !== user?._id?.toString?.();
    const canHighlightOwn = isProfessionalUser && post?.author?._id?.toString?.() === user?._id?.toString?.();

    const handleUpvote = async () => {
      const res = await api.post(`/forum/posts/${post._id}/upvote`);
      // optimistic local update (broadcast comes via socket for others)
      mergePostById(post._id, { upvotes: res.data.upvotes, likes: res.data.likes || res.data.upvotes });
    };

    const handleHelpful = async () => {
      const res = await api.post(`/forum/posts/${post._id}/mark-helpful`);
      mergePostById(post._id, { helpful: res.data.helpful });
    };

    const handleHighlight = async () => {
      const res = await api.post(`/forum/posts/${post._id}/highlight`);
      mergePostById(post._id, { highlighted: res.data.highlighted });
    };

    const handleReport = async () => {
      const reason = window.prompt("Reason for reporting?");
      if (!reason) return;
      await api.post(`/forum/posts/${post._id}/report`, { reason });
      alert("Reported successfully");
    };

    const handleComment = async (e) => {
      e.preventDefault();
      if (!commentText.trim()) return;

      // Do NOT keep local comments state — socket will push the comment
      await api.post(`/forum/posts/${post._id}/comments`, { content: commentText });
      setCommentText("");
    };

    const submitQuestion = async () => {
      if (!questionText.trim()) return;
      try {
        setQuestionLoading(true);
        await api.post(`/forum/posts/${post._id}/question`, {
          body: questionText,
          anonymous: questionAnon,
        });
        setQuestionText("");
        setQuestionAnon(false);
        setAsking(false);
        alert("Question sent. It will appear in Replies after it is answered.");
      } catch (e) {
        alert(e.response?.data?.msg || "Failed to submit question");
      } finally {
        setQuestionLoading(false);
      }
    };

    const authorLabel = post.anonymous
      ? "Anonymous"
      : post.author
      ? sanitizeAnonLabel(post.author)
      : "Unknown User";

    const proBadge = proPost ? (
      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">Professional</span>
    ) : null;

    const helpfulBadge =
      (post.helpful?.length || 0) > 0 ? (
        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Helpful</span>
      ) : null;

    const highlightBadge = post.highlighted ? (
      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Highlighted</span>
    ) : null;

    const proTypeBadge = post.proType ? (
      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
        {String(post.proType).toUpperCase()}
      </span>
    ) : null;

    const cardClass = proPost
      ? "glass-card p-4 border border-indigo-200 bg-white/50"
      : "glass-card p-4";

    return (
      <div className={cardClass}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/post/${post._id}`} className="text-xl font-bold hover:text-primary break-words">
              {post.title}
            </Link>
            <p className="text-sm text-gray-600 mt-1">
              {authorLabel}
              {proBadge}
              {proTypeBadge}
              {highlightBadge}
              {helpfulBadge}
            </p>
          </div>

          {canAskOnPost && (
            <button
              onClick={() => setAsking((v) => !v)}
              className="px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center gap-2 text-sm"
              title="Ask a question on this professional post"
            >
              <HelpCircle size={16} />
              Ask
            </button>
          )}
        </div>

        <p className="mt-3 text-gray-700 whitespace-pre-wrap">
          {post.body?.length > 280 ? `${post.body.slice(0, 280)}...` : post.body}
        </p>

        <div className="flex flex-wrap gap-4 mt-3 text-sm items-center">
          <button
            onClick={handleUpvote}
            className={upvoted ? "text-blue-500 flex items-center gap-1" : "flex items-center gap-1"}
          >
            <ArrowUp size={16} />
            {post.upvotes?.length || 0}
          </button>

          {canMarkHelpful && (
            <button
              onClick={handleHelpful}
              className={helpfulMarked ? "text-green-600 flex items-center gap-1" : "flex items-center gap-1"}
            >
              <ThumbsUp size={16} />
              Helpful ({post.helpful?.length || 0})
            </button>
          )}

          {canHighlightOwn && (
            <button onClick={handleHighlight} className="flex items-center gap-1 text-yellow-700">
              <Sparkles size={16} />
              {post.highlighted ? "Unhighlight" : "Highlight"}
            </button>
          )}

          <span className="flex items-center gap-1">
            <MessageCircle size={16} />
            {(post.comments || []).length}
          </span>

          <button onClick={handleReport} className="flex items-center gap-1 text-red-500">
            <Flag size={16} />
            Report
          </button>
        </div>

        {/* Ask question panel */}
        {asking && canAskOnPost && (
          <div className="mt-4 border rounded-xl p-3 bg-white/60">
            <p className="text-sm text-gray-700 mb-2">
              Ask a question about this professional post. The answer becomes public in Replies once answered.
            </p>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="input-field w-full min-h-[90px]"
              placeholder="Type your question..."
            />
            <label className="flex items-center gap-2 mt-2 text-sm">
              <input type="checkbox" checked={questionAnon} onChange={(e) => setQuestionAnon(e.target.checked)} />
              Ask anonymously
            </label>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={submitQuestion}
                disabled={questionLoading || !questionText.trim()}
                className="btn-primary"
              >
                {questionLoading ? "Sending..." : "Send Question"}
              </button>
              <button
                type="button"
                onClick={() => setAsking(false)}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Comments preview + add comment */}
        <div className="mt-4">
          {(post.comments || []).slice(0, 3).map((c) => (
            <div key={c._id} className="border-l pl-3 mt-2">
              <p className="text-sm text-gray-700">
                {c.anonymous
                  ? "Anonymous"
                  : c.author
                  ? sanitizeAnonLabel(c.author)
                  : "Unknown User"}
                {c.isProfessional ? (
                  <span className="ml-2 text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                    Professional opinion
                  </span>
                ) : null}
              </p>
              <p className="text-gray-800 whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}

          <form onSubmit={handleComment} className="flex gap-2 mt-3">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="border px-3 py-2 rounded-xl flex-1 bg-white/70"
              placeholder="Write comment..."
              disabled={categoryLocked}
            />
            <button className="btn-primary px-4" disabled={categoryLocked}>
              Send
            </button>
          </form>

          {categoryLocked && (
            <p className="text-xs text-red-600 mt-2">
              This category is locked. Posting and commenting are disabled.
            </p>
          )}
        </div>
      </div>
    );
  };

  const DiscussionCard = ({ d }) => {
    const isClosed = d.status === "closed";
    const isWaiting = d.status === "waiting";
    const isOpen = d.status === "open";

    const createdByLabel = d.anonymous
      ? "Anonymous"
      : d.createdBy
      ? sanitizeAnonLabel(d.createdBy)
      : "Unknown";

    const statusBadge = isWaiting ? (
      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Waiting approval</span>
    ) : isOpen ? (
      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Open</span>
    ) : (
      <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">Closed</span>
    );

    return (
      <div className="glass-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/discussion/${d._id}`} className="text-lg font-bold hover:text-primary break-words">
              {d.title}
            </Link>
            <p className="text-sm text-gray-600 mt-1">
              By {createdByLabel} • {statusBadge}
            </p>
          </div>
          {d.closeAt ? (
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <Clock size={14} />
              Closes: {new Date(d.closeAt).toLocaleString()}
            </div>
          ) : null}
        </div>

        <p className="mt-3 text-gray-700 whitespace-pre-wrap">
          {d.body?.length > 240 ? `${d.body.slice(0, 240)}...` : d.body}
        </p>

        {isClosed && <p className="text-xs text-gray-500 mt-2">Closed discussions are read-only.</p>}
      </div>
    );
  };

  const ReplyCard = ({ q }) => {
    const askedByLabel = q.anonymous
      ? "Anonymous"
      : q.askedBy
      ? sanitizeAnonLabel(q.askedBy)
      : "Unknown";

    const answeredByLabel = q.answeredBy
      ? sanitizeAnonLabel(q.answeredBy)
      : "Professional";

    return (
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 size={16} className="text-green-600" />
            Answered
          </span>
          <span>• Asked by {askedByLabel}</span>
          <span>• Answered by {answeredByLabel}</span>
          {q.postId?._id ? (
            <Link to={`/post/${q.postId._id}`} className="text-primary underline ml-auto">
              View related post
            </Link>
          ) : null}
        </div>

        <div className="mt-3">
          <p className="font-semibold text-gray-800">Question</p>
          <p className="text-gray-700 whitespace-pre-wrap">{q.body}</p>
        </div>

        <div className="mt-3">
          <p className="font-semibold text-gray-800">Answer</p>
          <p className="text-gray-700 whitespace-pre-wrap">{q.answer}</p>
        </div>

        {q.answeredAt ? (
          <p className="text-xs text-gray-500 mt-2">
            Answered on {new Date(q.answeredAt).toLocaleString()}
          </p>
        ) : null}
      </div>
    );
  };

  if (loading && !category) return <p>Loading...</p>;

  if (error)
    return (
      <p className="text-red-500 flex items-center">
        <AlertCircle className="mr-2" />
        {error}
      </p>
    );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/forum" className="flex items-center text-primary">
          <ArrowLeft className="mr-2" />
          Back to Forum
        </Link>
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">{category?.name}</h1>
          <p className="text-gray-600">{category?.description}</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-100 p-4 rounded-lg flex items-center">
        <AlertTriangle className="mr-2 text-yellow-600" />
        <p className="text-yellow-800">
          This platform is not a replacement for professional, in-person medical care. For emergencies, contact local services immediately.
        </p>
      </div>

      {/* Lock banner */}
      {categoryLocked && (
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-red-700 font-medium">
            This category is currently locked by an admin. New posts, discussions, and questions are disabled.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto">
        {[
          { key: "posts", label: "Posts" },
          { key: "discussions", label: "Discussions" },
          { key: "replies", label: "Replies" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => changeTab(t.key)}
            className={`px-4 py-2 rounded-full ${tab === t.key ? "bg-primary text-white" : "bg-gray-200"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Actions per tab */}
      {tab === "posts" && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPostSort("recent")}
              className={`px-4 py-2 rounded-full ${postSort === "recent" ? "bg-gray-900 text-white" : "bg-gray-200"}`}
            >
              Recent
            </button>
            <button
              onClick={() => setPostSort("popular")}
              className={`px-4 py-2 rounded-full ${postSort === "popular" ? "bg-gray-900 text-white" : "bg-gray-200"}`}
            >
              Popular
            </button>
          </div>

          <Link
            to={`/category/${id}/create-post?mode=post`}
            className={`btn-primary flex items-center justify-center gap-2 ${categoryLocked ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Plus size={16} />
            Create Post
          </Link>
        </div>
      )}

      {tab === "discussions" && (
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/category/${id}/create-post?mode=discussion`}
            className={`btn-primary flex items-center justify-center gap-2 ${categoryLocked ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Plus size={16} />
            Start a Discussion
          </Link>
        </div>
      )}

      {tab === "replies" && (
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/category/${id}/create-post?mode=ask`}
            className={`btn-primary flex items-center justify-center gap-2 ${categoryLocked ? "opacity-50 pointer-events-none" : ""}`}
          >
            <HelpCircle size={16} />
            Ask an Expert
          </Link>
        </div>
      )}

      {/* Content */}
      {tab === "posts" && (
        <>
          {pinnedPosts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Pinned</h2>
              {pinnedPosts.map((p) => (
                <PostCard key={p._id} post={p} />
              ))}
            </div>
          )}

          <div className="space-y-4">
            {posts.length === 0 && !loading ? (
              <p className="text-center text-gray-600">No posts yet.</p>
            ) : (
              posts.map((p) => <PostCard key={p._id} post={p} />)
            )}

            {loadingMore && <p>Loading more...</p>}

            {postsHasMore && !loadingMore && posts.length > 0 && (
              <button onClick={loadMorePosts} className="btn-primary mx-auto block">
                Load More
              </button>
            )}
          </div>
        </>
      )}

      {tab === "discussions" && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Open Discussions</h2>
            {openDiscussions.length === 0 && !loading ? (
              <p className="text-center text-gray-600">No open discussions.</p>
            ) : (
              openDiscussions.map((d) => <DiscussionCard key={d._id} d={d} />)
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Closed Discussions</h2>
            {closedDiscussions.length === 0 && !loading ? (
              <p className="text-center text-gray-600">No closed discussions.</p>
            ) : (
              closedDiscussions.map((d) => <DiscussionCard key={d._id} d={d} />)
            )}
          </div>
        </div>
      )}

      {tab === "replies" && (
        <div className="space-y-4">
          {replies.length === 0 && !loading ? (
            <p className="text-center text-gray-600">No replies yet.</p>
          ) : (
            replies.map((q) => <ReplyCard key={q._id} q={q} />)
          )}

          {loadingMore && <p>Loading more...</p>}

          {repliesHasMore && !loadingMore && replies.length > 0 && (
            <button onClick={loadMoreReplies} className="btn-primary mx-auto block">
              Load More
            </button>
          )}
        </div>
      )}

      {/* Circles */}
      <div className="glass-card p-4">
        <h2 className="text-xl font-bold mb-4">Related Support Circles</h2>

        {relatedCircles.map((circle) => (
          <div key={circle._id} className="mb-4">
            <Link to={`/group/${circle._id}`} className="font-medium">
              {circle.name}
            </Link>
            <p className="text-sm">{circle.members?.length || 0} members</p>
            <button onClick={() => handleJoinCircle(circle._id)} className="text-primary">
              Join
            </button>
          </div>
        ))}

        {relatedCircles.length === 0 && <p>No related circles yet.</p>}
      </div>
    </motion.div>
  );
};

export default Category;


================================================
FILE: frontend/src/pages/CreateDiscussion.jsx
================================================
// FILE: frontend/src/pages/CreateDiscussion.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';

const CreateDiscussion = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [closeAt, setCloseAt] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/forum/discussions', { categoryId: id, title, body, closeAt });
      navigate(`/category/${id}`);
    } catch (err) {
      setError('Failed to create discussion');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      <h1 className="text-3xl font-bold mb-6">Create Discussion</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="input-field" required />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Description" className="input-field h-32" required />
        <input type="datetime-local" value={closeAt} onChange={e => setCloseAt(e.target.value)} className="input-field" />
        <button type="submit" className="btn-primary">Submit</button>
      </form>
    </motion.div>
  );
};

export default CreateDiscussion;


================================================
FILE: frontend/src/pages/CreatePost.jsx
================================================
// FILE: frontend/src/pages/CreatePost.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

const CreatePost = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const isGroup = location.pathname.includes('/group/')
  const qs = useMemo(() => new URLSearchParams(location.search), [location.search])
  const mode = (qs.get('mode') || 'post').toLowerCase() // post | discussion | ask

  const [user, setUser] = useState(null)
  const [category, setCategory] = useState(null)

  // Shared
  const [anonymous, setAnonymous] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Post
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [file, setFile] = useState(null)
  const [proType, setProType] = useState('general') // professionals only: advice|general|lesson

  // Discussion
  const [dTitle, setDTitle] = useState('')
  const [dBody, setDBody] = useState('')
  const [closeAt, setCloseAt] = useState('') // datetime-local

  // Ask-an-expert (general)
  const [qBody, setQBody] = useState('')

  const isProfessional = !!user && ['doctor', 'chw'].includes(user.role) && user.verified
  const isPatient = !!user && user.role === 'patient'

  const backLink = isGroup ? `/group/${id}` : `/category/${id}`

  useEffect(() => {
    api
      .get('/auth/profile')
      .then((res) => setUser(res.data))
      .catch(() => {})

    if (!isGroup) {
      api
        .get(`/forum/categories/${id}`)
        .then((res) => setCategory(res.data))
        .catch(() => {})
    }
  }, [id, isGroup])

  const categoryLocked = !!category?.isLocked

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (categoryLocked && !isGroup) {
        setError('This category is locked. You cannot create new content here.')
        return
      }

      // GROUP: only posts
      if (isGroup) {
        if (!title.trim() || !body.trim()) {
          setError('Title and content are required')
          return
        }

        const formData = new FormData()
        formData.append('title', title)
        formData.append('body', body)
        formData.append('groupId', id)
        formData.append('anonymous', anonymous)
        // professionals can still tag proType even in group feeds
        if (isProfessional) formData.append('proType', proType)
        if (file) formData.append('media', file)

        await api.post('/forum/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        navigate(`/group/${id}`)
        return
      }

      // CATEGORY modes
      if (mode === 'discussion') {
        if (!dTitle.trim() || !dBody.trim()) {
          setError('Title and description are required')
          return
        }

        const payload = {
          categoryId: id,
          title: dTitle,
          body: dBody,
          anonymous,
          closeAt: closeAt ? new Date(closeAt).toISOString() : null,
        }

        const res = await api.post('/forum/discussions', payload)
        setSuccess(res.data?.msg || 'Discussion submitted — waiting admin approval')
        // go back to category discussions tab
        setTimeout(() => navigate(`/category/${id}?tab=discussions`), 700)
        return
      }

      if (mode === 'ask') {
        if (!isPatient) {
          setError('Only normal users can submit general questions.')
          return
        }
        if (!qBody.trim()) {
          setError('Please type your question')
          return
        }

        const res = await api.post('/forum/questions', {
          categoryId: id,
          body: qBody,
          anonymous,
        })

        setSuccess(res.data?.msg || 'Question submitted')
        setTimeout(() => navigate(`/category/${id}?tab=replies`), 700)
        return
      }

      // default: mode === post
      if (!title.trim() || !body.trim()) {
        setError('Title and content are required')
        return
      }

      const formData = new FormData()
      formData.append('title', title)
      formData.append('body', body)
      formData.append('categoryId', id)
      formData.append('anonymous', anonymous)

      // professionals can choose proType (Advice/General/Lesson)
      if (isProfessional) formData.append('proType', proType)

      if (file) formData.append('media', file)

      await api.post('/forum/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      navigate(`/category/${id}?tab=posts`)
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to submit')
    }
  }

  const pageTitle = isGroup
    ? 'Create Post'
    : mode === 'discussion'
      ? 'Start a Discussion'
      : mode === 'ask'
        ? 'Ask an Expert'
        : 'Create Post'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6">
        <Link to={backLink} className="flex items-center text-primary">
          <ArrowLeft className="mr-2" />
          Back
        </Link>
        <h1 className="text-3xl font-bold text-dark">{pageTitle}</h1>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-100 p-4 rounded-lg flex items-center mb-6">
        <AlertTriangle className="mr-2 text-yellow-600" />
        <p className="text-yellow-800">
          This platform is not a replacement for professional, in-person medical care.
        </p>
      </div>

      {categoryLocked && !isGroup && (
        <div className="bg-red-100 p-4 rounded-lg mb-6">
          <p className="text-red-700 font-medium">
            This category is locked. New posts, discussions, and questions are disabled.
          </p>
        </div>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="glass-card space-y-4">
        {/* MODE SWITCH hint */}
        {!isGroup && (
          <div className="flex gap-2 flex-wrap">
            <Link
              to={`/category/${id}/create-post?mode=post`}
              className={`px-4 py-2 rounded-full ${mode === 'post' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              Post
            </Link>
            <Link
              to={`/category/${id}/create-post?mode=discussion`}
              className={`px-4 py-2 rounded-full ${mode === 'discussion' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              Discussion
            </Link>
            <Link
              to={`/category/${id}/create-post?mode=ask`}
              className={`px-4 py-2 rounded-full ${mode === 'ask' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              Ask
            </Link>
          </div>
        )}

        {/* POST */}
        {(isGroup || mode === 'post') && (
          <>
            {isProfessional && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Professional Post Type</label>
                <select
                  value={proType}
                  onChange={(e) => setProType(e.target.value)}
                  className="input-field"
                >
                  <option value="general">General</option>
                  <option value="advice">Advice</option>
                  <option value="lesson">Lesson</option>
                </select>
              </div>
            )}

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="input-field"
              required
              disabled={!isGroup && categoryLocked}
            />

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your post..."
              className="input-field min-h-[140px]"
              required
              disabled={!isGroup && categoryLocked}
            />

            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={!isGroup && categoryLocked}
            />
          </>
        )}

        {/* DISCUSSION */}
        {!isGroup && mode === 'discussion' && (
          <>
            <input
              value={dTitle}
              onChange={(e) => setDTitle(e.target.value)}
              placeholder="Discussion title"
              className="input-field"
              required
              disabled={categoryLocked}
            />

            <textarea
              value={dBody}
              onChange={(e) => setDBody(e.target.value)}
              placeholder="Describe the topic and what people should discuss..."
              className="input-field min-h-[160px]"
              required
              disabled={categoryLocked}
            />

            <div>
              <label className="block text-sm text-gray-600 mb-1">Close time (optional)</label>
              <input
                type="datetime-local"
                value={closeAt}
                onChange={(e) => setCloseAt(e.target.value)}
                className="input-field"
                disabled={categoryLocked}
              />
              <p className="text-xs text-gray-500 mt-1">
                If set, the discussion will auto-close at that time.
              </p>
            </div>

            <p className="text-sm text-gray-700">
              When you submit, the discussion enters <b>waiting</b> until an admin approves it.
            </p>
          </>
        )}

        {/* ASK (General Ask-an-Expert) */}
        {!isGroup && mode === 'ask' && (
          <>
            {!isPatient ? (
              <p className="text-sm text-red-600">
                Only normal users can submit general questions.
              </p>
            ) : (
              <>
                <textarea
                  value={qBody}
                  onChange={(e) => setQBody(e.target.value)}
                  placeholder="Ask a general health question (not tied to a post)..."
                  className="input-field min-h-[160px]"
                  required
                  disabled={categoryLocked}
                />
                <p className="text-xs text-gray-500">
                  Your question becomes visible to everyone once answered.
                </p>
              </>
            )}
          </>
        )}

        {/* Anonymous */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            disabled={!isGroup && categoryLocked}
          />
          Post anonymously
        </label>

        <button type="submit" className="btn-primary" disabled={!isGroup && categoryLocked}>
          Submit
        </button>
      </form>
    </motion.div>
  )
}

export default CreatePost


================================================
FILE: frontend/src/pages/Dashboard.jsx
================================================
// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import api from "../services/api";
import {
  LayoutDashboard,
  Activity,
  Stethoscope,
  Heart,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Baby,
  Apple,
  Pill,
  Users,
  Film // New icon for videos
} from "lucide-react";
const Dashboard = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reminders, setReminders] = useState([]);
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        setProfile(res.data);
        setReminders(res.data.profile?.reminders || []);
      } catch (err) {
        setError("Error loading profile");
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, isAdmin]);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      reminders.forEach((r) => {
        if (r.time === currentTime && Notification.permission === "granted") {
          new Notification(`Reminder: Time for ${r.disease} medicine`);
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [reminders]);
  if (loading)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 text-center text-gray-600"
      >
        Loading...
      </motion.div>
    );
  if (error)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 text-red-500 text-center"
      >
        {error}
      </motion.div>
    );
  const cards = [
    {
      to: "/diseases",
      icon: Activity,
      label: t("dashboard.diseases"),
      color: "bg-green-100 text-green-600",
    },
    {
      to: "/health-behaviors",
      icon: Apple,
      label: t("dashboard.healthBehaviors"),
      color: "bg-orange-100 text-orange-600",
    },
    {
      to: "/forum",
      icon: Users,
      label: t("dashboard.forum"),
      color: "bg-purple-100 text-purple-600",
    },
    {
      to: "/health-videos", // New card
      icon: Film,
      label: "Health Videos",
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      to: "/profile",
      icon: User,
      label: t("dashboard.profile"),
      color: "bg-purple-100 text-purple-600",
      colSpan: "col-span-2",
    },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-4xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-dark flex items-center justify-center">
        <LayoutDashboard className="mr-2" />
        {t("dashboard.welcome", { name: profile.name })}
      </h1>
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={card.to}
              className={`glass-card flex flex-col items-center justify-center text-center ${card.color} hover:bg-opacity-80 transition-all ${card.colSpan || ""}`}
            >
              <card.icon className="w-12 h-12 mb-2" />
              <span className="font-medium">{card.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
      {profile.profile?.isPregnant && (
        <Link
          to="/pregnancy-manager"
          className="glass-card block text-center py-4 mt-8 bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors"
        >
          <Baby className="w-8 h-8 mx-auto mb-2" />
          {t("dashboard.pregnancyManager")}
        </Link>
      )}
      {(profile.profile?.conditions?.length > 0 ||
        profile.profile?.interestedIn?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 glass-card"
        >
          <h3 className="font-bold text-lg mb-2 flex items-center">
            <AlertCircle className="mr-2 text-red-500" />
            {t("dashboard.healthStatus")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.profile.conditions?.map((c) => (
              <span
                key={c}
                className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {c.toUpperCase()} {t("dashboard.ihave")}
              </span>
            ))}
            {profile.profile.interestedIn?.map((c) => (
              <span
                key={c}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {c.toUpperCase()} {t("dashboard.info")}
              </span>
            ))}
          </div>
        </motion.div>
      )}
      {reminders.length > 0 && (
        <div className="glass-card mt-8">
          <h2 className="text-xl font-bold mb-4 flex items-center text-blue-600">
            <Clock className="mr-2" />
            {t("dashboard.reminders")}
          </h2>
          <ul className="space-y-2">
            {reminders.map((r, i) => (
              <li key={i} className="flex items-center text-gray-700">
                <Clock className="mr-2 text-blue-500 w-4 h-4" />
                {r.disease} at {r.time}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};
export default Dashboard;


================================================
FILE: frontend/src/pages/Discussion.jsx
================================================
// FILE: frontend/src/pages/Discussion.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { ArrowLeft, AlertTriangle, Clock, Send, AlertCircle } from "lucide-react";

import { connectSocket, joinDiscussion, leaveDiscussion } from "../utils/socket";

const idOf = (v) => (v && typeof v === "object" ? v._id || v.id : v);

const Discussion = () => {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentText, setCommentText] = useState("");
  const [anon, setAnon] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const myId = useMemo(() => String(idOf(user) || ""), [user]);

  const isAdmin = useMemo(() => !!user && user.role === "admin", [user]);

  const isCreator = useMemo(() => {
    if (!discussion || !myId) return false;
    const creatorId = String(idOf(discussion?.createdBy) || "");
    return creatorId && creatorId === myId;
  }, [discussion, myId]);

  const canClose = isAdmin || isCreator;
  const canComment = discussion?.status === "open";

  const categoryId = useMemo(() => {
    const cid = discussion?.categoryId;
    if (!cid) return null;
    return typeof cid === "string" ? cid : cid?._id || null;
  }, [discussion]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [resUser, res] = await Promise.all([
        api.get("/auth/profile"),
        api.get(`/forum/discussions/${id}`),
      ]);

      setUser(resUser.data);
      setDiscussion(res.data.discussion);
      setComments(res.data.comments || []);
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to load discussion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---------------------------
  // LIVE SOCKETS (discussion room)
  // ---------------------------
  useEffect(() => {
    const s = connectSocket();
    joinDiscussion(id);

    /**
     * Backend (new):
     *  - event: "discussion:newComment"
     *  - payload: { ...commentFields, discussion: discussionId }
     *
     * Some older backends:
     *  - event: "discussionComment"
     *  - payload: { discussionId, comment }
     */
    const handleNewComment = (payload) => {
      if (!payload) return;

      const discussionId = String(payload.discussionId || payload.discussion || "");
      if (discussionId && discussionId !== String(id)) return;

      const comment = payload.comment || payload; // support both shapes
      if (!comment?._id) return;

      setComments((prev) => {
        const exists = prev.some((c) => c._id === comment._id);
        return exists ? prev : [...prev, comment];
      });
    };

    /**
     * Backend (new):
     *  - event: "discussion:closed"
     *  - payload: { discussionId }
     *
     * Some older backends:
     *  - event: "discussionClosed"
     *  - payload: discussion object (or { _id, ... })
     */
    const handleClosed = (payload) => {
      const discussionId = String(payload?.discussionId || payload?._id || payload || "");
      if (!discussionId || discussionId !== String(id)) return;

      setDiscussion((prev) =>
        prev
          ? {
              ...prev,
              status: "closed",
              closedAt: prev.closedAt || new Date().toISOString(),
            }
          : prev
      );
    };

    /**
     * Optional updates (if you add later)
     * - "discussion:updated" or "discussionUpdated"
     */
    const handleUpdated = (payload) => {
      const did = String(payload?._id || payload?.discussionId || payload?.id || "");
      if (!did || did !== String(id)) return;

      setDiscussion((prev) => (prev ? { ...prev, ...payload } : payload));
    };

    // New event names (your backend routes file)
    s.on("discussion:newComment", handleNewComment);
    s.on("discussion:closed", handleClosed);
    s.on("discussion:updated", handleUpdated);

    // Backward-compatible names (if you still have them)
    s.on("discussionComment", handleNewComment);
    s.on("discussionClosed", handleClosed);
    s.on("discussionUpdated", handleUpdated);

    return () => {
      leaveDiscussion(id);

      s.off("discussion:newComment", handleNewComment);
      s.off("discussion:closed", handleClosed);
      s.off("discussion:updated", handleUpdated);

      s.off("discussionComment", handleNewComment);
      s.off("discussionClosed", handleClosed);
      s.off("discussionUpdated", handleUpdated);
    };
  }, [id]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);

      // If backend emits sockets, others will get it live.
      // We still append response locally to ensure the sender sees it immediately.
      const res = await api.post(`/forum/discussions/${id}/comments`, {
        content: commentText,
        anonymous: anon,
      });

      const created = res.data;
      if (created?._id) {
        setComments((prev) => {
          const exists = prev.some((c) => c._id === created._id);
          return exists ? prev : [...prev, created];
        });
      }

      setCommentText("");
      setAnon(false);
    } catch (e2) {
      alert(e2.response?.data?.msg || "Failed to comment");
    } finally {
      setSubmitting(false);
    }
  };

  const closeDiscussion = async () => {
    if (!window.confirm("Close this discussion? It will become read-only.")) return;
    try {
      await api.post(`/forum/discussions/${id}/close`);

      // optimistic local close (socket may also arrive)
      setDiscussion((prev) =>
        prev
          ? { ...prev, status: "closed", closedAt: prev.closedAt || new Date().toISOString() }
          : prev
      );

      // safety refresh
      await fetchData();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to close discussion");
    }
  };

  const statusBadge =
    discussion?.status === "waiting"
      ? "Waiting approval"
      : discussion?.status === "open"
      ? "Open"
      : "Closed";

  if (loading) return <p>Loading...</p>;
  if (error)
    return (
      <p className="text-red-500 flex items-center">
        <AlertCircle className="mr-2" />
        {error}
      </p>
    );
  if (!discussion) return <p>Discussion not found</p>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 space-y-6 max-w-4xl mx-auto"
    >
      <Link
        to={categoryId ? `/category/${categoryId}?tab=discussions` : "/forum"}
        className="flex items-center text-primary"
      >
        <ArrowLeft className="mr-2" /> Back
      </Link>

      <div className="bg-yellow-100 p-4 rounded-lg flex items-center">
        <AlertTriangle className="mr-2 text-yellow-600" />
        <p className="text-yellow-800">
          This platform is not a replacement for professional, in-person medical care.
        </p>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold break-words">{discussion.title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Status: <span className="font-medium">{statusBadge}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              By{" "}
              {discussion.anonymous
                ? "Anonymous"
                : discussion.createdBy?.name
                ? `${discussion.createdBy.name} (${discussion.createdBy.role}${
                    discussion.createdBy.verified ? " • Verified" : ""
                  })`
                : "Unknown"}{" "}
              • {new Date(discussion.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {discussion.closeAt ? (
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <Clock size={14} />
                Closes: {new Date(discussion.closeAt).toLocaleString()}
              </div>
            ) : null}

            {canClose && discussion.status === "open" && (
              <button onClick={closeDiscussion} className="btn-warning">
                Close discussion
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-gray-800">{discussion.body}</p>

        {discussion.status === "waiting" && (
          <p className="text-sm text-yellow-700 mt-4">
            This discussion is waiting for admin approval.
          </p>
        )}
        {discussion.status === "closed" && (
          <p className="text-sm text-gray-600 mt-4">This discussion is closed and read-only.</p>
        )}
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Opinions / Comments</h2>

        {comments.length === 0 ? (
          <p className="text-gray-600">No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c._id} className="border rounded-xl p-4 bg-white/60">
                <p className="text-sm text-gray-600">
                  By {c.anonymous ? "Anonymous" : c.author?.name || "Unknown"} (
                  {c.author?.role || "user"}
                  {c.author?.verified ? " • Verified" : ""}) •{" "}
                  {new Date(c.createdAt).toLocaleString()}
                  {c.isProfessional ? (
                    <span className="ml-2 text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                      Professional opinion
                    </span>
                  ) : null}
                </p>
                <p className="text-gray-800 whitespace-pre-wrap mt-2">{c.content}</p>
              </div>
            ))}
          </div>
        )}

        {canComment ? (
          <form onSubmit={submitComment} className="space-y-3 mt-5">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your opinion..."
              className="input-field w-full min-h-[110px]"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={anon}
                onChange={(e) => setAnon(e.target.checked)}
              />
              Comment anonymously
            </label>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={submitting || !commentText.trim()}
            >
              <Send size={16} />
              {submitting ? "Posting..." : "Post"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-600 mt-4">
            Comments are disabled for closed or waiting discussions.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default Discussion;


================================================
FILE: frontend/src/pages/DiseaseDetail.jsx
================================================
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


================================================
FILE: frontend/src/pages/DiseaseList.jsx
================================================
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import DiseaseCard from '../components/DiseaseCard';
import { Search } from 'lucide-react';

const DiseaseList = () => {
  const { t, i18n } = useTranslation();
  const [diseases, setDiseases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const endpoint = searchQuery ? `/diseases/search?q=${encodeURIComponent(searchQuery)}` : '/diseases';
        const res = await api.get(endpoint);
        setDiseases(res.data.diseases || res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error fetching diseases');
      } finally {
        setLoading(false);
      }
    };
    fetchDiseases();
  }, [searchQuery]);

  if (loading) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-center">Loading diseases...</motion.div>;
  if (error) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-red-500 text-center">{error}</motion.div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-6xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-dark">{t('diseaseList.title')}</h1>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t('diseaseList.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {diseases.map((d, i) => (
          <DiseaseCard key={d._id} disease={d} language={i18n.language} searchQuery={searchQuery} />
        ))}
      </div>
      {diseases.length === 0 && <p className="text-center text-gray-600 mt-8">{t('diseaseList.noResults')}</p>}
    </motion.div>
  );
};

export default DiseaseList;


================================================
FILE: frontend/src/pages/Forum.jsx
================================================
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import {
  Stethoscope,
  Users,
  Shield,
  Lock,
  Search,
  ChevronRight,
  AlertCircle,
  Activity,
  Radio,
  Clock3,
  MessageSquare,
  FolderOpen,
} from "lucide-react";
import { connectSocket, joinCategory, leaveCategory } from "../utils/socket";

const fmt = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "";
  }
};

const Forum = () => {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [circles, setCircles] = useState([]);
  const [myCircles, setMyCircles] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [askCategoryId, setAskCategoryId] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [livePulse, setLivePulse] = useState(false);

  const meId = useMemo(() => user?._id?.toString?.() || "", [user]);

  const pulse = () => {
    setLivePulse(true);
    window.setTimeout(() => setLivePulse(false), 450);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      let me = null;
      let cats = [];
      let circlesData = [];
      let liveData = [];
      let pastData = [];

      try {
        const profileRes = await api.get("/auth/profile");
        me = profileRes.data;
      } catch {}

      try {
        const catsRes = await api.get("/forum/categories");
        cats = Array.isArray(catsRes.data) ? catsRes.data : [];
      } catch {}

      try {
        const circlesRes = await api.get("/forum/circles?status=approved");
        circlesData = Array.isArray(circlesRes.data) ? circlesRes.data : [];
      } catch {}

      try {
        const liveRes = await api.get("/forum/live-sessions?status=live");
        liveData = Array.isArray(liveRes.data) ? liveRes.data : [];
      } catch {}

      try {
        const pastRes = await api.get("/forum/live-sessions?status=past");
        pastData = Array.isArray(pastRes.data) ? pastRes.data : [];
      } catch {}

      const joined = me?._id
        ? circlesData.filter((circle) =>
            Array.isArray(circle.members) &&
            circle.members.some((memberId) => String(memberId) === String(me._id))
          )
        : [];

      setUser(me);
      setCategories(cats);
      setCircles(circlesData);
      setMyCircles(joined);
      setLiveSessions(liveData);
      setPastSessions(pastData);
    } catch {
      setError("Failed to load forum");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!askCategoryId && categories.length > 0) {
      setAskCategoryId(categories[0]._id);
    }
  }, [askCategoryId, categories]);

  useEffect(() => {
    const s = connectSocket();

    categories.forEach((category) => {
      if (category?._id) joinCategory(category._id);
    });

    const refreshLight = () => {
      pulse();
      fetchAll();
    };

    s.on("liveSession:started", refreshLight);
    s.on("liveSession:updated", refreshLight);
    s.on("liveSession:ended", refreshLight);
    s.on("circle:created", refreshLight);
    s.on("circle:approved", refreshLight);
    s.on("circle:memberUpdate", refreshLight);
    s.on("categoryUpdated", refreshLight);

    return () => {
      categories.forEach((category) => {
        if (category?._id) leaveCategory(category._id);
      });

      s.off("liveSession:started", refreshLight);
      s.off("liveSession:updated", refreshLight);
      s.off("liveSession:ended", refreshLight);
      s.off("circle:created", refreshLight);
      s.off("circle:approved", refreshLight);
      s.off("circle:memberUpdate", refreshLight);
      s.off("categoryUpdated", refreshLight);
    };
  }, [categories, fetchAll]);

  const joinCircle = async (circle) => {
    try {
      if (circle.approvalRequired || circle.privacy === "private") {
        const reason = window.prompt("Why do you want to join this support circle?");
        if (!reason || !reason.trim()) return;

        const res = await api.post(`/forum/circles/${circle._id}/join-request`, {
          reason: reason.trim(),
        });

        await fetchAll();
        alert(res.data?.msg || "Join request submitted");
        return;
      }

      const res = await api.post(`/forum/groups/${circle._id}/join`);
      await fetchAll();
      alert(res.data?.msg || "Joined successfully");
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to join circle");
    }
  };

  const q = query.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!q) return categories;
    return categories.filter((category) =>
      `${category.name} ${category.description || ""}`.toLowerCase().includes(q)
    );
  }, [categories, q]);

  const filteredCircles = useMemo(() => {
    if (!q) return circles;
    return circles.filter((circle) =>
      `${circle.name} ${circle.description || ""} ${circle.conditionTag || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [circles, q]);

  const filteredLiveSessions = useMemo(() => {
    if (!q) return liveSessions;
    return liveSessions.filter((session) =>
      `${session.title} ${session.description || ""} ${session.startedBy?.name || ""} ${session.categoryId?.name || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [liveSessions, q]);

  const previewPastSessions = useMemo(() => {
    const source = q
      ? pastSessions.filter((session) =>
          `${session.title} ${session.description || ""} ${session.startedBy?.name || ""} ${session.categoryId?.name || ""}`
            .toLowerCase()
            .includes(q)
        )
      : pastSessions;

    return source.slice(0, 3);
  }, [pastSessions, q]);

  const stats = useMemo(
    () => ({
      totalCategories: categories.length,
      totalCircles: circles.length,
      joinedCircles: myCircles.length,
      activeSessions: liveSessions.length,
    }),
    [categories.length, circles.length, myCircles.length, liveSessions.length]
  );

  if (loading) {
    return <p className="text-center text-lg py-10">Loading...</p>;
  }

  if (error) {
    return (
      <p className="text-red-500 text-center flex items-center justify-center py-10">
        <AlertCircle className="mr-2" />
        {error}
      </p>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/50 backdrop-blur-xl shadow-card">
        <div className="p-6 md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <span
                  className={`inline-flex items-center gap-2 ${
                    livePulse ? "opacity-100" : "opacity-70"
                  } transition`}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Live updates
                </span>
              </div>

              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                <Stethoscope className="text-blue-600" />
                Community Health Hub
              </h1>

              <p className="mt-3 text-gray-700 leading-relaxed">
                Ask questions, join support circles, and follow live doctor Q&amp;A sessions.
                This platform does not replace emergency or in-person care.
              </p>

              <div className="mt-5 relative max-w-xl">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-field pl-11"
                  placeholder="Search categories, circles, or live sessions..."
                />
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col gap-3">
              <div className="glass-card p-4 md:p-5">
                <p className="text-sm text-gray-600 font-medium">Ask an Expert (by category)</p>
                <div className="mt-2 flex gap-2">
                  <select
                    value={askCategoryId}
                    onChange={(e) => setAskCategoryId(e.target.value)}
                    className="input-field"
                  >
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <Link
                    to={askCategoryId ? `/category/${askCategoryId}/create-post?mode=ask` : "/forum"}
                    className={`btn-primary whitespace-nowrap ${
                      !askCategoryId ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    Ask
                  </Link>
                </div>

                {!user && (
                  <p className="text-xs text-gray-500 mt-2">
                    Login is required for questions, circles, and live participation.
                  </p>
                )}
              </div>

              <Link
                to="/live-sessions/past"
                className="glass-card p-4 md:p-5 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-gray-600">Want to review older Q&amp;A?</p>
                  <p className="font-semibold text-gray-900">Past Sessions Archive</p>
                </div>
                <ChevronRight className="text-blue-600" />
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
              <p className="text-xs text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
            </div>
            <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
              <p className="text-xs text-gray-500">Support circles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCircles}</p>
            </div>
            <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
              <p className="text-xs text-gray-500">Joined circles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.joinedCircles}</p>
            </div>
            <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
              <p className="text-xs text-gray-500">Active live sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="glass-card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Radio className="text-red-500" />
            Live Q&amp;A Sessions
          </h2>

          <div className="flex items-center gap-2">
            <Link
              to="/live-sessions/past"
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
            >
              View Past Sessions
            </Link>
          </div>
        </div>

        {filteredLiveSessions.length === 0 ? (
          <div className="bg-white/60 border border-white/40 rounded-2xl p-6">
            <p className="text-gray-700 font-medium">No live sessions right now.</p>
            <p className="text-sm text-gray-500 mt-1">
              When a doctor starts one, it will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredLiveSessions.map((session) => (
              <div
                key={session._id}
                className="bg-white/60 border border-white/40 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-lg">{session.title}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {session.description || "Live doctor question session"}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                    LIVE
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Doctor:</span>{" "}
                    {session.startedBy?.name || "Doctor"}
                  </p>
                  <p>
                    <span className="font-medium">Category:</span>{" "}
                    {session.categoryId?.name || "General"}
                  </p>
                  <p>
                    <span className="font-medium">Started:</span> {fmt(session.startedAt)}
                  </p>
                  <p>
                    <span className="font-medium">Answered:</span>{" "}
                    {session.answeredCount || 0}
                  </p>
                  {session.scheduledEndAt ? (
                    <p>
                      <span className="font-medium">Ends:</span> {fmt(session.scheduledEndAt)}
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 flex gap-2">
                  <Link to={`/live-sessions/${session._id}`} className="btn-primary">
                    Open Session
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {previewPastSessions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Clock3 className="text-blue-600" />
              Recent Past Sessions
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {previewPastSessions.map((session) => (
                <Link
                  key={session._id}
                  to={`/live-sessions/${session._id}`}
                  className="bg-white/60 border border-white/40 rounded-2xl p-4 hover:bg-white transition"
                >
                  <p className="font-semibold text-gray-900">{session.title}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {session.description || "Ended session"}
                  </p>
                  <p className="text-xs text-gray-500 mt-3">
                    Ended: {fmt(session.endedAt || session.updatedAt)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FolderOpen className="mr-2" /> Categories
          </h2>

          {filteredCategories.length === 0 ? (
            <p className="text-gray-600">No categories found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCategories.map((category) => (
                <div
                  key={category._id}
                  className="bg-white/60 rounded-2xl p-4 border border-white/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{category.name}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {category.description}
                      </p>
                    </div>

                    {category.isLocked ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                        <Lock size={12} /> Locked
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <Link
                      to={`/category/${category._id}?tab=posts`}
                      className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
                    >
                      Posts
                    </Link>
                    <Link
                      to={`/category/${category._id}?tab=discussions`}
                      className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
                    >
                      Discussions
                    </Link>
                    <Link
                      to={`/category/${category._id}?tab=replies`}
                      className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
                    >
                      Replies
                    </Link>
                    <Link
                      to={`/category/${category._id}/create-post?mode=post`}
                      className={`px-3 py-2 rounded-xl bg-primary text-white text-sm ${
                        category.isLocked ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      Create
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Users className="mr-2" /> Support Circles
          </h2>

          {filteredCircles.length === 0 ? (
            <p className="text-gray-600">No circles found.</p>
          ) : (
            filteredCircles.slice(0, 6).map((circle) => {
              const joined = meId && circle.isMember;
              const hasPending = !!circle.pendingJoinRequest;

              return (
                <div
                  key={circle._id}
                  className="mb-4 border border-white/40 rounded-2xl p-4 bg-white/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{circle.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{circle.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {circle.membersCount || circle.members?.length || 0} members
                      </p>
                    </div>

                    {joined ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        Joined
                      </span>
                    ) : hasPending ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                        Pending
                      </span>
                    ) : null}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Link
                      to={`/group/${circle._id}`}
                      className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
                    >
                      View
                    </Link>

                    <button
                      onClick={() => joinCircle(circle)}
                      className={`btn-primary ${
                        joined || hasPending ? "opacity-60 pointer-events-none" : ""
                      }`}
                    >
                      {hasPending ? "Requested" : joined ? "Joined" : "Join"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <div className="glass-card p-5">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="text-blue-600" />
          Community reminder
        </h3>
        <p className="text-sm text-gray-700 mt-2">
          Respect privacy, avoid sharing harmful misinformation, and use live sessions and support
          circles responsibly.
        </p>
        <Link to="/dashboard" className="text-primary mt-3 inline-flex items-center gap-2">
          Go to Dashboard <ChevronRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
};

export default Forum;


================================================
FILE: frontend/src/pages/Group.jsx
================================================
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import {
  Users,
  Shield,
  AlertCircle,
  Send,
  RefreshCw,
  MessageCircle,
  Lock,
  Globe,
  Clock3,
  CheckCircle2,
  XCircle,
  UserMinus,
} from "lucide-react";
import {
  connectSocket,
  joinGroup,
  leaveGroup,
  joinCircle,
  leaveCircle,
} from "../utils/socket";

const fmt = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "";
  }
};

const idOf = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return String(value._id || value.id || "");
  return String(value);
};

export default function Group() {
  const { id } = useParams();

  const [me, setMe] = useState(null);
  const [circle, setCircle] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [joining, setJoining] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const meId = useMemo(() => idOf(me?._id), [me]);

  const isActuallyMember = useMemo(() => {
    if (!circle) return false;
    if (circle.isMember) return true;
    if (!Array.isArray(circle.members)) return false;

    return circle.members.some((member) => idOf(member) === meId);
  }, [circle, meId]);

  const isActuallyModerator = useMemo(() => {
    if (!circle) return false;
    if (circle.isModerator) return true;
    if (idOf(circle.createdBy) === meId) return true;
    if (!Array.isArray(circle.moderators)) return false;

    return circle.moderators.some((member) => idOf(member) === meId);
  }, [circle, meId]);

  const canManage = useMemo(() => {
    if (!circle) return false;
    return !!me?.isAdmin || me?.role === "admin" || isActuallyModerator;
  }, [circle, me, isActuallyModerator]);

  const canChat = useMemo(() => {
    if (!circle) return false;
    return isActuallyMember || canManage;
  }, [circle, isActuallyMember, canManage]);

  const pendingRequests = useMemo(() => {
    return Array.isArray(circle?.pendingJoinRequests) ? circle.pendingJoinRequests : [];
  }, [circle]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/auth/profile");
      setMe(res.data || null);
      return res.data || null;
    } catch {
      setMe(null);
      return null;
    }
  }, []);

  const fetchCircle = useCallback(async () => {
    const res = await api.get(`/forum/circles/${id}`);
    setCircle(res.data || null);
    return res.data || null;
  }, [id]);

  const fetchMessages = useCallback(async () => {
    setMessagesLoading(true);
    try {
      const res = await api.get(`/forum/circles/${id}/messages`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      if (e.response?.status === 403) {
        setMessages([]);
      } else {
        setError(e.response?.data?.msg || "Failed to load messages");
      }
    } finally {
      setMessagesLoading(false);
    }
  }, [id]);

  const loadPage = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await fetchProfile();
      const circleData = await fetchCircle();

      const member =
        !!circleData?.isMember ||
        Array.isArray(circleData?.members) &&
          circleData.members.some((member) => idOf(member) === meId);

      const moderator =
        !!circleData?.isModerator ||
        Array.isArray(circleData?.pendingJoinRequests);

      if (member || moderator) {
        await fetchMessages();
      } else {
        setMessages([]);
      }
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to load circle");
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, fetchCircle, fetchMessages, meId]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    const socket = connectSocket();

    joinGroup(id);
    joinCircle(id);

    const onNewMessage = (message) => {
      const groupId = idOf(message?.group);
      if (!groupId || groupId === String(id)) {
        setMessages((prev) => {
          const exists = prev.some((item) => idOf(item._id) === idOf(message._id));
          if (exists) return prev;
          return [...prev, message];
        });
      }
    };

    const onMemberUpdate = (payload) => {
      if (String(payload?.circleId) !== String(id)) return;
      fetchCircle();
    };

    const onJoinRequestCount = (payload) => {
      if (String(payload?.circleId) !== String(id)) return;
      fetchCircle();
    };

    const onCircleDeleted = (payload) => {
      if (String(payload?.circleId) !== String(id)) return;
      setError("This circle was deleted.");
      setCircle(null);
      setMessages([]);
    };

    const onJoinApproved = (payload) => {
      if (String(payload?.circleId) !== String(id)) return;
      setSuccess("Your join request was approved.");
      fetchCircle();
      fetchMessages();
    };

    const onJoinRejected = (payload) => {
      if (String(payload?.circleId) !== String(id)) return;
      setSuccess("Your join request was rejected.");
      fetchCircle();
    };

    socket.on("message", onNewMessage);
    socket.on("circle:message", onNewMessage);
    socket.on("circle:memberUpdate", onMemberUpdate);
    socket.on("circle:joinRequestCount", onJoinRequestCount);
    socket.on("circle:deleted", onCircleDeleted);
    socket.on("circle:joinApproved", onJoinApproved);
    socket.on("circle:joinRejected", onJoinRejected);

    return () => {
      leaveGroup(id);
      leaveCircle(id);

      socket.off("message", onNewMessage);
      socket.off("circle:message", onNewMessage);
      socket.off("circle:memberUpdate", onMemberUpdate);
      socket.off("circle:joinRequestCount", onJoinRequestCount);
      socket.off("circle:deleted", onCircleDeleted);
      socket.off("circle:joinApproved", onJoinApproved);
      socket.off("circle:joinRejected", onJoinRejected);
    };
  }, [id, fetchCircle, fetchMessages]);

  const handleJoin = async () => {
    if (!circle) return;

    setJoining(true);
    setError("");
    setSuccess("");

    try {
      if (circle.approvalRequired || circle.privacy === "private") {
        const reason = window.prompt("Why do you want to join this circle?");
        if (!reason || !reason.trim()) {
          setJoining(false);
          return;
        }

        const res = await api.post(`/forum/circles/${id}/join-request`, {
          reason: reason.trim(),
        });

        setSuccess(res.data?.msg || "Join request submitted");
      } else {
        const res = await api.post(`/forum/groups/${id}/join`);
        setSuccess(res.data?.msg || "Joined successfully");
      }

      const fresh = await fetchCircle();
      if (fresh?.isMember) {
        await fetchMessages();
      }
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to join circle");
    } finally {
      setJoining(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setSending(true);
    setError("");

    try {
      const res = await api.post(`/forum/circles/${id}/messages`, {
        content: messageText.trim(),
      });

      const created = res.data;
      setMessages((prev) => {
        const exists = prev.some((item) => idOf(item._id) === idOf(created?._id));
        if (exists) return prev;
        return [...prev, created];
      });

      setMessageText("");
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    const note = window.prompt("Approval note (optional):") || "";

    try {
      await api.patch(`/forum/circles/${id}/join-requests/${requestId}/approve`, { note });
      setSuccess("Join request approved");
      await fetchCircle();
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to approve request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    const note = window.prompt("Reason for rejection (optional):") || "";

    try {
      await api.patch(`/forum/circles/${id}/join-requests/${requestId}/reject`, { note });
      setSuccess("Join request rejected");
      await fetchCircle();
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to reject request");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member from the circle?")) return;

    try {
      await api.delete(`/forum/circles/${id}/members/${userId}`);
      setSuccess("Member removed");
      await fetchCircle();
      await fetchMessages();
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to remove member");
    }
  };

  const myJoinRequestPending =
    circle?.myJoinRequest && circle?.myJoinRequest?.status === "pending";

  if (loading) {
    return <p className="text-center py-10 text-lg">Loading...</p>;
  }

  if (!circle) {
    return (
      <div className="py-10 text-center text-red-600 flex items-center justify-center gap-2">
        <AlertCircle size={18} />
        {error || "Circle not found"}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-extrabold text-gray-900">{circle.name}</h1>

              {circle.privacy === "private" ? (
                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 border border-red-200 inline-flex items-center gap-1">
                  <Lock size={12} />
                  Private
                </span>
              ) : (
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-200 inline-flex items-center gap-1">
                  <Globe size={12} />
                  Public
                </span>
              )}

              {canManage ? (
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                  <Shield size={12} />
                  Manager
                </span>
              ) : null}
            </div>

            <p className="text-gray-600 mt-2">{circle.description || "No description"}</p>

            <div className="mt-4 text-sm text-gray-600 flex flex-wrap gap-4">
              <span className="inline-flex items-center gap-2">
                <Users size={16} />
                {circle.membersCount || 0} members
              </span>

              <span className="inline-flex items-center gap-2">
                <Clock3 size={16} />
                Created {fmt(circle.createdAt)}
              </span>

              <span>
                Tag: <b>{circle.conditionTag || "-"}</b>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadPage}
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <Link to="/forum" className="btn-primary">
              Back to Forum
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 border border-red-200 bg-red-50/50 text-red-700 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="glass-card p-4 border border-green-200 bg-green-50/50 text-green-700 flex items-center gap-2">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {!canChat && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Circle Access</h2>

          {myJoinRequestPending ? (
            <p className="text-yellow-700">
              Your join request is pending approval.
            </p>
          ) : (
            <p className="text-gray-700 mb-4">
              Join this circle to read and send messages.
            </p>
          )}

          {!myJoinRequestPending && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="btn-primary"
            >
              {joining ? "Submitting..." : "Join Circle"}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="glass-card p-5 xl:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle className="text-blue-600" />
            Circle Chat
          </h2>

          {!canChat ? (
            <p className="text-gray-600">Join this circle to read and send messages.</p>
          ) : (
            <>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {messagesLoading ? (
                  <p className="text-gray-600">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-gray-600">No messages yet.</p>
                ) : (
                  messages.map((message) => {
                    const mine = idOf(message.author) === meId || idOf(message.author?._id) === meId;

                    return (
                      <div
                        key={message._id}
                        className={`rounded-2xl border p-4 ${
                          mine
                            ? "bg-blue-50 border-blue-200"
                            : "bg-white/60 border-white/40"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-gray-900">
                            {message.author?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">{fmt(message.createdAt)}</p>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          {message.author?.role || "user"}
                          {message.author?.verified ? " • verified" : ""}
                        </p>

                        <p className="mt-3 text-gray-800 whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSendMessage} className="mt-4 space-y-3">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="input-field min-h-[110px]"
                  placeholder="Write a message..."
                />
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="btn-primary flex items-center gap-2"
                >
                  <Send size={16} />
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Circle Info</h3>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <b>Creator:</b> {circle.createdBy?.name || "Unknown"}
              </p>
              <p>
                <b>Privacy:</b> {circle.privacy || "-"}
              </p>
              <p>
                <b>Status:</b> {circle.status || "approved"}
              </p>
              <p>
                <b>Members:</b> {circle.membersCount || 0}
              </p>
              <p>
                <b>Pending requests:</b> {circle.joinRequestsCount || pendingRequests.length || 0}
              </p>
            </div>
          </div>

          {canManage && (
            <div className="glass-card p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Join Requests</h3>

              {pendingRequests.length === 0 ? (
                <p className="text-gray-600">No pending requests.</p>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="rounded-2xl border border-white/40 bg-white/60 p-4"
                    >
                      <p className="font-semibold text-gray-900">
                        {request.user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {request.user?.role || "user"}
                        {request.user?.verified ? " • verified" : ""}
                      </p>

                      {request.reason ? (
                        <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">
                          {request.reason}
                        </p>
                      ) : null}

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleApproveRequest(request._id)}
                          className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle2 size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request._id)}
                          className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {canManage && Array.isArray(circle.members) && circle.members.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Members</h3>

              <div className="space-y-3">
                {circle.members.map((member) => {
                  const memberId = idOf(member);
                  const isMe = memberId === meId;
                  const isCreator = memberId === idOf(circle.createdBy);

                  return (
                    <div
                      key={memberId}
                      className="rounded-2xl border border-white/40 bg-white/60 p-4 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{member.name || "User"}</p>
                        <p className="text-xs text-gray-500">
                          {member.role || "user"}
                          {member.verified ? " • verified" : ""}
                          {isCreator ? " • creator" : ""}
                          {memberId === meId ? " • you" : ""}
                        </p>
                      </div>

                      {!isMe && !isCreator && (
                        <button
                          onClick={() => handleRemoveMember(memberId)}
                          className="px-3 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                        >
                          <UserMinus size={15} />
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}


================================================
FILE: frontend/src/pages/HealthBehaviors.jsx
================================================
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2, Search, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import BehaviorCard from '../components/BehaviorCard';

const HealthBehaviors = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('good');
  const [behaviors, setBehaviors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBehaviors = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/behaviors?type=${activeTab}`);
        setBehaviors(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBehaviors();
  }, [activeTab]);

  // Filter behaviors by search
  const filteredBehaviors = useMemo(() => {
    if (!searchTerm) return behaviors;
    const term = searchTerm.toLowerCase();
    return behaviors.filter(b =>
      b.title[i18n.language]?.toLowerCase().includes(term) ||
      b.description[i18n.language]?.toLowerCase().includes(term)
    );
  }, [behaviors, searchTerm, i18n.language]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-6xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-8 text-center text-dark">
        {t('healthBehaviors.title')}
      </h1>

      {/* Search Bar */}
      <div className="relative mb-8 max-w-md mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder={t('healthBehaviors.searchPlaceholder') || "Search behaviors..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-12 py-3"
        />
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-10">
        <div className="bg-white rounded-full p-1 shadow-md flex">
          <button
            onClick={() => { setActiveTab('good'); setSearchTerm(''); }}
            disabled={isLoading}
            className={`px-8 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
              activeTab === 'good' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ✅ {t('healthBehaviors.recommended')}
          </button>
          <button
            onClick={() => { setActiveTab('bad'); setSearchTerm(''); }}
            disabled={isLoading}
            className={`px-8 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
              activeTab === 'bad' ? 'bg-red-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ⛔ {t('healthBehaviors.restricted')}
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-gray-500">{t('healthBehaviors.loading')}</p>
        </div>
      ) : (
        <>
          {filteredBehaviors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-6xl mb-4">🤔</p>
              <p className="text-gray-500 text-lg">No behaviors found matching your search.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBehaviors.map((behavior) => (
                <BehaviorCard
                  key={behavior._id}
                  behavior={behavior}
                  language={i18n.language}
                />
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default HealthBehaviors;


================================================
FILE: frontend/src/pages/HealthVideos.jsx
================================================
// frontend/src/pages/HealthVideos.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Film, Play, X } from 'lucide-react';

const BASE_URL = 'http://localhost:5000/api';

const HealthVideos = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [videosByCategory, setVideosByCategory] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const catRes = await axios.get(`${BASE_URL}/categories`);
        setCategories(catRes.data);
        
        const videoData = {};
        for (let cat of catRes.data) {
          const videoRes = await axios.get(`${BASE_URL}/videos/category/${cat._id}`);
          videoData[cat._id] = videoRes.data.map(video => ({
            ...video,
            thumbnailUrl: video.thumbnailUrl || getDefaultThumbnail(video.videoUrl)
          }));
        }
        setVideosByCategory(videoData);
      } catch (err) {
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Fallback thumbnail approach: extract from video URL if thumbnail missing
  const getDefaultThumbnail = (videoUrl) => {
    // Assuming Cloudinary URL, replace .mp4 with .jpg for thumbnail
    if (videoUrl.includes('cloudinary')) {
      return videoUrl.replace(/\.[^/.]+$/, ".jpg"); // Replace extension with .jpg
    }
    return 'https://via.placeholder.com/320x180?text=Video';
  };

  if (loading) return <div className="text-center py-10 flex items-center justify-center"><Film className="animate-spin mr-2" />Loading videos...</div>;
  if (error) return <p className="text-red-500 text-center py-10">{error}</p>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 max-w-6xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-8 text-center text-dark flex items-center justify-center">
        <Film className="mr-2" />
        Health Videos
      </h1>
      
      {categories.map((category) => (
        <div key={category._id} className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-secondary">{category.name}</h2>
          <p className="text-gray-600 mb-6">{category.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videosByCategory[category._id]?.map((video) => (
              <motion.div
                key={video._id}
                whileHover={{ scale: 1.05 }}
                className="glass-card cursor-pointer overflow-hidden relative"
                onClick={() => setSelectedVideo(video)}
              >
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title}
                  className="w-full aspect-video object-cover"
                  onError={(e) => {
                    e.target.src = getDefaultThumbnail(video.videoUrl);
                  }}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-all hover:bg-black/40">
                  <Play className="w-16 h-16 text-white opacity-80 hover:opacity-100 transition-opacity" fill="white" />
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2 line-clamp-1">{video.title}</h4>
                  <p className="text-gray-600 text-sm line-clamp-2">{video.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-white/80 rounded-full p-1 hover:bg-white transition-all"
            >
              <X size={24} />
            </button>
            
            <video
              src={selectedVideo.videoUrl}
              controls
              autoPlay
              className="w-full rounded-lg mb-6 max-h-[60vh] shadow-md"
            />
            
            <h3 className="text-2xl font-bold mb-2 text-dark">{selectedVideo.title}</h3>
            <p className="text-gray-600">{selectedVideo.description}</p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HealthVideos;


================================================
FILE: frontend/src/pages/Landing.jsx
================================================
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';

const Landing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Check if user is logged in and redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // If user is logged in, don't render anything (we're redirecting)
  const token = localStorage.getItem('token');
  if (token) {
    return null; // or a small loader if you prefer
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl"
      >
        <HeartPulse className="w-20 h-20 text-primary mx-auto mb-6 animate-pulse" />
        <h1 className="text-5xl font-bold mb-4 text-dark">{t('landing.title')}</h1>
        <p className="text-2xl mb-6 text-gray-700">{t('landing.subtitle')}</p>
        <p className="text-lg mb-10 text-gray-600">{t('landing.description')}</p>
        
        <div className="space-x-6">
          <Link to="/login" className="btn-primary inline-block">
            {t('landing.cta1')}
          </Link>
          <Link 
            to="/register" 
            className="bg-accent text-white py-3 px-6 rounded-full font-semibold shadow-md hover:bg-green-600 transition-all duration-300 transform hover:-translate-y-1 inline-block"
          >
            {t('landing.cta2')}
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Landing;


================================================
FILE: frontend/src/pages/LiveSession.jsx
================================================
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import {
  AlertCircle,
  Radio,
  Clock3,
  Send,
  PlayCircle,
  SkipForward,
  Square,
  Eye,
  Shield,
  Users,
  MessageSquareText,
  ChevronLeft,
} from "lucide-react";
import {
  connectSocket,
  joinLiveSession,
  leaveLiveSession,
} from "../utils/socket";

const fmt = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "";
  }
};

const LiveSession = () => {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [detail, setDetail] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [liveSubmitting, setLiveSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [questionBody, setQuestionBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [liveAnswerText, setLiveAnswerText] = useState("");

  // UI-only draft for later backend expert tips/comments
  const [observerTipDraft, setObserverTipDraft] = useState("");

  const session = detail?.session || null;

  const isHost = useMemo(() => {
    if (!user?._id || !session?.startedBy?._id) return false;
    return String(user._id) === String(session.startedBy._id);
  }, [user, session]);

  const isVerifiedProfessionalObserver = useMemo(() => {
    if (!user) return false;
    const isProfessional = ["doctor", "chw"].includes(user.role) && !!user.verified;
    return isProfessional && !isHost;
  }, [user, isHost]);

  const isPatient = useMemo(() => {
    return !!user && user.role === "patient";
  }, [user]);

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data || null);
    } catch {
      setUser(null);
    }
  }, []);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/forum/live-sessions/${id}`);
      setDetail(res.data || null);
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to load session");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMe();
    fetchDetail();
  }, [fetchMe, fetchDetail]);

  useEffect(() => {
    const s = connectSocket();
    joinLiveSession(id);

    const refresh = async () => {
      try {
        await fetchDetail();
      } catch {}
    };

    const onQueuePosition = (payload) => {
      if (!payload?.sessionId || String(payload.sessionId) !== String(id)) return;
      setDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          userQueuePosition: payload.position,
        };
      });
    };

    s.on("liveSession:started", refresh);
    s.on("liveSession:updated", refresh);
    s.on("liveSession:state", refresh);
    s.on("liveSession:questionQueued", refresh);
    s.on("liveSession:questionActive", refresh);
    s.on("liveSession:questionAnswered", refresh);
    s.on("liveSession:ended", refresh);
    s.on("liveSession:queuePosition", onQueuePosition);

    return () => {
      leaveLiveSession(id);

      s.off("liveSession:started", refresh);
      s.off("liveSession:updated", refresh);
      s.off("liveSession:state", refresh);
      s.off("liveSession:questionQueued", refresh);
      s.off("liveSession:questionActive", refresh);
      s.off("liveSession:questionAnswered", refresh);
      s.off("liveSession:ended", refresh);
      s.off("liveSession:queuePosition", onQueuePosition);
    };
  }, [id, fetchDetail]);

  const submitQuestion = async () => {
    if (!questionBody.trim()) return;

    setSubmittingQuestion(true);
    try {
      await api.post(`/forum/live-sessions/${id}/questions`, {
        body: questionBody.trim(),
        anonymous,
      });
      setQuestionBody("");
      setAnonymous(false);
      await fetchDetail();
      alert("Question submitted");
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to submit question");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const activateNextQuestion = async () => {
    try {
      await api.post(`/forum/live-sessions/${id}/next`);
      await fetchDetail();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to activate next question");
    }
  };

  const answerLiveQuestion = async () => {
    const activeQuestionId = detail?.activeQuestion?._id;
    if (!activeQuestionId || !liveAnswerText.trim()) return;

    setLiveSubmitting(true);
    try {
      await api.post(`/forum/live-sessions/${id}/questions/${activeQuestionId}/answer`, {
        answer: liveAnswerText.trim(),
      });
      setLiveAnswerText("");
      await fetchDetail();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to answer question");
    } finally {
      setLiveSubmitting(false);
    }
  };

  const skipLiveQuestion = async () => {
    const activeQuestionId = detail?.activeQuestion?._id;
    if (!activeQuestionId) return;

    try {
      await api.post(`/forum/live-sessions/${id}/questions/${activeQuestionId}/skip`);
      await fetchDetail();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to skip question");
    }
  };

  const endLiveSession = async () => {
    if (!window.confirm("End this live session?")) return;

    try {
      await api.post(`/forum/live-sessions/${id}/end`);
      await fetchDetail();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to end session");
    }
  };

  if (loading) {
    return <p className="text-center text-lg py-10">Loading...</p>;
  }

  if (error) {
    return (
      <p className="text-red-500 text-center flex items-center justify-center py-10">
        <AlertCircle className="mr-2" />
        {error}
      </p>
    );
  }

  if (!detail || !session) {
    return (
      <div className="glass-card p-6">
        <p className="text-gray-700">Session not found.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Link to="/forum" className="inline-flex items-center gap-2 text-primary">
        <ChevronLeft size={18} />
        Back to forum
      </Link>

      <div className="glass-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {session.status === "live" ? (
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                  <Radio size={12} />
                  LIVE
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1">
                  <Clock3 size={12} />
                  ENDED
                </span>
              )}

              {isHost ? (
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                  <Shield size={12} />
                  Host view
                </span>
              ) : isVerifiedProfessionalObserver ? (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <Eye size={12} />
                  Professional observer
                </span>
              ) : isPatient ? (
                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <Users size={12} />
                  Patient view
                </span>
              ) : null}
            </div>

            <h1 className="text-3xl font-bold text-gray-900">{session.title}</h1>
            <p className="text-gray-600 mt-2">
              {session.description || "Live doctor question-and-answer session"}
            </p>

            <div className="mt-4 text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-medium">Doctor:</span>{" "}
                {session.startedBy?.name || "Doctor"}
              </p>
              <p>
                <span className="font-medium">Category:</span>{" "}
                {session.categoryId?.name || "General"}
              </p>
              <p>
                <span className="font-medium">Started:</span> {fmt(session.startedAt)}
              </p>
              {session.endedAt ? (
                <p>
                  <span className="font-medium">Ended:</span> {fmt(session.endedAt)}
                </p>
              ) : null}
              {session.scheduledEndAt ? (
                <p>
                  <span className="font-medium">Scheduled end:</span>{" "}
                  {fmt(session.scheduledEndAt)}
                </p>
              ) : null}
            </div>
          </div>

          {isHost && session.status === "live" ? (
            <button
              onClick={endLiveSession}
              className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
            >
              <Square size={16} />
              End Session
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
          <p className="text-xs text-gray-500">Queue</p>
          <p className="text-2xl font-bold text-gray-900">{detail.queueCount || 0}</p>
        </div>
        <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
          <p className="text-xs text-gray-500">Answered</p>
          <p className="text-2xl font-bold text-gray-900">{session.answeredCount || 0}</p>
        </div>
        <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{session.totalQuestions || 0}</p>
        </div>
        <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
          <p className="text-xs text-gray-500">Your position</p>
          <p className="text-2xl font-bold text-gray-900">
            {detail.userQueuePosition ?? "-"}
          </p>
        </div>
      </div>

      {isPatient && session.status === "live" && (
        <div className="glass-card p-5">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Ask a Question</h2>

          {detail.currentUserQuestion ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-blue-800 font-medium">
                You already have a question in this session.
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Queue position: {detail.userQueuePosition ?? "-"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={questionBody}
                onChange={(e) => setQuestionBody(e.target.value)}
                className="input-field min-h-[130px]"
                placeholder="Type your question..."
              />

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                />
                Ask anonymously
              </label>

              <button
                onClick={submitQuestion}
                disabled={submittingQuestion || !questionBody.trim()}
                className="btn-primary flex items-center gap-2"
              >
                <Send size={16} />
                {submittingQuestion ? "Submitting..." : "Submit Question"}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="glass-card p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl font-bold text-gray-900">Current Active Question</h2>

          {isHost && session.status === "live" && !detail.activeQuestion ? (
            <button
              onClick={activateNextQuestion}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <PlayCircle size={16} />
              Next Question
            </button>
          ) : null}
        </div>

        {!detail.activeQuestion ? (
          <p className="text-gray-600 mt-3">No active question right now.</p>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-600">
              Asked by {detail.activeQuestion.askedBy?.name || "Anonymous"}
            </p>
            <p className="text-gray-900 whitespace-pre-wrap">{detail.activeQuestion.body}</p>

            {isHost && session.status === "live" ? (
              <>
                <textarea
                  value={liveAnswerText}
                  onChange={(e) => setLiveAnswerText(e.target.value)}
                  className="input-field min-h-[120px]"
                  placeholder="Type the live answer..."
                />

                <div className="flex gap-2">
                  <button
                    onClick={answerLiveQuestion}
                    disabled={liveSubmitting || !liveAnswerText.trim()}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Send size={16} />
                    {liveSubmitting ? "Submitting..." : "Answer"}
                  </button>

                  <button
                    onClick={skipLiveQuestion}
                    className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 flex items-center gap-2"
                  >
                    <SkipForward size={16} />
                    Skip
                  </button>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      {isVerifiedProfessionalObserver && (
        <div className="glass-card p-5">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MessageSquareText size={20} />
            Extra Professional Tips
          </h2>

          <p className="text-sm text-gray-700 mb-3">
            You can watch the live session here as another verified professional.
            Sending extra tips/comments needs a backend route, so this UI is prepared but not
            submitting yet.
          </p>

          <textarea
            value={observerTipDraft}
            onChange={(e) => setObserverTipDraft(e.target.value)}
            className="input-field min-h-[120px]"
            placeholder="Draft an extra professional tip..."
          />

          <button
            type="button"
            disabled
            className="mt-3 px-4 py-2 rounded-xl bg-gray-200 text-gray-500 cursor-not-allowed"
          >
            Needs backend route first
          </button>
        </div>
      )}

      {isHost && Array.isArray(detail.queue) && (
        <div className="glass-card p-5">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Queued Questions</h2>

          {detail.queue.length === 0 ? (
            <p className="text-gray-600">No queued questions.</p>
          ) : (
            <div className="space-y-3">
              {detail.queue.map((question, index) => (
                <div
                  key={question._id}
                  className="border border-white/40 rounded-xl p-3 bg-white/70"
                >
                  <p className="text-xs text-gray-500">Position {index + 1}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {question.askedBy?.name || "Anonymous"}
                  </p>
                  <p className="text-gray-800 whitespace-pre-wrap mt-2">{question.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="glass-card p-5">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Recently Answered</h2>

        {(detail.answeredQuestions || []).length === 0 ? (
          <p className="text-gray-600">No answered questions yet.</p>
        ) : (
          <div className="space-y-3">
            {detail.answeredQuestions.map((question) => (
              <div
                key={question._id}
                className="border border-white/40 rounded-xl p-3 bg-white/70"
              >
                <p className="text-sm text-gray-600">
                  {question.askedBy?.name || "Anonymous"}
                </p>
                <p className="text-gray-900 whitespace-pre-wrap mt-2">{question.body}</p>
                <p className="text-green-700 whitespace-pre-wrap mt-3">{question.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LiveSession;


================================================
FILE: frontend/src/pages/Login.jsx
================================================
// FILE: frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Mail, Lock } from 'lucide-react';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('isAdmin', res.data.isAdmin ? 'true' : 'false');
      localStorage.setItem('role', res.data.role);
      let path = '/dashboard';
      if (res.data.isAdmin) path = '/admin';
      else if (res.data.role === 'doctor') path = '/professional/doctor';
      else if (res.data.role === 'chw') path = '/professional/chw';
      navigate(path);
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-20 p-4"
    >
      <h1 className="text-3xl font-bold mb-8 text-center text-dark">{t('login.title')}</h1>
      <form onSubmit={handleSubmit} className="glass-card space-y-6">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
          <input
            type="email"
            placeholder={t('login.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
          <input
            type="password"
            placeholder={t('login.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button type="submit" className="btn-primary w-full">
          {t('login.button')}
        </button>
      </form>
    </motion.div>
  );
};

export default Login;


================================================
FILE: frontend/src/pages/PastSessions.jsx
================================================
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { ArrowLeft, AlertCircle, Clock3, Search } from "lucide-react";

const fmt = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "";
  }
};

const PastSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/forum/live-sessions?status=past");
      setSessions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.msg || "Failed to load past sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;

    return sessions.filter((session) =>
      `${session.title} ${session.description || ""} ${session.startedBy?.name || ""} ${session.categoryId?.name || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [query, sessions]);

  if (loading) {
    return <p className="text-center text-lg py-10">Loading...</p>;
  }

  if (error) {
    return (
      <p className="text-red-500 text-center flex items-center justify-center py-10">
        <AlertCircle className="mr-2" />
        {error}
      </p>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Link to="/forum" className="inline-flex items-center text-primary">
        <ArrowLeft className="mr-2" />
        Back to Forum
      </Link>

      <div className="glass-card p-6">
        <h1 className="text-3xl font-bold text-gray-900">Past Live Q&amp;A Sessions</h1>
        <p className="text-gray-600 mt-2">
          Review previous doctor question sessions and their answers.
        </p>

        <div className="mt-5 relative max-w-xl">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field pl-11"
            placeholder="Search past sessions..."
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-6">
          <p className="text-gray-600">No past sessions found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((session) => (
            <Link
              key={session._id}
              to={`/live-sessions/${session._id}`}
              className="glass-card p-5 hover:bg-white/60 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-lg">{session.title}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {session.description || "Ended doctor Q&A session"}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                  ENDED
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Doctor:</span>{" "}
                  {session.startedBy?.name || "Doctor"}
                </p>
                <p>
                  <span className="font-medium">Category:</span>{" "}
                  {session.categoryId?.name || "General"}
                </p>
                <p>
                  <span className="font-medium">Started:</span> {fmt(session.startedAt)}
                </p>
                <p>
                  <span className="font-medium">Ended:</span>{" "}
                  {fmt(session.endedAt || session.updatedAt)}
                </p>
                <p className="flex items-center gap-1">
                  <Clock3 size={14} />
                  Answered {session.answeredCount || 0} questions
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PastSessions;


================================================
FILE: frontend/src/pages/Post.jsx
================================================
// FILE: frontend/src/pages/Post.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import {
  ArrowLeft,
  ArrowUp,
  MessageCircle,
  ThumbsUp,
  Flag,
  Send,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

const Post = () => {
  const { id } = useParams()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [commentAnon, setCommentAnon] = useState(false)

  const [user, setUser] = useState(null)

  // Ask on professional post
  const [asking, setAsking] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [questionAnon, setQuestionAnon] = useState(false)
  const [questionLoading, setQuestionLoading] = useState(false)

  // Replies list for this post
  const [replies, setReplies] = useState([])
  const [repliesLoading, setRepliesLoading] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isProfessionalUser = useMemo(() => !!user && ['doctor', 'chw'].includes(user.role) && user.verified, [user])
  const isPatientUser = useMemo(() => !!user && user.role === 'patient', [user])

  const isProfessionalPost = useMemo(() => {
    const a = post?.author
    if (!a) return false
    return ['doctor', 'chw'].includes(a.role) && !!a.verified
  }, [post])

  const canAskOnPost = isPatientUser && isProfessionalPost

  const postCategoryId = useMemo(() => {
    const c = post?.category
    if (!c) return null
    return typeof c === 'string' ? c : c?._id || null
  }, [post])

  const backToCategoryLink = postCategoryId ? `/category/${postCategoryId}` : '/forum'

  const fetchAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [resPost, resUser] = await Promise.all([api.get(`/forum/posts/${id}`), api.get('/auth/profile')])
      setPost(resPost.data)
      setComments(resPost.data.comments || [])
      setUser(resUser.data)
    } catch (e) {
      setError('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const fetchReplies = async () => {
    try {
      setRepliesLoading(true)
      const res = await api.get(`/forum/posts/${id}/replies`)
      setReplies(Array.isArray(res.data) ? res.data : [])
    } catch {
      setReplies([])
    } finally {
      setRepliesLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (post?._id) fetchReplies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?._id])

  const updatePostLocal = (updates) => setPost((prev) => (prev ? { ...prev, ...updates } : prev))

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      const res = await api.post(`/forum/posts/${id}/comments`, {
        content: newComment,
        anonymous: commentAnon,
      })
      setComments((prev) => [...prev, res.data])
      setNewComment('')
      setCommentAnon(false)
    } catch (e) {
      alert(e.response?.data?.msg || 'Failed to add comment')
    }
  }

  const handleUpvote = async () => {
    try {
      const res = await api.post(`/forum/posts/${id}/upvote`)
      updatePostLocal({ upvotes: res.data.upvotes })
    } catch {
      alert('Upvote failed')
    }
  }

  const handleHelpful = async () => {
    try {
      const res = await api.post(`/forum/posts/${id}/mark-helpful`)
      updatePostLocal({ helpful: res.data.helpful })
    } catch (e) {
      alert(e.response?.data?.msg || 'Failed to mark helpful')
    }
  }

  const handleHighlight = async () => {
    try {
      const res = await api.post(`/forum/posts/${id}/highlight`)
      updatePostLocal({ highlighted: res.data.highlighted })
    } catch (e) {
      alert(e.response?.data?.msg || 'Failed to highlight')
    }
  }

  const handleReport = async () => {
    const reason = window.prompt('Please provide a reason for reporting this post:')
    if (!reason) return
    try {
      const res = await api.post(`/forum/posts/${id}/report`, { reason })
      updatePostLocal({ reports: res.data.reports })
      alert('Report submitted successfully. An admin will review it.')
    } catch {
      alert('Failed to submit report.')
    }
  }

  const submitQuestion = async () => {
    if (!questionText.trim()) return
    try {
      setQuestionLoading(true)
      await api.post(`/forum/posts/${id}/question`, { body: questionText, anonymous: questionAnon })
      setQuestionText('')
      setQuestionAnon(false)
      setAsking(false)
      alert('Question sent. It will appear publicly after a professional answers it.')
    } catch (e) {
      alert(e.response?.data?.msg || 'Failed to submit question')
    } finally {
      setQuestionLoading(false)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!post) return <p>Post not found</p>

  const upvoted = user && post.upvotes?.some((pid) => pid?.toString?.() === user._id?.toString?.())
  const helpfulMarked = user && post.helpful?.some((pid) => pid?.toString?.() === user._id?.toString?.())

  const canMarkHelpful =
    isProfessionalUser && post?.author?._id?.toString?.() !== user?._id?.toString?.()
  const canHighlightOwn =
    isProfessionalUser && post?.author?._id?.toString?.() === user?._id?.toString?.()

  const authorLabel = post.anonymous
    ? 'Anonymous'
    : post.author
      ? `${post.author.name} (${post.author.role}${post.author.verified ? ' • Verified' : ''})`
      : 'Unknown User'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6 max-w-4xl mx-auto">
      <Link to={backToCategoryLink} className="flex items-center text-primary">
        <ArrowLeft className="mr-2" /> Back
      </Link>

      {/* Disclaimer */}
      <div className="bg-yellow-100 p-4 rounded-lg flex items-center">
        <AlertTriangle className="mr-2 text-yellow-600" />
        <p className="text-yellow-800">
          This platform is not a replacement for professional, in-person medical care.
        </p>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold break-words">{post.title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              By {authorLabel} • {new Date(post.createdAt).toLocaleString()}
              {post.proType ? (
                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  {String(post.proType).toUpperCase()}
                </span>
              ) : null}
              {post.highlighted ? (
                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                  Highlighted
                </span>
              ) : null}
              {(post.helpful?.length || 0) > 0 ? (
                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                  Helpful
                </span>
              ) : null}
            </p>
          </div>

          {canAskOnPost && (
            <button
              onClick={() => setAsking((v) => !v)}
              className="px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center gap-2 text-sm"
              title="Ask a question on this professional post"
            >
              <HelpCircle size={16} />
              Ask
            </button>
          )}
        </div>

        <p className="mt-4 whitespace-pre-wrap text-gray-800">{post.body}</p>

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-700 items-center">
          <button onClick={handleUpvote} className={`flex items-center gap-1 ${upvoted ? 'text-blue-500' : ''}`}>
            <ArrowUp size={16} /> {post.upvotes?.length || 0}
          </button>

          <span className="flex items-center gap-1">
            <MessageCircle size={16} /> {comments.length}
          </span>

          {canMarkHelpful && (
            <button onClick={handleHelpful} className={`flex items-center gap-1 ${helpfulMarked ? 'text-green-700' : ''}`}>
              <ThumbsUp size={16} /> Helpful ({post.helpful?.length || 0})
            </button>
          )}

          {canHighlightOwn && (
            <button onClick={handleHighlight} className="flex items-center gap-1 text-yellow-700">
              <Sparkles size={16} /> {post.highlighted ? 'Unhighlight' : 'Highlight'}
            </button>
          )}

          <button onClick={handleReport} className="flex items-center gap-1 text-red-500">
            <Flag size={16} /> Report
          </button>
        </div>

        {/* Ask panel */}
        {asking && canAskOnPost && (
          <div className="mt-5 border rounded-xl p-4 bg-white/60">
            <p className="text-sm text-gray-700 mb-2">
              Ask a question about this professional post. The answer becomes public once answered.
            </p>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="input-field w-full min-h-[90px]"
              placeholder="Type your question..."
            />
            <label className="flex items-center gap-2 mt-2 text-sm">
              <input
                type="checkbox"
                checked={questionAnon}
                onChange={(e) => setQuestionAnon(e.target.checked)}
              />
              Ask anonymously
            </label>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={submitQuestion}
                disabled={questionLoading || !questionText.trim()}
                className="btn-primary"
              >
                {questionLoading ? 'Sending...' : 'Send Question'}
              </button>
              <button
                type="button"
                onClick={() => setAsking(false)}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Replies on this post */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Replies (Answered Questions)</h2>

        {repliesLoading ? (
          <p>Loading...</p>
        ) : replies.length === 0 ? (
          <p className="text-gray-600">No answered replies yet.</p>
        ) : (
          <div className="space-y-4">
            {replies.map((q) => {
              const askedByLabel = q.anonymous
                ? 'Anonymous'
                : q.askedBy
                  ? `${q.askedBy.name} (${q.askedBy.role}${q.askedBy.verified ? ' • Verified' : ''})`
                  : 'Unknown'

              const answeredByLabel = q.answeredBy
                ? `${q.answeredBy.name} (${q.answeredBy.role}${q.answeredBy.verified ? ' • Verified' : ''})`
                : 'Professional'

              return (
                <div key={q._id} className="border rounded-xl p-4 bg-white/60">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 size={16} className="text-green-600" />
                      Answered
                    </span>
                    <span>• Asked by {askedByLabel}</span>
                    <span>• Answered by {answeredByLabel}</span>
                  </div>

                  <div className="mt-3">
                    <p className="font-semibold">Question</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{q.body}</p>
                  </div>

                  <div className="mt-3">
                    <p className="font-semibold">Answer</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{q.answer}</p>
                  </div>

                  {q.answeredAt ? (
                    <p className="text-xs text-gray-500 mt-2">
                      Answered on {new Date(q.answeredAt).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Comments</h2>

        {comments.length === 0 ? (
          <p className="text-gray-600">No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c._id} className="border rounded-xl p-4 bg-white/60">
                <p className="text-sm text-gray-600">
                  By {c.anonymous ? 'Anonymous' : c.author?.name || 'Unknown'} ({c.author?.role || 'user'}
                  {c.author?.verified ? ' • Verified' : ''}) • {new Date(c.createdAt).toLocaleString()}
                  {c.isProfessional ? (
                    <span className="ml-2 text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                      Professional opinion
                    </span>
                  ) : null}
                </p>
                <p className="text-gray-800 whitespace-pre-wrap mt-2">{c.content}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleCommentSubmit} className="space-y-3 mt-5">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="input-field w-full min-h-[100px]"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={commentAnon} onChange={(e) => setCommentAnon(e.target.checked)} />
            Comment anonymously
          </label>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Send size={16} /> Post Comment
          </button>
        </form>
      </div>
    </motion.div>
  )
}

export default Post


================================================
FILE: frontend/src/pages/Profile.jsx
================================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import { User, Calendar, Ruler, Scale, Activity, Globe, Save, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    medicalHistory: [],
    isPregnant: false,
    preferredLanguage: localStorage.getItem('lang') || 'en',
    conditions: [],
    interestedIn: []
  });
  const [newHistory, setNewHistory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        const p = res.data.profile || {};
        setProfile({
          age: p.age || '',
          gender: p.gender || '',
          height: p.height || '',
          weight: p.weight || '',
          medicalHistory: p.medicalHistory || [],
          isPregnant: p.isPregnant || false,
          preferredLanguage: p.preferredLanguage || localStorage.getItem('lang') || 'en',
          conditions: p.conditions || [],
          interestedIn: p.interestedIn || []
        });
      } catch (err) {
        setError('Error loading profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addMedicalHistory = () => {
    if (newHistory.trim()) {
      setProfile(prev => ({
        ...prev,
        medicalHistory: [...prev.medicalHistory, newHistory.trim()]
      }));
      setNewHistory('');
    }
  };

  const removeMedicalHistory = (index) => {
    setProfile(prev => ({
      ...prev,
      medicalHistory: prev.medicalHistory.filter((_, i) => i !== index)
    }));
  };

  const calculateBMI = () => {
    if (profile.height && profile.weight) {
      const heightM = profile.height / 100;
      const bmi = (profile.weight / (heightM * heightM)).toFixed(1);
      return bmi;
    }
    return null;
  };

  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-yellow-600 bg-yellow-100' };
    if (bmi < 25) return { text: 'Normal', color: 'text-green-600 bg-green-100' };
    if (bmi < 30) return { text: 'Overweight', color: 'text-orange-600 bg-orange-100' };
    return { text: 'Obese', color: 'text-red-600 bg-red-100' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (profile.age && (profile.age < 1 || profile.age > 120)) {
      setError(t('profile.errorAge'));
      return;
    }
    if (profile.height && (profile.height < 100 || profile.height > 250)) {
      setError(t('profile.errorHeight'));
      return;
    }
    if (profile.weight && (profile.weight < 20 || profile.weight > 300)) {
      setError(t('profile.errorWeight'));
      return;
    }
    try {
      await api.put('/users/profile', {
        age: profile.age || null,
        gender: profile.gender,
        height: profile.height || null,
        weight: profile.weight || null,
        medicalHistory: profile.medicalHistory,
        isPregnant: profile.isPregnant,
        preferredLanguage: profile.preferredLanguage
      });
      localStorage.setItem('lang', profile.preferredLanguage);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.msg || 'Update failed');
    }
  };

  if (loading) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-center">{t('profile.loading')}</motion.div>;

  const bmi = calculateBMI();
  const bmiStatus = bmi ? getBMIStatus(bmi) : null;
  const bmiStatusKey = bmiStatus ? `profile.bmi${bmiStatus.text}` : '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto p-4"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-dark flex items-center justify-center">
        <User className="mr-2" />
        {t('profile.title')}
      </h1>
      {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 mb-4 text-center flex items-center justify-center"><AlertCircle className="mr-2" />{error}</motion.p>}
      {success && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-500 mb-4 text-center">{success}</motion.p>}
      <form onSubmit={handleSubmit} className="glass-card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
            <input
              type="number"
              name="age"
              value={profile.age}
              onChange={handleChange}
              placeholder="e.g., 28"
              className="input-field pl-10"
            />
            <label className="absolute -top-2 left-4 bg-white px-1 text-sm text-gray-600">{t('profile.age')}</label>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('profile.gender')}</label>
            <select
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">{t('profile.select')}</option>
              <option value="male">{t('profile.male')}</option>
              <option value="female">{t('profile.female')}</option>
              <option value="other">{t('profile.other')}</option>
            </select>
          </div>
          <div className="relative">
            <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
            <input
              type="number"
              name="height"
              value={profile.height}
              onChange={handleChange}
              placeholder="e.g., 170"
              className="input-field pl-10"
            />
            <label className="absolute -top-2 left-4 bg-white px-1 text-sm text-gray-600">{t('profile.height')}</label>
          </div>
          <div className="relative">
            <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
            <input
              type="number"
              name="weight"
              value={profile.weight}
              onChange={handleChange}
              placeholder="e.g., 65"
              className="input-field pl-10"
            />
            <label className="absolute -top-2 left-4 bg-white px-1 text-sm text-gray-600">{t('profile.weight')}</label>
          </div>
        </div>
        {bmi && (
          <div className="glass-card p-4 text-center">
            <p className="text-lg font-bold text-dark">{t('profile.bmi', { bmi })}</p>
            <p className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${bmiStatus.color}`}>
              {t(bmiStatusKey)}
            </p>
          </div>
        )}
        {profile.gender === 'female' && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPregnant"
              checked={profile.isPregnant}
              onChange={handleChange}
              className="w-5 h-5 accent-primary"
            />
            <label className="text-gray-700">{t('profile.pregnant')}</label>
          </div>
        )}
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('profile.medicalHistory')}</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
              <input
                type="text"
                value={newHistory}
                onChange={(e) => setNewHistory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedicalHistory())}
                placeholder="e.g., Asthma"
                className="input-field pl-10"
              />
            </div>
            <button
              type="button"
              onClick={addMedicalHistory}
              className="btn-primary px-4"
            >
              {t('profile.addButton')}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.medicalHistory.map((item, i) => (
              <span
                key={i}
                className="bg-neutral px-3 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeMedicalHistory(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('profile.preferredLanguage')}</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
            <select
              name="preferredLanguage"
              value={profile.preferredLanguage}
              onChange={handleChange}
              className="input-field pl-10"
            >
              <option value="en">English</option>
              <option value="rw">Kinyarwanda</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center"
        >
          <Save className="mr-2" size={18} />
          {t('profile.saveButton')}
        </button>
      </form>
    </motion.div>
  );
};

export default Profile;


================================================
FILE: frontend/src/pages/ProfileSetup.jsx
================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
const ProfileSetup = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    isPregnant: false,
    conditions: ''
  });
  const navigate = useNavigate();
  const questions = [
    { key: 'age', type: 'number', placeholder: 'e.g., 28' },
    { key: 'gender', type: 'select', options: ['male', 'female', 'other'] },
    { key: 'height', type: 'number', placeholder: 'e.g., 170' },
    { key: 'weight', type: 'number', placeholder: 'e.g., 65' },
    { key: 'pregnant', type: 'checkbox', condition: profile.gender === 'female' },
    { key: 'conditions', type: 'text', placeholder: 'e.g., diabetes, hypertension' }
  ].filter(q => !q.condition || q.condition);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const nextStep = () => {
    if (step < questions.length - 1) setStep(step + 1);
    else saveProfile();
  };
  const skipStep = () => nextStep();
  const saveProfile = async () => {
    try {
      const updates = {
        age: profile.age || null,
        gender: profile.gender,
        height: profile.height || null,
        weight: profile.weight || null,
        isPregnant: profile.isPregnant,
        conditions: profile.conditions ? profile.conditions.split(',').map(c => c.trim()) : []
      };
      await api.put('/users/profile', updates);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save profile');
    }
  };
  const currentQ = questions[step];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto mt-20 p-4 glass-card"
    >
      <h1 className="text-2xl font-bold mb-6 text-center">{t('profileSetup.title')}</h1>
      <p className="mb-4">{t(`profileSetup.questions.${currentQ.key}`)}</p>
      {currentQ.type === 'select' ? (
        <select name={currentQ.key} value={profile[currentQ.key]} onChange={handleChange} className="input-field">
          <option value="">{t('profile.select')}</option>
          {currentQ.options.map(opt => <option key={opt} value={opt}>{t(`profile.${opt}`)}</option>)}
        </select>
      ) : currentQ.type === 'checkbox' ? (
        <div className="flex items-center gap-2">
          <input type="checkbox" name={currentQ.key} checked={profile[currentQ.key]} onChange={handleChange} className="w-5 h-5 accent-primary" />
          <label>{t('profile.pregnant')}</label>
        </div>
      ) : (
        <input
          type={currentQ.type}
          name={currentQ.key}
          value={profile[currentQ.key]}
          onChange={handleChange}
          placeholder={currentQ.placeholder}
          className="input-field"
        />
      )}
      <div className="flex gap-4 mt-6">
        <button onClick={skipStep} className="btn-primary flex-1 bg-gray-500 hover:bg-gray-600">
          {t('profileSetup.skip')}
        </button>
        <button onClick={nextStep} className="btn-primary flex-1">
          {step === questions.length - 1 ? t('profileSetup.finish') : t('profileSetup.next')}
        </button>
      </div>
    </motion.div>
  );
};
export default ProfileSetup;


================================================
FILE: frontend/src/pages/Register.jsx
================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import { User, Mail, Lock } from 'lucide-react';
const Register = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/profile-setup');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-20 p-4"
    >
      <h1 className="text-3xl font-bold mb-8 text-center text-dark">{t('register.title')}</h1>
      <form onSubmit={handleSubmit} className="glass-card space-y-6">
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
          <input
            type="text"
            placeholder={t('register.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
          <input
            type="email"
            placeholder={t('register.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
          <input
            type="password"
            placeholder={t('register.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button type="submit" className="btn-primary w-full">
          {t('register.button')}
        </button>
      </form>
    </motion.div>
  );
};
export default Register;


================================================
FILE: frontend/src/pages/professional/CHWConsole.jsx
================================================
// FILE: frontend/src/pages/professional/CHWConsole.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../services/api'
import {
  AlertCircle,
  Clock,
  Activity,
  HelpCircle,
  ArrowUpCircle,
  Send,
} from 'lucide-react'

const CHWConsole = () => {
  const [tab, setTab] = useState('questions') // questions | attention | highlights | stats
  const [filter, setFilter] = useState('general') // general | myposts

  const [questions, setQuestions] = useState([])
  const [attentionPosts, setAttentionPosts] = useState([])
  const [highlights, setHighlights] = useState([])
  const [stats, setStats] = useState({ answeredQuestions: 0, avgResponseMinutes: 0 })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // answer UI
  const [answeringId, setAnsweringId] = useState(null)
  const [answerText, setAnswerText] = useState('')
  const [claiming, setClaiming] = useState(false)
  const [answering, setAnswering] = useState(false)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, filter])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      if (tab === 'questions') {
        const res = await api.get(`/professional/questions?filter=${filter}&status=unanswered`)
        setQuestions(Array.isArray(res.data) ? res.data : [])
      }
      if (tab === 'attention') {
        const res = await api.get('/professional/posts-needing-attention')
        setAttentionPosts(Array.isArray(res.data) ? res.data : [])
      }
      if (tab === 'highlights') {
        const res = await api.get('/professional/discussion-highlights')
        setHighlights(Array.isArray(res.data) ? res.data : [])
      }
      if (tab === 'stats') {
        const res = await api.get('/professional/stats')
        setStats(res.data || { answeredQuestions: 0, avgResponseMinutes: 0 })
      }
    } catch (e) {
      setError(e.response?.data?.msg || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const claimQuestion = async (id) => {
    setClaiming(true)
    try {
      await api.post(`/professional/questions/${id}/claim`)
      await fetchData()
    } catch (e) {
      alert(e.response?.data?.msg || 'Claim failed')
    } finally {
      setClaiming(false)
    }
  }

  const submitAnswer = async (id) => {
    if (!answerText.trim()) return
    setAnswering(true)
    try {
      await api.post(`/professional/questions/${id}/answer`, { answer: answerText })
      setAnswerText('')
      setAnsweringId(null)
      await fetchData()
      alert('Answered')
    } catch (e) {
      alert(e.response?.data?.msg || 'Answer failed')
    } finally {
      setAnswering(false)
    }
  }

  const escalateToDoctor = async (postId) => {
    try {
      await api.post(`/forum/posts/${postId}/escalate`)
      alert('Escalated to doctors')
      fetchData()
    } catch (e) {
      alert(e.response?.data?.msg || 'Escalation failed')
    }
  }

  const tabs = [
    { id: 'questions', label: 'Unanswered Questions', icon: HelpCircle },
    { id: 'attention', label: 'Posts Needing Attention', icon: AlertCircle },
    { id: 'highlights', label: 'Discussion Highlights', icon: Clock },
    { id: 'stats', label: 'Stats', icon: Activity },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">CHW Console</h1>
      <p>Professional dashboard</p>

      <div className="flex gap-3 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full flex items-center gap-2 ${
              tab === t.id ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            <t.icon size={18} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'questions' && (
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('general')}
            className={`px-4 py-2 rounded-full ${filter === 'general' ? 'bg-gray-900 text-white' : 'bg-gray-200'}`}
          >
            General
          </button>
          <button
            onClick={() => setFilter('myposts')}
            className={`px-4 py-2 rounded-full ${filter === 'myposts' ? 'bg-gray-900 text-white' : 'bg-gray-200'}`}
          >
            My Posts
          </button>
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Questions */}
      {tab === 'questions' && (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q._id} className="glass-card p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-bold">Question</p>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                  {q.claimActive ? 'claimed' : 'unclaimed'}
                </span>
              </div>

              {q.postId?._id ? (
                <p className="text-sm text-gray-600 mt-1">
                  On post:{' '}
                  <Link to={`/post/${q.postId._id}`} className="text-primary underline">
                    {q.postId.title}
                  </Link>
                </p>
              ) : (
                <p className="text-sm text-gray-600 mt-1">General queue</p>
              )}

              <p className="mt-3 text-gray-800 whitespace-pre-wrap">{q.body}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => claimQuestion(q._id)}
                  className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
                  disabled={claiming}
                >
                  {claiming ? 'Claiming...' : 'Claim'}
                </button>

                <button
                  onClick={() => setAnsweringId((v) => (v === q._id ? null : q._id))}
                  className="btn-primary"
                >
                  Answer
                </button>
              </div>

              {answeringId === q._id && (
                <div className="mt-4 border rounded-xl p-3 bg-white/60">
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    className="input-field w-full min-h-[120px]"
                    placeholder="Write your answer..."
                  />
                  <button
                    onClick={() => submitAnswer(q._id)}
                    className="btn-primary mt-3 flex items-center gap-2"
                    disabled={answering || !answerText.trim()}
                  >
                    <Send size={16} />
                    {answering ? 'Submitting...' : 'Submit Answer'}
                  </button>
                </div>
              )}
            </div>
          ))}
          {questions.length === 0 && !loading && <p>No unanswered questions.</p>}
        </div>
      )}

      {/* Attention posts */}
      {tab === 'attention' && (
        <div className="space-y-4">
          {attentionPosts.map((p) => (
            <div key={p._id} className="glass-card p-4">
              <h3 className="font-bold">{p.title}</h3>
              <p className="text-sm text-gray-600">
                Category: {p.category?.name || 'Unknown'} • {new Date(p.createdAt).toLocaleString()}
              </p>
              <p className="mt-2 text-gray-800 whitespace-pre-wrap">
                {p.body?.length > 200 ? `${p.body.slice(0, 200)}...` : p.body}
              </p>
              <div className="flex gap-2 mt-3">
                <Link to={`/post/${p._id}`} className="btn-primary">
                  Open
                </Link>
                <button onClick={() => escalateToDoctor(p._id)} className="btn-warning flex items-center gap-2">
                  <ArrowUpCircle size={16} /> Escalate to Doctor
                </button>
              </div>
            </div>
          ))}
          {attentionPosts.length === 0 && !loading && <p>No posts needing attention.</p>}
        </div>
      )}

      {/* Highlights */}
      {tab === 'highlights' && (
        <div className="space-y-4">
          {highlights.map((c) => (
            <div key={c._id} className="glass-card p-4">
              <p className="text-sm text-gray-600">
                Discussion:{' '}
                <Link to={`/discussion/${c.discussion?._id}`} className="text-primary underline">
                  {c.discussion?.title || 'Open'}
                </Link>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                By {c.author?.name || 'Unknown'} • {new Date(c.createdAt).toLocaleString()}
              </p>
              <p className="mt-2 text-gray-800 whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
          {highlights.length === 0 && !loading && <p>No highlights yet.</p>}
        </div>
      )}

      {/* Stats */}
      {tab === 'stats' && (
        <div className="glass-card p-4 space-y-2">
          <p>Answered questions: {stats.answeredQuestions}</p>
          <p>Average response time: {stats.avgResponseMinutes} minutes</p>
        </div>
      )}

      <Link to="/dashboard" className="btn-primary">
        Go to User Dashboard
      </Link>
    </motion.div>
  )
}

export default CHWConsole


================================================
FILE: frontend/src/pages/professional/DoctorConsole.jsx
================================================
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";
import {
  AlertCircle,
  Clock,
  Activity,
  HelpCircle,
  Send,
  Radio,
  PlayCircle,
  SkipForward,
  Square,
  PlusCircle,
  Eye,
  Shield,
  Users,
  MessageSquareText,
} from "lucide-react";
import {
  connectSocket,
  joinLiveSession,
  leaveLiveSession,
  joinDoctors,
  leaveDoctors,
  joinProfessionals,
  leaveProfessionals,
} from "../../utils/socket";

const fmt = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "";
  }
};

const DoctorConsole = () => {
  const [user, setUser] = useState(null);

  const [tab, setTab] = useState("questions");
  const [filter, setFilter] = useState("general");

  const [questions, setQuestions] = useState([]);
  const [attentionPosts, setAttentionPosts] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [stats, setStats] = useState({
    answeredQuestions: 0,
    avgResponseMinutes: 0,
  });

  const [liveSessions, setLiveSessions] = useState([]);
  const [selectedLiveId, setSelectedLiveId] = useState("");
  const [liveDetail, setLiveDetail] = useState(null);
  const [forumCategories, setForumCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [answeringId, setAnsweringId] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [answering, setAnswering] = useState(false);

  const [liveAnswerText, setLiveAnswerText] = useState("");
  const [liveSubmitting, setLiveSubmitting] = useState(false);
  const [startingLive, setStartingLive] = useState(false);

  // UI-only draft for future backend tip feature
  const [observerTipDraft, setObserverTipDraft] = useState("");

  const [newLiveSession, setNewLiveSession] = useState({
    title: "",
    description: "",
    categoryId: "",
    scheduledEndAt: "",
  });

  const activeLiveSession = useMemo(() => {
    return (
      liveSessions.find((session) => String(session._id) === String(selectedLiveId)) || null
    );
  }, [liveSessions, selectedLiveId]);

  const isHostOfSelectedSession = useMemo(() => {
    const starterId =
      liveDetail?.session?.startedBy?._id || activeLiveSession?.startedBy?._id || "";
    return !!user?._id && String(starterId) === String(user._id);
  }, [user, liveDetail, activeLiveSession]);

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data || null);
    } catch {
      setUser(null);
    }
  }, []);

  const fetchQuestions = useCallback(async () => {
    const res = await api.get(`/professional/questions?filter=${filter}&status=unanswered`);
    setQuestions(Array.isArray(res.data) ? res.data : []);
  }, [filter]);

  const fetchAttentionPosts = useCallback(async () => {
    const res = await api.get("/professional/posts-needing-attention");
    setAttentionPosts(Array.isArray(res.data) ? res.data : []);
  }, []);

  const fetchHighlights = useCallback(async () => {
    const res = await api.get("/professional/discussion-highlights");
    setHighlights(Array.isArray(res.data) ? res.data : []);
  }, []);

  const fetchStats = useCallback(async () => {
    const res = await api.get("/professional/stats");
    setStats(res.data || { answeredQuestions: 0, avgResponseMinutes: 0 });
  }, []);

  const fetchForumCategories = useCallback(async () => {
    const res = await api.get("/forum/categories");
    const items = Array.isArray(res.data) ? res.data : [];
    setForumCategories(items);

    setNewLiveSession((prev) => ({
      ...prev,
      categoryId: prev.categoryId || items[0]?._id || "",
    }));
  }, []);

  const fetchLiveSessions = useCallback(async () => {
    const res = await api.get("/forum/live-sessions?status=live");
    const items = Array.isArray(res.data) ? res.data : [];
    setLiveSessions(items);

    if (!selectedLiveId && items[0]?._id) {
      setSelectedLiveId(items[0]._id);
    }

    if (
      selectedLiveId &&
      items.length > 0 &&
      !items.some((item) => String(item._id) === String(selectedLiveId))
    ) {
      setSelectedLiveId(items[0]._id);
    }

    if (items.length === 0) {
      setSelectedLiveId("");
      setLiveDetail(null);
    }
  }, [selectedLiveId]);

  const fetchLiveDetail = useCallback(async () => {
    if (!selectedLiveId) {
      setLiveDetail(null);
      return;
    }

    const res = await api.get(`/forum/live-sessions/${selectedLiveId}`);
    setLiveDetail(res.data || null);
  }, [selectedLiveId]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        if (tab === "questions") await fetchQuestions();
        if (tab === "attention") await fetchAttentionPosts();
        if (tab === "highlights") await fetchHighlights();
        if (tab === "stats") await fetchStats();
        if (tab === "live") {
          await Promise.all([fetchLiveSessions(), fetchForumCategories(), fetchMe()]);
        }
      } catch (e) {
        setError(e.response?.data?.msg || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [
    tab,
    filter,
    fetchQuestions,
    fetchAttentionPosts,
    fetchHighlights,
    fetchStats,
    fetchLiveSessions,
    fetchForumCategories,
    fetchMe,
  ]);

  useEffect(() => {
    if (tab === "live" && selectedLiveId) {
      fetchLiveDetail().catch(() => {});
    }
  }, [tab, selectedLiveId, fetchLiveDetail]);

  useEffect(() => {
    const s = connectSocket();

    joinDoctors();
    joinProfessionals();

    const refreshQuestions = async () => {
      if (tab === "questions") {
        try {
          await fetchQuestions();
        } catch {}
      }
    };

    const refreshLive = async () => {
      if (tab !== "live") return;

      try {
        await fetchLiveSessions();
        if (selectedLiveId) {
          await fetchLiveDetail();
        }
      } catch {}
    };

    s.on("question:answered", refreshQuestions);
    s.on("liveSession:started", refreshLive);
    s.on("liveSession:updated", refreshLive);
    s.on("liveSession:state", refreshLive);
    s.on("liveSession:questionQueued", refreshLive);
    s.on("liveSession:questionActive", refreshLive);
    s.on("liveSession:questionAnswered", refreshLive);
    s.on("liveSession:ended", refreshLive);

    return () => {
      leaveDoctors();
      leaveProfessionals();

      s.off("question:answered", refreshQuestions);
      s.off("liveSession:started", refreshLive);
      s.off("liveSession:updated", refreshLive);
      s.off("liveSession:state", refreshLive);
      s.off("liveSession:questionQueued", refreshLive);
      s.off("liveSession:questionActive", refreshLive);
      s.off("liveSession:questionAnswered", refreshLive);
      s.off("liveSession:ended", refreshLive);
    };
  }, [tab, selectedLiveId, fetchQuestions, fetchLiveSessions, fetchLiveDetail]);

  useEffect(() => {
    if (!selectedLiveId) return;

    joinLiveSession(selectedLiveId);

    return () => {
      leaveLiveSession(selectedLiveId);
    };
  }, [selectedLiveId]);

  const claimQuestion = async (id) => {
    setClaiming(true);
    try {
      await api.post(`/professional/questions/${id}/claim`);
      await fetchQuestions();
    } catch (e) {
      alert(e.response?.data?.msg || "Claim failed");
    } finally {
      setClaiming(false);
    }
  };

  const submitAnswer = async (id) => {
    if (!answerText.trim()) return;

    setAnswering(true);
    try {
      await api.post(`/professional/questions/${id}/answer`, {
        answer: answerText.trim(),
      });
      setAnswerText("");
      setAnsweringId(null);
      await fetchQuestions();
      alert("Answered");
    } catch (e) {
      alert(e.response?.data?.msg || "Answer failed");
    } finally {
      setAnswering(false);
    }
  };

  const markResolved = async (postId) => {
    try {
      await api.post(`/forum/posts/${postId}/resolve`);
      await fetchAttentionPosts();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed");
    }
  };

  const startLiveSession = async (e) => {
    e.preventDefault();
    if (!newLiveSession.title.trim()) return;

    setStartingLive(true);
    try {
      const payload = {
        title: newLiveSession.title.trim(),
        description: newLiveSession.description.trim(),
        categoryId: newLiveSession.categoryId || null,
        scheduledEndAt: newLiveSession.scheduledEndAt
          ? new Date(newLiveSession.scheduledEndAt).toISOString()
          : null,
      };

      const res = await api.post("/forum/live-sessions", payload);
      const created = res.data;

      setNewLiveSession({
        title: "",
        description: "",
        categoryId: forumCategories[0]?._id || "",
        scheduledEndAt: "",
      });

      await fetchLiveSessions();
      if (created?._id) {
        setSelectedLiveId(created._id);
      }
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to start live session");
    } finally {
      setStartingLive(false);
    }
  };

  const activateNextQuestion = async () => {
    if (!selectedLiveId) return;

    try {
      await api.post(`/forum/live-sessions/${selectedLiveId}/next`);
      await fetchLiveDetail();
      await fetchLiveSessions();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to activate next question");
    }
  };

  const answerLiveQuestion = async () => {
    const activeQuestionId = liveDetail?.activeQuestion?._id;
    if (!selectedLiveId || !activeQuestionId || !liveAnswerText.trim()) return;

    setLiveSubmitting(true);
    try {
      await api.post(
        `/forum/live-sessions/${selectedLiveId}/questions/${activeQuestionId}/answer`,
        { answer: liveAnswerText.trim() }
      );
      setLiveAnswerText("");
      await fetchLiveDetail();
      await fetchLiveSessions();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to answer live question");
    } finally {
      setLiveSubmitting(false);
    }
  };

  const skipLiveQuestion = async () => {
    const activeQuestionId = liveDetail?.activeQuestion?._id;
    if (!selectedLiveId || !activeQuestionId) return;

    try {
      await api.post(
        `/forum/live-sessions/${selectedLiveId}/questions/${activeQuestionId}/skip`
      );
      await fetchLiveDetail();
      await fetchLiveSessions();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to skip question");
    }
  };

  const endLiveSession = async () => {
    if (!selectedLiveId) return;
    if (!window.confirm("End this live session?")) return;

    try {
      await api.post(`/forum/live-sessions/${selectedLiveId}/end`);
      await fetchLiveSessions();
      setLiveDetail(null);
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to end live session");
    }
  };

  const tabs = [
    { id: "questions", label: "Unanswered Questions", icon: HelpCircle },
    { id: "attention", label: "Posts Needing Attention", icon: AlertCircle },
    { id: "highlights", label: "Discussion Highlights", icon: Clock },
    { id: "live", label: "Live Sessions", icon: Radio },
    { id: "stats", label: "Stats", icon: Activity },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">Doctor Console</h1>
      <p>Professional dashboard</p>

      <div className="flex gap-3 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`px-4 py-2 rounded-full flex items-center gap-2 ${
              tab === item.id ? "bg-primary text-white" : "bg-gray-200"
            }`}
          >
            <item.icon size={18} /> {item.label}
          </button>
        ))}
      </div>

      {tab === "questions" && (
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("general")}
            className={`px-4 py-2 rounded-full ${
              filter === "general" ? "bg-gray-900 text-white" : "bg-gray-200"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setFilter("myposts")}
            className={`px-4 py-2 rounded-full ${
              filter === "myposts" ? "bg-gray-900 text-white" : "bg-gray-200"
            }`}
          >
            My Posts
          </button>
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {tab === "questions" && (
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question._id} className="glass-card p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-bold">Question</p>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                  {question.claimActive ? "claimed" : "unclaimed"}
                </span>
              </div>

              {question.postId?._id ? (
                <p className="text-sm text-gray-600 mt-1">
                  On post:{" "}
                  <Link to={`/post/${question.postId._id}`} className="text-primary underline">
                    {question.postId.title}
                  </Link>
                </p>
              ) : (
                <p className="text-sm text-gray-600 mt-1">General queue</p>
              )}

              <p className="mt-3 text-gray-800 whitespace-pre-wrap">{question.body}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => claimQuestion(question._id)}
                  className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
                  disabled={claiming}
                >
                  {claiming ? "Claiming..." : "Claim"}
                </button>

                <button
                  onClick={() =>
                    setAnsweringId((prev) => (prev === question._id ? null : question._id))
                  }
                  className="btn-primary"
                >
                  Answer
                </button>
              </div>

              {answeringId === question._id && (
                <div className="mt-4 border rounded-xl p-3 bg-white/60">
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    className="input-field w-full min-h-[120px]"
                    placeholder="Write your answer..."
                  />
                  <button
                    onClick={() => submitAnswer(question._id)}
                    className="btn-primary mt-3 flex items-center gap-2"
                    disabled={answering || !answerText.trim()}
                  >
                    <Send size={16} />
                    {answering ? "Submitting..." : "Submit Answer"}
                  </button>
                </div>
              )}
            </div>
          ))}

          {questions.length === 0 && !loading && <p>No unanswered questions.</p>}
        </div>
      )}

      {tab === "attention" && (
        <div className="space-y-4">
          {attentionPosts.map((post) => (
            <div key={post._id} className="glass-card p-4">
              <h3 className="font-bold">{post.title}</h3>
              <p className="text-sm text-gray-600">
                Category: {post.category?.name || "Unknown"} • {fmt(post.createdAt)}
              </p>
              <p className="mt-2 text-gray-800 whitespace-pre-wrap">
                {post.body?.length > 200 ? `${post.body.slice(0, 200)}...` : post.body}
              </p>
              <div className="flex gap-2 mt-3">
                <Link to={`/post/${post._id}`} className="btn-primary">
                  Open
                </Link>
                <button
                  onClick={() => markResolved(post._id)}
                  className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
                >
                  Mark handled
                </button>
              </div>
            </div>
          ))}
          {attentionPosts.length === 0 && !loading && <p>No posts needing attention.</p>}
        </div>
      )}

      {tab === "highlights" && (
        <div className="space-y-4">
          {highlights.map((comment) => (
            <div key={comment._id} className="glass-card p-4">
              <p className="text-sm text-gray-600">
                Discussion:{" "}
                <Link to={`/discussion/${comment.discussion?._id}`} className="text-primary underline">
                  {comment.discussion?.title || "Open"}
                </Link>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                By {comment.author?.name || "Unknown"} • {fmt(comment.createdAt)}
              </p>
              <p className="mt-2 text-gray-800 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
          {highlights.length === 0 && !loading && <p>No highlights yet.</p>}
        </div>
      )}

      {tab === "live" && (
        <div className="space-y-6">
          <div className="glass-card p-5">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PlusCircle className="text-blue-600" />
              Start Live Session
            </h2>

            <form onSubmit={startLiveSession} className="space-y-3">
              <input
                className="input-field"
                placeholder="Session title"
                value={newLiveSession.title}
                onChange={(e) =>
                  setNewLiveSession((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />

              <textarea
                className="input-field min-h-[90px]"
                placeholder="Description"
                value={newLiveSession.description}
                onChange={(e) =>
                  setNewLiveSession((prev) => ({ ...prev, description: e.target.value }))
                }
              />

              <select
                className="input-field"
                value={newLiveSession.categoryId}
                onChange={(e) =>
                  setNewLiveSession((prev) => ({ ...prev, categoryId: e.target.value }))
                }
              >
                <option value="">General</option>
                {forumCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Scheduled end time (optional)
                </label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={newLiveSession.scheduledEndAt}
                  onChange={(e) =>
                    setNewLiveSession((prev) => ({
                      ...prev,
                      scheduledEndAt: e.target.value,
                    }))
                  }
                />
              </div>

              <button
                type="submit"
                disabled={startingLive || !newLiveSession.title.trim()}
                className="btn-primary"
              >
                {startingLive ? "Starting..." : "Start Session"}
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="glass-card p-5 xl:col-span-1">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Active Sessions</h2>

              {liveSessions.length === 0 ? (
                <p className="text-gray-600">No live sessions right now.</p>
              ) : (
                <div className="space-y-3">
                  {liveSessions.map((session) => {
                    const mine =
                      !!user?._id && String(session.startedBy?._id) === String(user._id);

                    return (
                      <button
                        key={session._id}
                        onClick={() => setSelectedLiveId(session._id)}
                        className={`w-full text-left rounded-2xl border p-4 transition ${
                          String(selectedLiveId) === String(session._id)
                            ? "bg-blue-50 border-blue-300"
                            : "bg-white/60 border-white/40 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-gray-900">{session.title}</p>
                          {mine ? (
                            <span className="text-[11px] px-2 py-1 rounded-full bg-green-100 text-green-700">
                              Host
                            </span>
                          ) : (
                            <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                              Observer
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mt-1">
                          {session.categoryId?.name || "General"}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Started {fmt(session.startedAt)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="glass-card p-5 xl:col-span-2">
              {!activeLiveSession || !liveDetail ? (
                <p className="text-gray-600">Select a live session to view it.</p>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Radio className="text-red-500" />
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                          LIVE
                        </span>

                        {isHostOfSelectedSession ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                            <Shield size={12} />
                            Host controls
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <Eye size={12} />
                            Observer view
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl font-bold text-gray-900">
                        {activeLiveSession.title}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {activeLiveSession.description || "Live question session"}
                      </p>
                    </div>

                    {isHostOfSelectedSession ? (
                      <button
                        onClick={endLiveSession}
                        className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                      >
                        <Square size={16} />
                        End Session
                      </button>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
                      <p className="text-xs text-gray-500">Queue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {liveDetail.queueCount || 0}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
                      <p className="text-xs text-gray-500">Answered</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {activeLiveSession.answeredCount || 0}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {activeLiveSession.totalQuestions || 0}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
                      <p className="text-xs text-gray-500">Started</p>
                      <p className="text-sm font-bold text-gray-900">
                        {fmt(activeLiveSession.startedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/60 rounded-2xl border border-white/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-bold text-gray-900">Current Active Question</h3>

                      {isHostOfSelectedSession && !liveDetail.activeQuestion ? (
                        <button
                          onClick={activateNextQuestion}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                        >
                          <PlayCircle size={16} />
                          Next Question
                        </button>
                      ) : null}
                    </div>

                    {!liveDetail.activeQuestion ? (
                      <p className="text-gray-600 mt-3">No active question right now.</p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        <p className="text-sm text-gray-600">
                          Asked by {liveDetail.activeQuestion.askedBy?.name || "Anonymous"}
                        </p>

                        <p className="text-gray-900 whitespace-pre-wrap">
                          {liveDetail.activeQuestion.body}
                        </p>

                        {isHostOfSelectedSession ? (
                          <>
                            <textarea
                              value={liveAnswerText}
                              onChange={(e) => setLiveAnswerText(e.target.value)}
                              className="input-field min-h-[120px]"
                              placeholder="Type the live answer..."
                            />

                            <div className="flex gap-2">
                              <button
                                onClick={answerLiveQuestion}
                                disabled={liveSubmitting || !liveAnswerText.trim()}
                                className="btn-primary flex items-center gap-2"
                              >
                                <Send size={16} />
                                {liveSubmitting ? "Submitting..." : "Answer"}
                              </button>

                              <button
                                onClick={skipLiveQuestion}
                                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 flex items-center gap-2"
                              >
                                <SkipForward size={16} />
                                Skip
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                            <p className="text-sm text-blue-800">
                              You are viewing this session as another doctor. You can follow the
                              live flow here, but only the hosting doctor can activate, answer,
                              skip, or end questions with the current backend.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {isHostOfSelectedSession ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <div className="bg-white/60 rounded-2xl border border-white/40 p-4">
                        <h3 className="font-bold text-gray-900 mb-3">Queued Questions</h3>

                        {(liveDetail.queue || []).length === 0 ? (
                          <p className="text-gray-600">No queued questions.</p>
                        ) : (
                          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                            {liveDetail.queue.map((question, index) => (
                              <div
                                key={question._id}
                                className="border border-white/40 rounded-xl p-3 bg-white/70"
                              >
                                <p className="text-xs text-gray-500">Position {index + 1}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {question.askedBy?.name || "Anonymous"}
                                </p>
                                <p className="text-gray-800 whitespace-pre-wrap mt-2">
                                  {question.body}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="bg-white/60 rounded-2xl border border-white/40 p-4">
                        <h3 className="font-bold text-gray-900 mb-3">Recently Answered</h3>

                        {(liveDetail.answeredQuestions || []).length === 0 ? (
                          <p className="text-gray-600">No answers yet.</p>
                        ) : (
                          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                            {liveDetail.answeredQuestions.map((question) => (
                              <div
                                key={question._id}
                                className="border border-white/40 rounded-xl p-3 bg-white/70"
                              >
                                <p className="text-sm text-gray-600">
                                  {question.askedBy?.name || "Anonymous"}
                                </p>
                                <p className="text-gray-900 whitespace-pre-wrap mt-2">
                                  {question.body}
                                </p>
                                <p className="text-green-700 whitespace-pre-wrap mt-3">
                                  {question.answer}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <div className="bg-white/60 rounded-2xl border border-white/40 p-4">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Users size={18} />
                          Observer View
                        </h3>
                        <p className="text-sm text-gray-700">
                          You can monitor what is happening in real time, open the public session,
                          and review answered questions.
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          Queue details are intentionally reserved for the hosting doctor or admin,
                          matching your backend access control.
                        </p>
                      </div>

                      <div className="bg-white/60 rounded-2xl border border-white/40 p-4">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <MessageSquareText size={18} />
                          Additional Doctor Tips
                        </h3>

                        <textarea
                          value={observerTipDraft}
                          onChange={(e) => setObserverTipDraft(e.target.value)}
                          className="input-field min-h-[120px]"
                          placeholder="Draft an extra professional tip..."
                        />

                        <button
                          type="button"
                          disabled
                          className="mt-3 px-4 py-2 rounded-xl bg-gray-200 text-gray-500 cursor-not-allowed"
                        >
                          Needs backend route first
                        </button>

                        <p className="text-xs text-gray-500 mt-2">
                          To make this submit for real, add a backend endpoint for live session
                          expert tips/comments.
                        </p>
                      </div>

                      <div className="bg-white/60 rounded-2xl border border-white/40 p-4 xl:col-span-2">
                        <h3 className="font-bold text-gray-900 mb-3">Recently Answered</h3>

                        {(liveDetail.answeredQuestions || []).length === 0 ? (
                          <p className="text-gray-600">No answers yet.</p>
                        ) : (
                          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                            {liveDetail.answeredQuestions.map((question) => (
                              <div
                                key={question._id}
                                className="border border-white/40 rounded-xl p-3 bg-white/70"
                              >
                                <p className="text-sm text-gray-600">
                                  {question.askedBy?.name || "Anonymous"}
                                </p>
                                <p className="text-gray-900 whitespace-pre-wrap mt-2">
                                  {question.body}
                                </p>
                                <p className="text-green-700 whitespace-pre-wrap mt-3">
                                  {question.answer}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Link
                    to={`/live-sessions/${activeLiveSession._id}`}
                    className="inline-flex items-center text-primary"
                  >
                    Open public session view
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "stats" && (
        <div className="glass-card p-4 space-y-2">
          <p>Answered questions: {stats.answeredQuestions}</p>
          <p>Average response time: {stats.avgResponseMinutes} minutes</p>
        </div>
      )}

      <Link to="/dashboard" className="btn-primary">
        Go to User Dashboard
      </Link>
    </motion.div>
  );
};

export default DoctorConsole;


================================================
FILE: frontend/src/services/api.js
================================================
// frontend/src/services/api.js
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers.token = token;
    config.headers["x-access-token"] = token;
  }
  return config;
});

export const getApiBase = () => API_BASE_URL;

export default api;


================================================
FILE: frontend/src/utils/socket.js
================================================
import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000";

let socket = null;

const emitAuth = () => {
  const token = localStorage.getItem("token");
  if (socket && token) {
    socket.emit("auth", { token });
  }
};

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
    });

    socket.on("connect", () => {
      emitAuth();
    });
  }

  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  else emitAuth();
  return s;
};

export const joinGroup = (groupId) => getSocket().emit("joinGroup", groupId);
export const leaveGroup = (groupId) => getSocket().emit("leaveGroup", groupId);

export const joinCircle = (circleId) => getSocket().emit("joinCircle", circleId);
export const leaveCircle = (circleId) => getSocket().emit("leaveCircle", circleId);

export const joinCategory = (categoryId) => getSocket().emit("joinCategory", categoryId);
export const leaveCategory = (categoryId) => getSocket().emit("leaveCategory", categoryId);

export const joinPost = (postId) => getSocket().emit("joinPost", postId);
export const leavePost = (postId) => getSocket().emit("leavePost", postId);

export const joinDiscussion = (discussionId) => getSocket().emit("joinDiscussion", discussionId);
export const leaveDiscussion = (discussionId) => getSocket().emit("leaveDiscussion", discussionId);

export const joinLiveSession = (sessionId) => getSocket().emit("joinLiveSession", sessionId);
export const leaveLiveSession = (sessionId) => getSocket().emit("leaveLiveSession", sessionId);

export const joinUserRoom = (userId) => getSocket().emit("joinUser", userId);
export const leaveUserRoom = (userId) => getSocket().emit("leaveUser", userId);

export const joinAdmin = () => getSocket().emit("joinAdmin");
export const leaveAdmin = () => getSocket().emit("leaveAdmin");

export const joinProfessionals = () => getSocket().emit("joinProfessionals");
export const leaveProfessionals = () => getSocket().emit("leaveProfessionals");

export const joinDoctors = () => getSocket().emit("joinDoctors");
export const leaveDoctors = () => getSocket().emit("leaveDoctors");

