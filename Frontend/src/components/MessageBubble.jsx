import React from 'react'
import { Volume2, User, Stethoscope, UserCheck } from 'lucide-react'

const MessageBubble = ({ message, selectedLanguage, translate }) => {
  const isUser = message.sender === 'user'
  const isSpecialist = message.isSpecialist || message.doctorName?.includes('Dr.')
  
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

  // Format specialist response with proper structure
  const formatSpecialistResponse = (text) => {
    if (!isSpecialist) return text

    // Split by sections and format
    const sections = text.split('**')
    let formattedText = ''
    
    for (let i = 0; i < sections.length; i++) {
      if (i % 2 === 1) {
        // This is a header (between **)
        formattedText += `\n**${sections[i]}**\n`
      } else {
        // This is content
        const content = sections[i].trim()
        if (content) {
          // Format bullet points
          const lines = content.split('\n')
          const formattedLines = lines.map(line => {
            line = line.trim()
            if (line.startsWith('* ')) {
              return `• ${line.substring(2)}`
            }
            return line
          }).filter(line => line.length > 0)
          
          formattedText += formattedLines.join('\n') + '\n'
        }
      }
    }
    
    return formattedText.trim()
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start gap-3 max-w-xs lg:max-w-2xl ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600' : isSpecialist ? 'bg-purple-600' : 'bg-green-600'
        }`}>
          {isUser ? (
            <User size={16} className="text-white" />
          ) : isSpecialist ? (
            <UserCheck size={16} className="text-white" />
          ) : (
            <Stethoscope size={16} className="text-white" />
          )}
        </div>
        
        {/* Message Content */}
        <div className={`rounded-lg p-4 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : isSpecialist
            ? 'bg-purple-50 border-2 border-purple-200 text-gray-800'
            : 'bg-white border border-gray-200 text-gray-800'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-bold">
                  {isUser ? translate('You', selectedLanguage) : message.doctorName || translate('AI Doctor', selectedLanguage)}
                </p>
                {isSpecialist && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                    {translate('Specialist', selectedLanguage)}
                  </span>
                )}
              </div>
              
              {/* Formatted Response */}
              <div className="text-sm leading-relaxed">
                {isSpecialist ? (
                  <div className="space-y-3">
                    {formatSpecialistResponse(message.text).split('\n').map((line, index) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <h4 key={index} className="font-semibold text-purple-800 mt-4 mb-2 text-base">
                            {line.replace(/\*\*/g, '')}
                          </h4>
                        )
                      } else if (line.startsWith('• ')) {
                        return (
                          <div key={index} className="ml-4 mb-1 flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span className="flex-1">{line.substring(2)}</span>
                          </div>
                        )
                      } else if (line.trim()) {
                        return <p key={index} className="mb-2">{line}</p>
                      }
                      return null
                    })}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.text}</p>
                )}
              </div>
              
              {/* Medications Section */}
              {message.medications && message.medications.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold mb-2 text-green-700">
                    {translate('Suggested Medications:', selectedLanguage)}
                  </p>
                  <div className="space-y-1">
                    {message.medications.map((med, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs bg-green-50 p-2 rounded">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="font-medium">{med}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Recommendations Section */}
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold mb-2 text-blue-700">
                    {translate('Recommendations:', selectedLanguage)}
                  </p>
                  <div className="space-y-1">
                    {message.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs bg-blue-50 p-2 rounded">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Read Aloud Button */}
            {!isUser && (
              <button
                onClick={speakMessage}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
                title={translate('Read aloud', selectedLanguage)}
              >
                <Volume2 size={14} className="text-gray-500" />
              </button>
            )}
          </div>
          
          <p className="text-xs opacity-70 mt-3 text-right">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
