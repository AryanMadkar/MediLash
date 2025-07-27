import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  verifyToken: () => api.get('/auth/verify'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
}

// Chat API
export const chatAPI = {
  sendMessage: (message) => api.post('/chat/message', message),
  getHistory: (limit = 50) => api.get(`/chat/history?limit=${limit}`),
  deleteHistory: () => api.delete('/chat/history'),
  getChatSessions: () => api.get('/chat/sessions'),
  createSession: (title) => api.post('/chat/sessions', { title }),
  deleteSession: (sessionId) => api.delete(`/chat/sessions/${sessionId}`),
}

// Medical API
export const medicalAPI = {
  getDoctors: () => api.get('/medical/doctors'),
  getSpecialties: () => api.get('/medical/specialties'),
  getSymptoms: () => api.get('/medical/symptoms'),
  analyzeSymptoms: (symptoms) => api.post('/medical/analyze', { symptoms }),
  getRecommendations: (condition) => api.get(`/medical/recommendations/${condition}`),
}

// Translation API
export const translationAPI = {
  translate: (data) => api.post('/translate', data),
  batchTranslate: (data) => api.post('/translate/batch', data),
  detectLanguage: (text) => api.post('/translate/detect', { text }),
  getSupportedLanguages: () => api.get('/translate/languages'),
}

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  changePassword: (passwords) => api.post('/user/change-password', passwords),
  deleteAccount: () => api.delete('/user/account'),
}

export default api
