import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <Link to="/" className="text-xl font-bold">{t('navbar.brand')}</Link>
      <div className="flex items-center gap-4">
        {token ? (
          <>
            <Link to="/dashboard">{t('navbar.dashboard')}</Link>
            <button onClick={logout}>{t('navbar.logout')}</button>
          </>
        ) : (
          <>
            <Link to="/login">{t('navbar.login')}</Link>
            <Link to="/register">{t('navbar.register')}</Link>
          </>
        )}
        <select
          value={i18n.language}
          onChange={changeLang}
          className="bg-white text-black p-1 rounded"
        >
          <option value="en">English</option>
          <option value="rw">Kinyarwanda</option>
          <option value="fr">Français</option>
        </select>
      </div>
    </nav>
  );
};

export default Navbar;
