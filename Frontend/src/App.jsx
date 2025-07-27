import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import ChatInterface from "./components/ChatInterface";
import LanguageSelector from "./components/LanguageSelector";
import { useTranslation } from "./hooks/useTranslation";
import "./App.css";

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const { translate, isLoading: translationLoading } = useTranslation();

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                  🩺
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {translate('Medical AI Consultation', selectedLanguage)}
              </h1>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                {translate('Get instant medical consultation with AI-powered assistance in your preferred language. Describe your symptoms and get professional guidance.', selectedLanguage)}
              </p>
              
              {/* Language Selector */}
              <div className="mb-6">
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                />
              </div>
            </div>
            
            {/* Main Chat Interface */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200" style={{ height: '650px' }}>
              <ChatInterface
                selectedLanguage={selectedLanguage}
                translate={translate}
                translationLoading={translationLoading}
              />
            </div>

            {/* Footer Disclaimer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 max-w-3xl mx-auto">
                {translate('⚠️ Disclaimer: This AI assistant provides general health information only and should not replace professional medical advice. Always consult with qualified healthcare providers for proper diagnosis and treatment.', selectedLanguage)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
