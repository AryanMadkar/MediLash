import React from 'react'
import { Volume2, User, Stethoscope } from 'lucide-react'

const MessageBubble = ({ message, selectedLanguage, translate }) => {
  const isUser = message.sender === 'user'
  
  const speakMessage = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message.text)
      
      const voices = speechSynthesis.getVoices()
      const languageVoice = voices.find(voice => 
        voice.lang.startsWith(selectedLanguage === 'hi' ? 'hi' : selectedLanguage === 'mr' ? 'mr' : 'en')
      )
      
      if (languageVoice) {
        utterance.voice = languageVoice
      }
      
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start gap-3 max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600' : 'bg-green-600'
        }`}>
          {isUser ? (
            <User size={16} className="text-white" />
          ) : (
            <Stethoscope size={16} className="text-white" />
          )}
        </div>
        
        {/* Message Content */}
        <div className={`rounded-lg p-3 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-white border border-gray-200 text-gray-800'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">
                {isUser ? translate('You', selectedLanguage) : message.doctorName || translate('AI Doctor', selectedLanguage)}
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.text}
              </p>
              
              {/* Additional Info */}
              {message.medications && message.medications.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <p className="text-xs font-medium mb-1">
                    {translate('Suggested Medications:', selectedLanguage)}
                  </p>
                  <ul className="text-xs space-y-1">
                    {message.medications.map((med, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        {med}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <p className="text-xs font-medium mb-1">
                    {translate('Recommendations:', selectedLanguage)}
                  </p>
                  <ul className="text-xs space-y-1">
                    {message.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Read Aloud Button */}
            {!isUser && (
              <button
                onClick={speakMessage}
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                title={translate('Read aloud', selectedLanguage)}
              >
                <Volume2 size={14} className="text-gray-500" />
              </button>
            )}
          </div>
          
          <p className="text-xs opacity-70 mt-2">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
