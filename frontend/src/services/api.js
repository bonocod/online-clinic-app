import axios from 'axios';
import i18n from '../i18n';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Sending token:', token);
  }

  const lang = i18n.language || 'en';
  config.headers['Accept-Language'] = lang;
  return config;
});

export default api;
