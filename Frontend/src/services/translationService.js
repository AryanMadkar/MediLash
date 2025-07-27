// Translation service for handling multilingual text
export const translateText = async (text, fromLang = 'auto', toLang = 'en') => {
  // Simple offline translation dictionary for common medical terms
  const medicalTranslations = {
    // Hindi to English
    'सिरदर्द': 'headache',
    'बुखार': 'fever',
    'खांसी': 'cough',
    'पेट दर्द': 'stomach pain',
    'गले में दर्द': 'sore throat',
    'सांस लेने में तकलीफ': 'breathing difficulty',
    'चक्कर आना': 'dizziness',
    'कमजोरी': 'weakness',
    'उल्टी': 'vomiting',
    'दस्त': 'diarrhea',
    
    // Marathi to English
    'डोकेदुखी': 'headache',
    'ताप': 'fever',
    'खोकला': 'cough',
    'पोटदुखी': 'stomach pain',
    'घशाची दुखी': 'sore throat',
    'श्वास घेण्यात अडचण': 'breathing difficulty',
    'चक्कर येणे': 'dizziness',
    'कमकुवतपणा': 'weakness',
    'उलटी': 'vomiting',
    'जुलाब': 'diarrhea'
  }

  // For production, you would integrate with Google Translate API or similar
  // For now, return basic translation or original text
  const translatedText = medicalTranslations[text.toLowerCase()] || text
  
  return {
    translatedText,
    originalText: text,
    confidence: medicalTranslations[text.toLowerCase()] ? 0.9 : 0.1
  }
}

export const detectLanguage = (text) => {
  // Simple language detection based on script
  const hindiRegex = /[\u0900-\u097F]/
  const marathiRegex = /[\u0900-\u097F]/
  
  if (hindiRegex.test(text)) {
    return 'hi'
  } else if (marathiRegex.test(text)) {
    return 'mr'
  } else {
    return 'en'
  }
}
