import React, { createContext, useContext, useState } from 'react'

const AudioContext = createContext()

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}

export const AudioProvider = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioData, setAudioData] = useState(null)
  const [transcript, setTranscript] = useState('')

  const startRecording = () => {
    setIsRecording(true)
  }

  const stopRecording = () => {
    setIsRecording(false)
  }

  const clearTranscript = () => {
    setTranscript('')
  }

  return (
    <AudioContext.Provider value={{ 
      isRecording, 
      audioData, 
      transcript,
      setIsRecording,
      setAudioData,
      setTranscript,
      startRecording,
      stopRecording,
      clearTranscript
    }}>
      {children}
    </AudioContext.Provider>
  )
}
