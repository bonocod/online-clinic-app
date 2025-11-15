// src/pages/Landing.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const lang = localStorage.getItem('lang') || 'en';

  // Simple multilingual text (expand as needed)
  const texts = {
    en: {
      title: "Welcome to Online Clinic",
      subtitle: "Track your health, check symptoms, learn about diseases",
      cta1: "Login",
      cta2: "Register",
      description: "Your personal health assistant. Get insights in English, Kinyarwanda, or French."
    },
    rw: {
      title: "Murakaza neza mu Ikipe y'Abaganga ku Interneti",
      subtitle: "Kurikira umurimo w'umubiri wawe, kureba ibimenyetso, kwiga ibyerekeye indwara",
      cta1: "Winjira",
      cta2: "Iyandikishe",
      description: "Umufasha wawe w'umubiri. Pata amakuru mu Icyongereza, Ikinyarwanda, cyangwa Igifaransa."
    },
    fr: {
      title: "Bienvenue à la Clinique en Ligne",
      subtitle: "Suivez votre santé, vérifiez les symptômes, apprenez sur les maladies",
      cta1: "Se connecter",
      cta2: "S'inscrire",
      description: "Votre assistant santé personnel. Obtenez des insights en anglais, kinyarwanda ou français."
    }
  };

  const t = texts[lang] || texts.en;

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4 bg-blue-50">
      <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
      <p className="text-xl mb-8">{t.subtitle}</p>
      <p className="text-lg mb-8">{t.description}</p>
      <div className="space-x-4">
        <Link to="/login" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
          {t.cta1}
        </Link>
        <Link to="/register" className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700">
          {t.cta2}
        </Link>
      </div>
    </div>
  );
};

export default Landing;