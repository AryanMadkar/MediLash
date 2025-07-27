import React, { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

const translations = {
  en: {
    welcome: 'Welcome to MediChain',
    dashboard: 'Dashboard',
    chat: 'Medical Chat',
    logout: 'Logout',
    startChat: 'Start New Chat',
    totalChats: 'Total Chats',
    todayConsultations: 'Today\'s Consultations',
  },
  hi: {
    welcome: 'मेडिचेन में आपका स्वागत है',
    dashboard: 'डैशबोर्ड',
    chat: 'मेडिकल चैट',
    logout: 'लॉगआउट',
    startChat: 'नई चैट शुरू करें',
    totalChats: 'कुल चैट',
    todayConsultations: 'आज की परामर्श',
  },
  es: {
    welcome: 'Bienvenido a MediChain',
    dashboard: 'Panel de Control',
    chat: 'Chat Médico',
    logout: 'Cerrar Sesión',
    startChat: 'Iniciar Nuevo Chat',
    totalChats: 'Chats Totales',
    todayConsultations: 'Consultas de Hoy',
  }
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')

  const t = (key) => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
