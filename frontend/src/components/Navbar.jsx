import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, User, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const changeLang = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
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
              <Link to="/dashboard" className="nav-link">{t('navbar.dashboard')}</Link>
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