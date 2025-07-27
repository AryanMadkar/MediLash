import React, { useState, useEffect } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'
import { useVoiceToText } from 'react-speakup'

const VoiceInput = ({ 
  onTranscript, 
  selectedLanguage, 
  isListening, 
  setIsListening,
  translate 
}) => {
  const getLanguageCode = (lang) => {
    const langMap = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'mr': 'mr-IN'
    }
    return langMap[lang] || 'en-US'
  }

  const { 
    startListening, 
    stopListening, 
    transcript 
  } = useVoiceToText({
    continuous: false,
    lang: getLanguageCode(selectedLanguage),
    onResult: (result) => {
      if (result) {
        onTranscript(result)
        setIsListening(false)
      }
    }
  })

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
      setIsListening(false)
    } else {
      startListening()
      setIsListening(true)
    }
  }

  // Text-to-speech function
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Set voice based on selected language
      const voices = speechSynthesis.getVoices()
      const languageVoice = voices.find(voice => 
        voice.lang.startsWith(getLanguageCode(selectedLanguage).split('-')[0])
      )
      
      if (languageVoice) {
        utterance.voice = languageVoice
      }
      
      utterance.rate = 0.9
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleVoiceToggle}
        className={`p-3 rounded-full transition-all duration-200 ${
          isListening
            ? 'bg-red-600 text-white animate-pulse'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        title={translate(isListening ? 'Stop recording' : 'Start voice input', selectedLanguage)}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>
      
      {transcript && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {transcript}
          </span>
          <button
            onClick={() => speakText(transcript)}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title={translate('Read aloud', selectedLanguage)}
          >
            <Volume2 size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default VoiceInput
