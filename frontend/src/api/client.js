import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('hb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hb_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export function getISOWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', color: '#C13584' },
  { value: 'tiktok', label: 'TikTok', color: '#010101' },
  { value: 'youtube', label: 'YouTube', color: '#FF0000' },
  { value: 'website', label: 'Website', color: '#2563EB' },
  { value: 'threads', label: 'Threads', color: '#000000' }
];

export const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'entertaining', label: 'Entertaining' },
  { value: 'inspirational', label: 'Inspirational' }
];

export const STYLE_OPTIONS = [
  { value: 'educational', label: 'Educational' },
  { value: 'storytelling', label: 'Storytelling' },
  { value: 'how-to', label: 'How-to' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'news', label: 'News' }
];
