import axios from 'axios';

// Use same host if served via ASP.NET Core wwwroot or fallback to localhost:5000
const API_BASE_URL = window.location.port === '5000' 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        console.warn('Unauthorized request, user token might be expired.');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getUsers: (params) => api.get('/auth/users', { params }),
  updateUserStatus: (id, status) => api.patch(`/auth/users/${id}/status`, { status }),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

export const coursesApi = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  getCategories: () => api.get('/courses/categories'),
};

export const modulesApi = {
  getByCourse: (courseId) => api.get(`/courses/${courseId}/modules`),
  create: (courseId, data) => api.post(`/courses/${courseId}/modules`, data),
  update: (id, data) => api.put(`/modules/${id}`, data),
  delete: (id) => api.delete(`/modules/${id}`),
};

export const lessonsApi = {
  getById: (id) => api.get(`/lessons/${id}`),
  create: (moduleId, data) => api.post(`/modules/${moduleId}/lessons`, data),
  update: (id, data) => api.put(`/lessons/${id}`, data),
  delete: (id) => api.delete(`/lessons/${id}`),
};

export const enrollmentsApi = {
  getMyCourses: () => api.get('/enrollments/my-courses'),
  getAll: (params) => api.get('/enrollments/all', { params }),
  enroll: (courseId) => api.post(`/enrollments/${courseId}`),
  updateStatus: (id, status, adminNote) => api.patch(`/enrollments/${id}/status`, { status, adminNote }),
  updateProgress: (lessonId, isCompleted) => 
    api.post(`/enrollments/lessons/${lessonId}/progress`, { lessonId, isCompleted }),
  getCertificate: (courseId) => api.get(`/enrollments/${courseId}/certificate`),
};

export const quizzesApi = {
  getById: (id) => api.get(`/quizzes/${id}`),
  create: (courseId, data) => api.post(`/courses/${courseId}/quizzes`, data),
  submit: (id, answers) => api.post(`/quizzes/${id}/submit`, { answers }),
  delete: (id) => api.delete(`/quizzes/${id}`),
};

export const assignmentsApi = {
  getById: (id) => api.get(`/assignments/${id}`),
  create: (courseId, data) => api.post(`/courses/${courseId}/assignments`, data),
  submit: (id, data) => api.post(`/assignments/${id}/submit`, data),
  grade: (submissionId, data) => api.post(`/assignments/submissions/${submissionId}/grade`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
};

export const discussionsApi = {
  getByCourse: (courseId) => api.get(`/courses/${courseId}/discussions`),
  create: (courseId, data) => api.post(`/courses/${courseId}/discussions`, data),
  delete: (id) => api.delete(`/discussions/${id}`),
};

export const liveClassesApi = {
  getByCourse: (courseId) => api.get(`/courses/${courseId}/live-classes`),
  getUpcoming: () => api.get('/liveclasses/upcoming'),
  schedule: (courseId, data) => api.post(`/courses/${courseId}/live-classes`, data),
  updateStatus: (id, data) => api.put(`/liveclasses/${id}/status`, data),
  delete: (id) => api.delete(`/liveclasses/${id}`),
};

export const analyticsApi = {
  getAdminStats: () => api.get('/analytics/admin'),
  getInstructorStats: () => api.get('/analytics/instructor'),
  getStudentStats: () => api.get('/analytics/student'),
};

export default api;
