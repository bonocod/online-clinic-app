import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Sending token:', token);  // ADD THIS
  }

  const lang = localStorage.getItem('lang') || 'en';
  config.headers['Accept-Language'] = lang;
  return config;
});

export default api;