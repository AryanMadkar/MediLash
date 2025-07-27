import React from 'react'
import { Globe } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
]

const LanguageSelector = ({ selectedLanguage, onLanguageChange }) => {
  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      <Globe className="text-blue-600" size={24} />
      <div className="flex gap-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              selectedLanguage === lang.code
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default LanguageSelector
