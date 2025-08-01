import { useState, useCallback } from 'react'
import { apiService } from '../services/apiService'

export const useMedicalChat = (selectedLanguage, translate) => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [consultationStage, setConsultationStage] = useState(null)
  const [questionCount, setQuestionCount] = useState(0) // Track questions
  const [showSpecialistOption, setShowSpecialistOption] = useState(false)

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, {
      ...message,
      timestamp: new Date().toISOString()
    }])
  }, [])

  const startNewConsultation = useCallback(async (message) => {
    setIsLoading(true)
    setQuestionCount(1) // First question
    
    addMessage({
      text: message,
      sender: 'user'
    })

    try {
      const response = await apiService.startConsultation(message)
      
      if (response.success) {
        setSessionId(response.session_id)
        setConsultationStage(response.consultation_stage)
        
        addMessage({
          text: response.doctor_response,
          sender: 'doctor',
          doctorName: response.doctor_name,
          medications: response.medications,
          recommendations: response.recommendations,
          isSpecialist: response.is_specialist || false
        })
      } else {
        addMessage({
          text: translate('Sorry, there was an error starting the consultation. Please try again.', selectedLanguage),
          sender: 'doctor',
          doctorName: 'System'
        })
      }
    } catch (error) {
      console.error('Error starting consultation:', error)
      addMessage({
        text: translate('Connection error. Please check your internet and try again.', selectedLanguage),
        sender: 'doctor',
        doctorName: 'System'
      })
    } finally {
      setIsLoading(false)
    }
  }, [addMessage, selectedLanguage, translate])

  const sendMessage = useCallback(async (message) => {
    if (!sessionId) return

    setIsLoading(true)
    const newQuestionCount = questionCount + 1
    setQuestionCount(newQuestionCount)
    
    addMessage({
      text: message,
      sender: 'user'
    })

    try {
      const response = await apiService.sendMessage(sessionId, message)
      
      if (response.success) {
        setConsultationStage(response.consultation_stage)
        
        addMessage({
          text: response.doctor_response,
          sender: 'doctor',
          doctorName: response.specialist_name || response.doctor_name || 'AI Doctor',
          medications: response.medications,
          recommendations: response.recommendations,
          isSpecialist: response.is_specialist || false
        })

        // Show specialist option after 5 questions
        if (newQuestionCount >= 5 && !showSpecialistOption) {
          setShowSpecialistOption(true)
        }
      } else {
        addMessage({
          text: translate('Sorry, there was an error processing your message. Please try again.', selectedLanguage),
          sender: 'doctor',
          doctorName: 'System'
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      addMessage({
        text: translate('Connection error. Please check your internet and try again.', selectedLanguage),
        sender: 'doctor',
        doctorName: 'System'
      })
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, addMessage, selectedLanguage, translate, questionCount, showSpecialistOption])

  const connectToSpecialist = useCallback(async (specialistData) => {
    try {
      const response = await apiService.connectToSpecialist(sessionId, specialistData)
      
      if (response.success) {
        addMessage({
          text: translate(`Connected to ${specialistData.specialist.name}. They will review your case and provide expert consultation.`, selectedLanguage),
          sender: 'doctor',
          doctorName: 'System'
        })
      }
    } catch (error) {
      console.error('Error connecting to specialist:', error)
    }
    
    setShowSpecialistOption(false)
  }, [sessionId, addMessage, selectedLanguage, translate])

  const endConsultation = useCallback(async () => {
    if (!sessionId) return

    try {
      await apiService.endConsultation(sessionId)
      
      addMessage({
        text: translate('Thank you for using our medical consultation service. Remember to consult with a real healthcare provider for proper medical care.', selectedLanguage),
        sender: 'doctor',
        doctorName: 'System'
      })
      
      setSessionId(null)
      setConsultationStage(null)
      setQuestionCount(0)
      setShowSpecialistOption(false)
    } catch (error) {
      console.error('Error ending consultation:', error)
    }
  }, [sessionId, addMessage, selectedLanguage, translate])

  return {
    messages,
    isLoading,
    sessionId,
    consultationStage,
    questionCount,
    showSpecialistOption,
    startNewConsultation,
    sendMessage,
    endConsultation,
    connectToSpecialist,
    setShowSpecialistOption
  }
}
