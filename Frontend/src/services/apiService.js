import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiService = {
  // Start a new consultation
  async startConsultation(message) {
    try {
      const response = await api.post("/api/start-consultation", {
        message: message,
      });
      return response.data;
    } catch (error) {
      console.error("API Error - Start Consultation:", error);
      throw error;
    }
  },

  // Send message in ongoing consultation
  async sendMessage(sessionId, message) {
    try {
      const response = await api.post("/api/send-message", {
        session_id: sessionId,
        message: message,
      });
      return response.data;
    } catch (error) {
      console.error("API Error - Send Message:", error);
      throw error;
    }
  },

  // End consultation
  async endConsultation(sessionId) {
    try {
      const response = await api.post("/api/end-consultation", {
        session_id: sessionId,
      });
      return response.data;
    } catch (error) {
      console.error("API Error - End Consultation:", error);
      throw error;
    }
  },

  // Get session status
  async getSessionStatus(sessionId) {
    try {
      const response = await api.get(`/api/session-status/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("API Error - Session Status:", error);
      throw error;
    }
  },
};
