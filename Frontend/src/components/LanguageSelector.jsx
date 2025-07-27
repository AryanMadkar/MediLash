import React from 'react';
import { Globe } from 'lucide-react';

const LanguageSelector = ({ selectedLanguage, onLanguageChange }) => {
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
  ];

  return (
    <div className="flex items-center justify-center space-x-4">
      <div className="flex items-center space-x-2">
        <Globe className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Language:</span>
      </div>
      
      <div className="flex space-x-2">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => onLanguageChange(language.code)}
            className={`px-4 py-2 rounded-lg border transition-all duration-200 flex items-center space-x-2 ${
              selectedLanguage === language.code
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <span className="text-sm font-medium">{language.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
