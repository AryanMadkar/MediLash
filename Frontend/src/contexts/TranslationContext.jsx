import React, { createContext, useContext, useState, useCallback } from 'react'
import { translationAPI } from '../services/api'
import { useLanguage } from './LanguageContext'
import toast from 'react-hot-toast'

const TranslationContext = createContext()

export const useTranslation = () => {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}

export const TranslationProvider = ({ children }) => {
  const { currentLanguage } = useLanguage()
  const [translating, setTranslating] = useState(false)
  const [translationCache, setTranslationCache] = useState(new Map())

  const translateText = useCallback(async (text, targetLanguage = null, sourceLanguage = 'auto') => {
    if (!text || text.trim() === '') return text

    const target = targetLanguage || currentLanguage
    const cacheKey = `${sourceLanguage}-${target}-${text}`
    
    // Check cache first
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)
    }

    try {
      setTranslating(true)
      const response = await translationAPI.translate({
        text,
        source: sourceLanguage,
        target,
      })

      const translatedText = response.data.translatedText
      
      // Cache the translation
      setTranslationCache(prev => new Map(prev.set(cacheKey, translatedText)))
      
      return translatedText
    } catch (error) {
      console.error('Translation error:', error)
      toast.error('Translation failed')
      return text // Return original text on error
    } finally {
      setTranslating(false)
    }
  }, [currentLanguage, translationCache])

  const translateToEnglish = useCallback((text) => {
    return translateText(text, 'en', currentLanguage)
  }, [translateText, currentLanguage])

  const translateFromEnglish = useCallback((text) => {
    return translateText(text, currentLanguage, 'en')
  }, [translateText, currentLanguage])

  const batchTranslate = useCallback(async (texts, targetLanguage = null) => {
    if (!Array.isArray(texts) || texts.length === 0) return []

    try {
      setTranslating(true)
      const target = targetLanguage || currentLanguage
      
      const response = await translationAPI.batchTranslate({
        texts,
        target,
        source: 'auto'
      })

      return response.data.translations
    } catch (error) {
      console.error('Batch translation error:', error)
      toast.error('Batch translation failed')
      return texts // Return original texts on error
    } finally {
      setTranslating(false)
    }
  }, [currentLanguage])

  const clearCache = useCallback(() => {
    setTranslationCache(new Map())
  }, [])

  const value = {
    translateText,
    translateToEnglish,
    translateFromEnglish,
    batchTranslate,
    translating,
    clearCache,
    cacheSize: translationCache.size
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}
