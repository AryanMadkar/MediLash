import React, { useState } from 'react';
import { Volume2, User, Stethoscope, UserCheck, VolumeX } from 'lucide-react';

const MessageBubble = ({ message, selectedLanguage, translate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isUser = message.sender === 'user';
  const isSpecialist = message.isSpecialist || message.doctorName?.includes('Dr.');

  const speakMessage = () => {
    if ('speechSynthesis' in window) {
      // Stop any currently playing speech
      speechSynthesis.cancel();
      
      if (isPlaying) {
        setIsPlaying(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(message.text);
      const voices = speechSynthesis.getVoices();
      
      // Find appropriate voice for language
      const languageCode = selectedLanguage === 'hi' ? 'hi' : selectedLanguage === 'mr' ? 'mr' : 'en';
      const languageVoice = voices.find(voice => 
        voice.lang.startsWith(languageCode) || 
        voice.lang.startsWith(languageCode + '-')
      );
      
      if (languageVoice) {
        utterance.voice = languageVoice;
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  // Format text with proper line breaks and styling
  const formatText = (text) => {
    if (!text) return '';
    
    return text.split('\n').map((line, index) => {
      if (line.trim() === '') return <br key={index} />;
      
      // Handle bold text
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <div key={index} className="mb-2">
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? 
                <strong key={partIndex} className="font-semibold text-blue-300">{part}</strong> : 
                part
            )}
          </div>
        );
      }
      
      // Handle bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={index} className="ml-4 mb-1">
            <span className="text-blue-400 mr-2">•</span>
            {line.replace(/^[•-]\s*/, '')}
          </div>
        );
      }
      
      return <div key={index} className="mb-2">{line}</div>;
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-2xl p-4 ${
        isUser 
          ? 'bg-blue-600 text-white ml-auto' 
          : 'bg-gray-800 text-white border border-gray-700'
      } shadow-lg`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isUser ? 'bg-blue-700' : isSpecialist ? 'bg-green-600' : 'bg-purple-600'
            }`}>
              {isUser ? (
                <User className="h-3 w-3" />
              ) : isSpecialist ? (
                <UserCheck className="h-3 w-3" />
              ) : (
                <Stethoscope className="h-3 w-3" />
              )}
            </div>
            
            <div>
              <span className="text-sm font-medium">
                {isUser ? translate('You', selectedLanguage) : message.doctorName || translate('AI Doctor', selectedLanguage)}
              </span>
              {isSpecialist && (
                <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                  {translate('Specialist', selectedLanguage)}
                </span>
              )}
            </div>
          </div>
          
          {/* Audio Control */}
          {!isUser && (
            <button
              onClick={speakMessage}
              className={`p-1.5 rounded-full transition-colors ${
                isPlaying 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
              }`}
              title={isPlaying ? translate('Stop', selectedLanguage) : translate('Read aloud', selectedLanguage)}
            >
              {isPlaying ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Message Content */}
        <div className="text-sm leading-relaxed">
          {formatText(message.text)}
        </div>

        {/* Medications */}
        {message.medications && message.medications.length > 0 && (
          <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <h4 className="text-green-400 font-medium text-sm mb-2">
              {translate('Suggested Medications:', selectedLanguage)}
            </h4>
            <div className="space-y-1">
              {message.medications.map((med, index) => (
                <div key={index} className="text-sm text-green-300">
                  • {med}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {message.recommendations && message.recommendations.length > 0 && (
          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <h4 className="text-blue-400 font-medium text-sm mb-2">
              {translate('Recommendations:', selectedLanguage)}
            </h4>
            <div className="space-y-1">
              {message.recommendations.map((rec, index) => (
                <div key={index} className="text-sm text-blue-300">
                  • {rec}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-400 mt-3">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
