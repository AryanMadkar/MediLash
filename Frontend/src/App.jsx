import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import LanguageSelector from './components/LanguageSelector';
import LoadingSpinner from './components/LoadingSpinner';
import { useTranslation } from './hooks/useTranslation';
import { Stethoscope, Shield, Globe } from 'lucide-react';
import './styles/App.css';

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const { translate, isLoading: translationLoading } = useTranslation();

  // Dark theme by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
        {/* Header */}
        <header className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {translate('Medical AI Assistant', selectedLanguage)}
                  </h1>
                  <p className="text-sm text-gray-400">
                    {translate('Free Healthcare for Everyone', selectedLanguage)}
                  </p>
                </div>
              </div>
              
              <LanguageSelector 
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full border border-green-500/20 mb-4">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {translate('Free & Confidential', selectedLanguage)}
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                {translate('Get instant medical consultation with AI-powered assistance in your preferred language', selectedLanguage)}
              </h2>
              
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                {translate('Describe your symptoms and get professional guidance from our AI medical assistant', selectedLanguage)}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="text-3xl mb-3">🌍</div>
                <h3 className="text-lg font-semibold mb-2 text-blue-300">
                  {translate('Multilingual Support', selectedLanguage)}
                </h3>
                <p className="text-gray-400 text-sm">
                  {translate('Available in English, Hindi, and Marathi', selectedLanguage)}
                </p>
              </div>
              
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="text-3xl mb-3">🎤</div>
                <h3 className="text-lg font-semibold mb-2 text-green-300">
                  {translate('Voice Support', selectedLanguage)}
                </h3>
                <p className="text-gray-400 text-sm">
                  {translate('Speak your symptoms or listen to responses', selectedLanguage)}
                </p>
              </div>
              
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-lg font-semibold mb-2 text-purple-300">
                  {translate('Instant Response', selectedLanguage)}
                </h3>
                <p className="text-gray-400 text-sm">
                  {translate('Get immediate AI-powered medical guidance', selectedLanguage)}
                </p>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-gray-800/20 backdrop-blur-md rounded-2xl border border-gray-700 shadow-2xl">
            <ChatInterface 
              selectedLanguage={selectedLanguage}
              translate={translate}
              translationLoading={translationLoading}
            />
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="text-yellow-400 mt-1">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-yellow-300 mb-2">
                  {translate('Important Disclaimer', selectedLanguage)}
                </h4>
                <p className="text-yellow-100 text-sm leading-relaxed">
                  {translate('This AI assistant provides general health information only and should not replace professional medical advice. Always consult with qualified healthcare providers for proper diagnosis and treatment. In case of emergencies, contact your local emergency services immediately.', selectedLanguage)}
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800/30 border-t border-gray-700 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                {translate('Made with ❤️ for a healthier society', selectedLanguage)}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                © 2024 Medical AI Assistant - Free Healthcare for All
              </p>
            </div>
          </div>
        </footer>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <LoadingSpinner size="lg" text={translate('Loading...', selectedLanguage)} />
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
