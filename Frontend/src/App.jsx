import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import ChatInterface from "./components/ChatInterface";
import LanguageSelector from "./components/LanguageSelector";
import { useTranslation } from "./hooks/useTranslation";

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const { translate, isLoading: translationLoading } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🩺 Medical AI Assistant
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            {translate(
              "Get instant medical consultation in your preferred language",
              selectedLanguage
            )}
          </p>
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <ChatInterface
                selectedLanguage={selectedLanguage}
                translate={translate}
                translationLoading={translationLoading}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
