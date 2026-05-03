import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Generate or retrieve a persistent device ID
function getDeviceId() {
  let id = localStorage.getItem('device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('device_id', id);
  }
  return id;
}

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  config.headers['X-Device-ID'] = getDeviceId();
  return config;
});

// Daily
export const getBosses       = ()        => api.get('/api/daily/bosses');
export const getTodaySession = ()        => api.get('/api/daily/session');
export const selectBoss      = (boss_id) => api.post('/api/daily/select-boss', { boss_id });

// Todos
export const getTodos   = ()          => api.get('/api/todo/');
export const createTodo = (task_name) => api.post('/api/todo/', { task_name });
export const tickTodo   = (id)        => api.patch(`/api/todo/tick/${id}`);
export const deleteTodo = (id)        => api.delete(`/api/todo/${id}`);
