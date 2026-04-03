import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
});

// Debug token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export const authAPI = {
  signup: (data) => API.post('/auth/signup', data),
  login: (data) => API.post('/auth/login', data),
  getProfile: () => API.get('/auth/profile'),
};

export const eventAPI = {
  getAll: (params) => API.get('/events', { params }),
  create: (data) => API.post('/events', data),
  update: (id, data) => API.put(`/events/${id}`, data),
  delete: (id) => API.delete(`/events/${id}`),
  register: (id) => API.post(`/events/${id}/register`),
  cancelRegistration: (id) => API.delete(`/events/${id}/register`),
  getMyRegistrations: () => API.get('/events/my-registrations'),
  get: (path) => API.get(path),
  post: (path, data) => API.post(path, data),
};

export const stripeAPI = {
  createPaymentIntent: (eventId) => API.post(`/payments/events/${eventId}/create-payment-intent`),
  confirmPayment: (eventId, data) => API.post(`/payments/events/${eventId}/confirm-payment`, data),
};

export const userAPI = {
  getAll: (params) => API.get('/users', { params }),
  create: (data) => API.post('/users', data),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
  getStats: () => API.get('/users/stats'),
  updateProfile: (data) => API.put('/users/profile/me', data),
};

export const favoritesAPI = {
  getAll: () => API.get('/favorites'),
  toggle: (eventId) => API.post(`/favorites/${eventId}`),
};

export const commentsAPI = {
  getByEvent: (eventId) => API.get(`/comments/event/${eventId}`),
  create: (eventId, data) => API.post(`/comments/event/${eventId}`, data),
  like: (commentId) => API.post(`/comments/${commentId}/like`),
  reply: (commentId, data) => API.post(`/comments/${commentId}/reply`, data),
};

export const reviewsAPI = {
  getByEvent: (eventId) => API.get(`/reviews/event/${eventId}`),
  create: (data) => API.post('/reviews', data),
  markHelpful: (reviewId) => API.post(`/reviews/${reviewId}/helpful`),
};

export { API };
export default API;