const axios = require('axios');

class FlaskService {
  constructor() {
    this.baseURL = process.env.FLASK_SERVER_URL;
    this.timeout = parseInt(process.env.FLASK_API_TIMEOUT) || 30000;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async startConsultation(message) {
    try {
      const response = await this.client.post('/api/start-consultation', {
        message: message
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Flask startConsultation error:', error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to start consultation'
      };
    }
  }

  async sendMessage(sessionId, message) {
    try {
      const response = await this.client.post('/api/send-message', {
        session_id: sessionId,
        message: message
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Flask sendMessage error:', error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to send message'
      };
    }
  }

  async endConsultation(sessionId) {
    try {
      const response = await this.client.post('/api/end-consultation', {
        session_id: sessionId
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Flask endConsultation error:', error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to end consultation'
      };
    }
  }

  async getSessionStatus(sessionId) {
    try {
      const response = await this.client.get(`/api/session-status/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Flask getSessionStatus error:', error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to get session status'
      };
    }
  }

  async healthCheck() {
    try {
      const response = await this.client.get('/');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Flask health check error:', error.message);
      return { success: false, error: 'Flask server unavailable' };
    }
  }
}

module.exports = new FlaskService();
