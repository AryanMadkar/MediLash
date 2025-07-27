import React, { useState } from 'react';
import { Volume2, User, Stethoscope, UserCheck, VolumeX, Copy, Check } from 'lucide-react';

const MessageBubble = ({ message, selectedLanguage, translate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';
  const isSpecialist = message.isSpecialist || message.doctorName?.includes('Dr.');

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const speakMessage = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      if (isPlaying) {
        setIsPlaying(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(message.text);
      const voices = speechSynthesis.getVoices();
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

  const formatText = (text) => {
    if (!text) return '';
    
    return text.split('\n').map((line, index) => {
      if (line.trim() === '') return <br key={index} />;
      
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <div key={index} className="mb-2">
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? (
                <strong key={partIndex} className="text-blue-300 font-semibold">{part}</strong>
              ) : (
                <span key={partIndex}>{part}</span>
              )
            )}
          </div>
        );
      }
      
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <div key={index} className="flex items-start space-x-2 mb-1">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <span>{line.substring(2)}</span>
          </div>
        );
      }
      
      return <div key={index} className="mb-1">{line}</div>;
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end slide-in-right' : 'justify-start slide-in-left'} mb-4`}>
      <div className={`max-w-[80%] md:max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar and Name */}
        <div className={`flex items-center mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`flex items-center space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
            <div className={`p-2 rounded-full ${
              isUser 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                : isSpecialist 
                  ? 'bg-gradient-to-r from-green-500 to-blue-500'
                  : 'bg-gradient-to-r from-slate-600 to-slate-500'
            } shadow-lg`}>
              {isUser ? (
                <User className="h-4 w-4 text-white" />
              ) : isSpecialist ? (
                <UserCheck className="h-4 w-4 text-white" />
              ) : (
                <Stethoscope className="h-4 w-4 text-white" />
              )}
            </div>
            <span className="text-sm font-medium text-slate-300">
              {isUser 
                ? translate('You', selectedLanguage)
                : message.doctorName || translate('AI Doctor', selectedLanguage)
              }
            </span>
          </div>
        </div>

        {/* Message Content */}
        <div className={`relative p-4 rounded-2xl shadow-xl backdrop-blur-xl border transition-all duration-300 hover:shadow-2xl ${
          isUser 
            ? 'message-bubble-user text-white border-blue-500/30' 
            : 'message-bubble-doctor text-slate-100 border-slate-600/50'
        }`}>
          <div className="prose prose-sm max-w-none">
            {formatText(message.text)}
          </div>

          {/* Medications */}
          {message.medications && message.medications.length > 0 && (
            <div className="mt-4 p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/30">
              <h4 className="font-semibold text-green-400 mb-2 flex items-center">
                💊 {translate('Suggested Medications:', selectedLanguage)}
              </h4>
              <ul className="space-y-1 text-sm">
                {message.medications.map((med, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{med}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {message.recommendations && message.recommendations.length > 0 && (
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/30">
              <h4 className="font-semibold text-purple-400 mb-2 flex items-center">
                📋 {translate('Recommendations:', selectedLanguage)}
              </h4>
              <ul className="space-y-1 text-sm">
                {message.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-slate-600/30">
            <button
              onClick={copyToClipboard}
              className="p-2 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-all duration-200 hover:scale-105"
              title={translate('Copy message', selectedLanguage)}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            
            {!isUser && (
              <button
                onClick={speakMessage}
                className="p-2 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-all duration-200 hover:scale-105"
                title={translate('Read aloud', selectedLanguage)}
              >
                {isPlaying ? (
                  <VolumeX className="h-4 w-4 text-blue-400 animate-pulse" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div className={`text-xs text-slate-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
