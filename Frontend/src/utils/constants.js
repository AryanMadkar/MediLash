// Application constants
export const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    speechCode: 'en-US'
  },
  hi: {
    code: 'hi',
    name: 'हिंदी',
    flag: '🇮🇳',
    speechCode: 'hi-IN'
  },
  mr: {
    code: 'mr',
    name: 'मराठी',
    flag: '🇮🇳',
    speechCode: 'mr-IN'
  }
}

export const API_ENDPOINTS = {
  START_CONSULTATION: '/api/start-consultation',
  SEND_MESSAGE: '/api/send-message',
  END_CONSULTATION: '/api/end-consultation',
  SESSION_STATUS: '/api/session-status'
}

export const CONSULTATION_STAGES = {
  INITIAL_ASSESSMENT: 'initial_assessment',
  SYMPTOM_ANALYSIS: 'symptom_analysis',
  DIAGNOSIS_DISCUSSION: 'diagnosis_discussion',
  TREATMENT_PLANNING: 'treatment_planning',
  FOLLOW_UP: 'follow_up',
  COMPLETED: 'completed'
}

export const MESSAGE_TYPES = {
  USER: 'user',
  DOCTOR: 'doctor',
  SYSTEM: 'system'
}

export const VOICE_COMMANDS = {
  START_RECORDING: ['start recording', 'शुरू करें', 'सुरू करा'],
  STOP_RECORDING: ['stop recording', 'बंद करें', 'थांबवा'],
  SEND_MESSAGE: ['send message', 'भेजें', 'पाठवा']
}
