// Application constants
export const LANGUAGES = {
  en: {
    code: "en",
    name: "English",
    flag: "🇺🇸",
    speechCode: "en-US",
  },
  hi: {
    code: "hi",
    name: "हिंदी",
    flag: "🇮🇳",
    speechCode: "hi-IN",
  },
  mr: {
    code: "mr",
    name: "मराठी",
    flag: "🇮🇳",
    speechCode: "mr-IN",
  },
};

export const API_ENDPOINTS = {
  START_CONSULTATION: "/api/start-consultation",
  SEND_MESSAGE: "/api/send-message",
  END_CONSULTATION: "/api/end-consultation",
  SESSION_STATUS: "/api/session-status",
  CONNECT_SPECIALIST: "/api/connect-specialist",
  GET_SPECIALISTS: "/api/specialists",
  SUBMIT_FEEDBACK: "/api/submit-feedback",
  HEALTH_CHECK: "/api/health",
  UPLOAD_DOCUMENT: "/api/upload-document",
  EMERGENCY_ALERT: "/api/emergency-alert",
};

export const CONSULTATION_STAGES = {
  INITIAL_ASSESSMENT: "initial_assessment",
  SYMPTOM_ANALYSIS: "symptom_analysis",
  DIAGNOSIS_DISCUSSION: "diagnosis_discussion",
  TREATMENT_PLANNING: "treatment_planning",
  FOLLOW_UP: "follow_up",
  SPECIALIST_REFERRAL: "specialist_referral",
  COMPLETED: "completed",
};

export const MESSAGE_TYPES = {
  USER: "user",
  DOCTOR: "doctor",
  SPECIALIST: "specialist",
  SYSTEM: "system",
};

export const SPECIALIST_TYPES = {
  NEUROLOGIST: "neurologist",
  CARDIOLOGIST: "cardiologist",
  GENERAL: "general",
  PSYCHIATRIST: "psychiatrist",
  DERMATOLOGIST: "dermatologist",
  ORTHOPEDIST: "orthopedist",
};

export const CONNECTION_METHODS = {
  CONSULTATION: "consultation",
  CALL: "call",
  VIDEO: "video",
};

export const VOICE_COMMANDS = {
  START_RECORDING: ["start recording", "शुरू करें", "सुरू करा"],
  STOP_RECORDING: ["stop recording", "बंद करें", "थांबवा"],
  SEND_MESSAGE: ["send message", "भेजें", "पाठवा"],
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network connection failed",
  TIMEOUT_ERROR: "Request timeout",
  SERVER_ERROR: "Server error occurred",
  VALIDATION_ERROR: "Invalid input data",
};

export const SUCCESS_MESSAGES = {
  CONSULTATION_STARTED: "Consultation started successfully",
  MESSAGE_SENT: "Message sent successfully",
  SPECIALIST_CONNECTED: "Connected to specialist",
};
