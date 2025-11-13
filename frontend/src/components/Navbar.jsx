import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  const token = localStorage.getItem('token');

  const changeLang = (newLang) => {
    localStorage.setItem('lang', newLang);
    setLang(newLang);
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <Link to="/" className="text-xl font-bold">Online Clinic</Link>
      <div className="flex items-center gap-4">
        {token ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        <select
          value={lang}
          onChange={(e) => changeLang(e.target.value)}
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