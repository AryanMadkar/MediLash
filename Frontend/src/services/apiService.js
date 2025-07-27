import axios from 'axios'

// Base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        data: config.data
      })
    }
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log('API Response:', response.data)
    }
    return response
  },
  (error) => {
    console.error('Response Error:', error)
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      console.error('API endpoint not found')
    } else if (error.response?.status === 500) {
      console.error('Server error occurred')
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout')
    }
    
    return Promise.reject(error)
  }
)

export const apiService = {
  // Start a new medical consultation
  async startConsultation(message, userLanguage = 'en') {
    try {
      const response = await api.post('/api/start-consultation', {
        message: message,
        user_language: userLanguage,
        timestamp: new Date().toISOString()
      })
      return response.data
    } catch (error) {
      console.error('API Error - Start Consultation:', error)
      throw error
    }
  },

  // Send message in ongoing consultation
  async sendMessage(sessionId, message, userLanguage = 'en') {
    try {
      const response = await api.post('/api/send-message', {
        session_id: sessionId,
        message: message,
        user_language: userLanguage,
        timestamp: new Date().toISOString()
      })
      return response.data
    } catch (error) {
      console.error('API Error - Send Message:', error)
      throw error
    }
  },

  // End consultation
  async endConsultation(sessionId, feedback = null) {
    try {
      const response = await api.post('/api/end-consultation', {
        session_id: sessionId,
        feedback: feedback,
        timestamp: new Date().toISOString()
      })
      return response.data
    } catch (error) {
      console.error('API Error - End Consultation:', error)
      throw error
    }
  },

  // Get session status
  async getSessionStatus(sessionId) {
    try {
      const response = await api.get(`/api/session-status/${sessionId}`)
      return response.data
    } catch (error) {
      console.error('API Error - Session Status:', error)
      throw error
    }
  },

  // Connect to specialist
  async connectToSpecialist(sessionId, specialistData) {
    try {
      const response = await api.post('/api/connect-specialist', {
        session_id: sessionId,
        specialist_id: specialistData.specialist.id,
        specialist_name: specialistData.specialist.name,
        connection_method: specialistData.method,
        timestamp: new Date().toISOString()
      })
      return response.data
    } catch (error) {
      console.error('API Error - Connect Specialist:', error)
      throw error
    }
  },

  // Get available specialists
  async getAvailableSpecialists(specialtyType = null) {
    try {
      const params = specialtyType ? { specialty: specialtyType } : {}
      const response = await api.get('/api/specialists', { params })
      return response.data
    } catch (error) {
      console.error('API Error - Get Specialists:', error)
      throw error
    }
  },

  // Submit consultation feedback
  async submitFeedback(sessionId, rating, comments) {
    try {
      const response = await api.post('/api/submit-feedback', {
        session_id: sessionId,
        rating: rating,
        comments: comments,
        timestamp: new Date().toISOString()
      })
      return response.data
    } catch (error) {
      console.error('API Error - Submit Feedback:', error)
      throw error
    }
  },

  // Get consultation history (optional - if you want to implement later)
  async getConsultationHistory(sessionId) {
    try {
      const response = await api.get(`/api/consultation-history/${sessionId}`)
      return response.data
    } catch (error) {
      console.error('API Error - Get History:', error)
      throw error
    }
  },

  // Health check endpoint
  async healthCheck() {
    try {
      const response = await api.get('/api/health')
      return response.data
    } catch (error) {
      console.error('API Error - Health Check:', error)
      throw error
    }
  },

  // Upload medical documents (if needed)
  async uploadDocument(sessionId, file) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('session_id', sessionId)
      
      const response = await api.post('/api/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('API Error - Upload Document:', error)
      throw error
    }
  },

  // Emergency contact (if critical symptoms detected)
  async emergencyAlert(sessionId, symptoms, location = null) {
    try {
      const response = await api.post('/api/emergency-alert', {
        session_id: sessionId,
        symptoms: symptoms,
        location: location,
        timestamp: new Date().toISOString(),
        priority: 'high'
      })
      return response.data
    } catch (error) {
      console.error('API Error - Emergency Alert:', error)
      throw error
    }
  }
}

// Export individual methods for convenience
export const {
  startConsultation,
  sendMessage,
  endConsultation,
  getSessionStatus,
  connectToSpecialist,
  getAvailableSpecialists,
  submitFeedback,
  getConsultationHistory,
  healthCheck,
  uploadDocument,
  emergencyAlert
} = apiService

// Default export
export default apiService
