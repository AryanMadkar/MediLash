import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import VoiceInput from './VoiceInput'
import MessageBubble from './MessageBubble'
import SpecialistConnection from './SpecialistConnection'
import { useMedicalChat } from '../hooks/useMedicalChat'

const ChatInterface = ({ selectedLanguage, translate, translationLoading }) => {
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)
  
  const {
    messages,
    isLoading,
    sessionId,
    consultationStage,
    questionCount,
    showSpecialistOption,
    sendMessage,
    startNewConsultation,
    endConsultation,
    connectToSpecialist,
    setShowSpecialistOption
  } = useMedicalChat(selectedLanguage, translate)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const messageToSend = input.trim()
    setInput('')

    if (!sessionId) {
      await startNewConsultation(messageToSend)
    } else {
      await sendMessage(messageToSend)
    }
  }

  const handleVoiceTranscript = (transcript) => {
    setInput(transcript)
  }

  const handleEndConsultation = () => {
    if (sessionId) {
      endConsultation()
    }
  }

  const handleSpecialistConnect = (specialistData) => {
    connectToSpecialist(specialistData)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Chat Header */}
        <div className="bg-blue-600 text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">
                {translate('Medical Consultation', selectedLanguage)}
              </h2>
              <div className="flex items-center gap-4 mt-1">
                {consultationStage && (
                  <p className="text-blue-100 text-sm">
                    {translate(`Stage: ${consultationStage}`, selectedLanguage)}
                  </p>
                )}
                {sessionId && (
                  <p className="text-blue-100 text-sm">
                    {translate(`Questions: ${questionCount}/5`, selectedLanguage)}
                  </p>
                )}
              </div>
            </div>
            {sessionId && (
              <button
                onClick={handleEndConsultation}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors"
              >
                {translate('End Consultation', selectedLanguage)}
              </button>
            )}
          </div>
        </div>

        {/* Specialist Connection Banner */}
        {showSpecialistOption && (
          <div className="bg-purple-50 border-b border-purple-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-purple-800">
                  {translate('Ready for Expert Consultation?', selectedLanguage)}
                </h3>
                <p className="text-sm text-purple-600">
                  {translate('Connect with a specialist for detailed evaluation', selectedLanguage)}
                </p>
              </div>
              <button
                onClick={() => setShowSpecialistOption(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
              >
                {translate('Connect Now', selectedLanguage)}
              </button>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-6xl mb-4">🩺</div>
              <h3 className="text-xl font-semibold mb-2">
                {translate('Welcome to Medical AI Assistant', selectedLanguage)}
              </h3>
              <p className="text-gray-600">
                {translate('Describe your symptoms to start a consultation', selectedLanguage)}
              </p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message}
              selectedLanguage={selectedLanguage}
              translate={translate}
            />
          ))}
          
          {isLoading && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="animate-spin" size={20} />
                <span>{translate('Doctor is typing...', selectedLanguage)}</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={translate('Describe your symptoms...', selectedLanguage)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              selectedLanguage={selectedLanguage}
              isListening={isListening}
              setIsListening={setIsListening}
              translate={translate}
            />
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send size={20} />
              {translate('Send', selectedLanguage)}
            </button>
          </form>
        </div>
      </div>

      {/* Specialist Connection Modal */}
      <SpecialistConnection
        isVisible={showSpecialistOption}
        onClose={() => setShowSpecialistOption(false)}
        onConnect={handleSpecialistConnect}
        selectedLanguage={selectedLanguage}
        translate={translate}
      />
    </div>
  )
}

export default ChatInterface
