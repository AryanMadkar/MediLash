import { useState, useEffect, useCallback } from "react";

export const useVoice = (language = "en") => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsSupported(true);
        const recognitionInstance = new SpeechRecognition();

        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.maxAlternatives = 1;

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  useEffect(() => {
    if (recognition) {
      const languageMap = {
        en: "en-US",
        hi: "hi-IN",
        mr: "mr-IN",
      };

      recognition.lang = languageMap[language] || "en-US";
    }
  }, [recognition, language]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setTranscript("");
      setIsListening(true);

      recognition.onstart = () => {
        console.log("Voice recognition started");
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Voice recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  const speak = useCallback(
    (text, lang = language) => {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);

        const voices = speechSynthesis.getVoices();
        const voice = voices.find((v) => v.lang.startsWith(lang));

        if (voice) {
          utterance.voice = voice;
        }

        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        speechSynthesis.speak(utterance);
      }
    },
    [language]
  );

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    speak,
  };
};
