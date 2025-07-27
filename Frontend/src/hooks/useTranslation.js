import { useState, useCallback } from 'react'
import { translateText } from '../services/translationService'

export const useTranslation = () => {
  const [isLoading, setIsLoading] = useState(false)

  const translate = useCallback((text, targetLanguage) => {
    // Simple translation logic - in production, you'd use a translation service
    const translations = {
      'Get instant medical consultation in your preferred language': {
        hi: 'अपनी पसंदीदा भाषा में तुरंत चिकित्सा परामर्श प्राप्त करें',
        mr: 'आपल्या आवडत्या भाषेत तत्काळ वैद्यकीय सल्ला घ्या'
      },
      'Medical Consultation': {
        hi: 'चिकित्सा परामर्श',
        mr: 'वैद्यकीय सल्ला'
      },
      'End Consultation': {
        hi: 'परामर्श समाप्त करें',
        mr: 'सल्ला संपवा'
      },
      'Welcome to Medical AI Assistant': {
        hi: 'मेडिकल एआई असिस्टेंट में आपका स्वागत है',
        mr: 'मेडिकल एआय असिस्टंटमध्ये आपले स्वागत आहे'
      },
      'Describe your symptoms to start a consultation': {
        hi: 'परामर्श शुरू करने के लिए अपने लक्षणों का वर्णन करें',
        mr: 'सल्ला सुरू करण्यासाठी तुमची लक्षणे वर्णन करा'
      },
      'Doctor is typing...': {
        hi: 'डॉक्टर टाइप कर रहा है...',
        mr: 'डॉक्टर टाइप करत आहे...'
      },
      'Describe your symptoms...': {
        hi: 'अपने लक्षणों का वर्णन करें...',
        mr: 'तुमची लक्षणे वर्णन करा...'
      },
      'Send': {
        hi: 'भेजें',
        mr: 'पाठवा'
      },
      'You': {
        hi: 'आप',
        mr: 'तुम्ही'
      },
      'AI Doctor': {
        hi: 'एआई डॉक्टर',
        mr: 'एआय डॉक्टर'
      },
      'Read aloud': {
        hi: 'जोर से पढ़ें',
        mr: 'मोठ्याने वाचा'
      },
      'Start voice input': {
        hi: 'वॉयस इनपुट शुरू करें',
        mr: 'व्हॉइस इनपुट सुरू करा'
      },
      'Stop recording': {
        hi: 'रिकॉर्डिंग बंद करें',
        mr: 'रेकॉर्डिंग थांबवा'
      },
      'Suggested Medications:': {
        hi: 'सुझाई गई दवाएं:',
        mr: 'सुचवलेली औषधे:'
      },
      'Recommendations:': {
        hi: 'सिफारिशें:',
        mr: 'शिफारसी:'
      }
    }

    if (targetLanguage === 'en' || !translations[text] || !translations[text][targetLanguage]) {
      return text
    }

    return translations[text][targetLanguage]
  }, [])

  const translateToEnglish = useCallback(async (text, sourceLanguage) => {
    if (sourceLanguage === 'en') return text
    
    setIsLoading(true)
    try {
      // In production, use a proper translation service
      // For now, return the text as-is since we're sending to Flask backend
      return text
    } catch (error) {
      console.error('Translation error:', error)
      return text
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { translate, translateToEnglish, isLoading }
}
