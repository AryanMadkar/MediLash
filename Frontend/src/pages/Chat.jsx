import React, { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Volume2 } from 'lucide-react'
import { useAudio } from '../contexts/AudioContext'
import { useLanguage } from '../contexts/LanguageContext'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import toast from 'react-hot-toast'

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI medical assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const { language, t } = useLanguage()
  const { isRecording, startRecording, stopRecording } = useAudio()
  const messagesEndRef = useRef(null)

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition()

  useEffect(() => {
    if (transcript) {
      setInputText(transcript)
    }
  }, [transcript])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!inputText.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    resetTranscript()

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: generateAIResponse(inputText),
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const generateAIResponse = (userInput) => {
    const responses = [
      "I understand your concern. Can you provide more details about your symptoms?",
      "Based on what you've described, I recommend consulting with a healthcare professional.",
      "This sounds like it could be related to stress. Have you been experiencing any unusual stress lately?",
      "I'd like to help you better. When did these symptoms first appear?",
      "Thank you for sharing that information. Let me provide some guidance based on your symptoms."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleVoiceToggle = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error('Your browser does not support speech recognition')
      return
    }

    if (listening) {
      SpeechRecognition.stopListening()
      stopRecording()
    } else {
      SpeechRecognition.startListening({ continuous: true, language: language })
      startRecording()
    }
  }

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'es' ? 'es-ES' : 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Header */}
      <div className="glass-effect rounded-xl p-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('chat')}</h1>
        <p className="text-gray-600">Speak or type your medical questions</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 glass-effect rounded-xl p-4 overflow-y-auto mb-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                {message.sender === 'ai' && (
                  <button
                    onClick={() => speakText(message.text)}
                    className="mt-2 text-gray-500 hover:text-gray-700"
                  >
                    <Volume2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="glass-effect rounded-xl p-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message or use voice..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {listening && (
              <div className="absolute right-3 top-2.5">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-red-500 animate-pulse"></div>
                  <div className="w-1 h-4 bg-red-500 animate-pulse" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-4 bg-red-500 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleVoiceToggle}
            className={`p-2 rounded-lg transition-colors ${
              listening 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {listening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="btn-primary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
        
        {transcript && (
          <div className="mt-2 text-sm text-gray-600">
            Transcript: {transcript}
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
