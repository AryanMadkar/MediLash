import { useState, useCallback } from "react";
import { translateText } from "../services/translationService";

export const useTranslation = () => {
  const [isLoading, setIsLoading] = useState(false);

  const translate = useCallback((text, targetLanguage) => {
    // Complete translation dictionary
    const translations = {
      // Main UI
      "Get instant medical consultation in your preferred language": {
        hi: "अपनी पसंदीदा भाषा में तुरंत चिकित्सा परामर्श प्राप्त करें",
        mr: "आपल्या आवडत्या भाषेत तत्काळ वैद्यकीय सल्ला घ्या",
      },
      "Medical Consultation": {
        hi: "चिकित्सा परामर्श",
        mr: "वैद्यकीय सल्ला",
      },
      "End Consultation": {
        hi: "परामर्श समाप्त करें",
        mr: "सल्ला संपवा",
      },
      "Welcome to Medical AI Assistant": {
        hi: "मेडिकल एआई असिस्टेंट में आपका स्वागत है",
        mr: "मेडिकल एआय असिस्टंटमध्ये आपले स्वागत आहे",
      },
      "Describe your symptoms to start a consultation": {
        hi: "परामर्श शुरू करने के लिए अपने लक्षणों का वर्णन करें",
        mr: "सल्ला सुरू करण्यासाठी तुमची लक्षणे वर्णन करा",
      },
      "Doctor is typing...": {
        hi: "डॉक्टर टाइप कर रहा है...",
        mr: "डॉक्टर टाइप करत आहे...",
      },
      "Describe your symptoms...": {
        hi: "अपने लक्षणों का वर्णन करें...",
        mr: "तुमची लक्षणे वर्णन करा...",
      },
      Send: {
        hi: "भेजें",
        mr: "पाठवा",
      },
      You: {
        hi: "आप",
        mr: "तुम्ही",
      },
      "AI Doctor": {
        hi: "एआई डॉक्टर",
        mr: "एआय डॉक्टर",
      },
      "Read aloud": {
        hi: "जोर से पढ़ें",
        mr: "मोठ्याने वाचा",
      },
      "Start voice input": {
        hi: "वॉयस इनपुट शुरू करें",
        mr: "व्हॉइस इनपुट सुरू करा",
      },
      "Stop recording": {
        hi: "रिकॉर्डिंग बंद करें",
        mr: "रेकॉर्डिंग थांबवा",
      },

      // Specialist Connection
      "Connect with Specialist": {
        hi: "विशेषज्ञ से जुड़ें",
        mr: "तज्ञाशी संपर्क साधा",
      },
      "Ready for Expert Consultation?": {
        hi: "विशेषज्ञ परामर्श के लिए तैयार?",
        mr: "तज्ञ सल्ल्यासाठी तयार आहात?",
      },
      "Connect with a specialist for detailed evaluation": {
        hi: "विस्तृत मूल्यांकन के लिए विशेषज्ञ से जुड़ें",
        mr: "तपशीलवार मूल्यांकनासाठी तज्ञाशी संपर्क साधा",
      },
      "Connect Now": {
        hi: "अभी जुड़ें",
        mr: "आता जोडा",
      },
      "Based on your consultation, we recommend connecting with a specialist for further evaluation.":
        {
          hi: "आपके परामर्श के आधार पर, हम आगे के मूल्यांकन के लिए किसी विशेषज्ञ से जुड़ने की सलाह देते हैं।",
          mr: "तुमच्या सल्ल्याच्या आधारे, आम्ही पुढील मूल्यांकनासाठी तज्ञाशी संपर्क साधण्याची शिफारस करतो।",
        },
      "Choose a Specialist:": {
        hi: "एक विशेषज्ञ चुनें:",
        mr: "तज्ञ निवडा:",
      },
      "How would you like to connect?": {
        hi: "आप कैसे जुड़ना चाहेंगे?",
        mr: "तुम्ही कसे जोडू इच्छिता?",
      },
      "Online Consultation": {
        hi: "ऑनलाइन परामर्श",
        mr: "ऑनलाइन सल्ला",
      },
      "Chat with specialist (Free)": {
        hi: "विशेषज्ञ से चैट करें (मुफ्त)",
        mr: "तज्ञाशी गप्पा मारा (विनामूल्य)",
      },
      "Phone Consultation": {
        hi: "फोन परामर्श",
        mr: "फोन सल्ला",
      },
      "Schedule a call (₹500)": {
        hi: "कॉल शेड्यूल करें (₹500)",
        mr: "कॉल शेड्यूल करा (₹५००)",
      },
      "Maybe Later": {
        hi: "शायद बाद में",
        mr: "कदाचित नंतर",
      },
      Specialist: {
        hi: "विशेषज्ञ",
        mr: "तज्ञ",
      },

      // Medical Terms
      "Suggested Medications:": {
        hi: "सुझाई गई दवाएं:",
        mr: "सुचवलेली औषधे:",
      },
      "Recommendations:": {
        hi: "सिफारिशें:",
        mr: "शिफारसी:",
      },

      // Progress Tracking
      "Questions: {count}/5": {
        hi: "प्रश्न: {count}/5",
        mr: "प्रश्न: {count}/5",
      },
      "Stage: {stage}": {
        hi: "चरण: {stage}",
        mr: "टप्पा: {stage}",
      },
      // Add these to your translations object in useTranslation.js
      "Tell me more about your problem in detail so I can provide better assistance.":
        {
          hi: "बेहतर सहायता प्रदान करने के लिए अपनी समस्या के बारे में विस्तार से बताएं।",
          mr: "चांगली मदत देण्यासाठी तुमच्या समस्येबद्दल तपशीलवार सांगा.",
        },
      "Please analyze the project thoroughly and if any error or bug please help me with the correct code.":
        {
          hi: "कृपया प्रोजेक्ट का गहन विश्लेषण करें और यदि कोई त्रुटि या बग है तो सही कोड के साथ मेरी मदद करें।",
          mr: "कृपया प्रकल्पाचे गहन विश्लेषण करा आणि कोणती त्रुटी किंवा बग असल्यास योग्य कोडसह मला मदत करा.",
        },

      // Error Messages
      "Sorry, there was an error starting the consultation. Please try again.":
        {
          hi: "क्षमा करें, परामर्श शुरू करने में त्रुटि हुई। कृपया पुनः प्रयास करें।",
          mr: "माफ करा, सल्ला सुरू करताना त्रुटी झाली. कृपया पुन्हा प्रयत्न करा.",
        },
      "Connection error. Please check your internet and try again.": {
        hi: "कनेक्शन त्रुटि। कृपया अपना इंटरनेट जांचें और पुनः प्रयास करें।",
        mr: "कनेक्शन त्रुटी. कृपया तुमचे इंटरनेट तपासा आणि पुन्हा प्रयत्न करा.",
      },
      "Thank you for using our medical consultation service. Remember to consult with a real healthcare provider for proper medical care.":
        {
          hi: "हमारी चिकित्सा परामर्श सेवा का उपयोग करने के लिए धन्यवाद। उचित चिकित्सा देखभाल के लिए वास्तविक स्वास्थ्य सेवा प्रदाता से परामर्श करना याद रखें।",
          mr: "आमच्या वैद्यकीय सल्ला सेवेचा वापर केल्याबद्दल धन्यवाद. योग्य वैद्यकीय काळजीसाठी खऱ्या आरोग्य सेवा प्रदात्याशी सल्लामसलत करणे लक्षात ठेवा.",
        },
    };

    if (
      targetLanguage === "en" ||
      !translations[text] ||
      !translations[text][targetLanguage]
    ) {
      return text;
    }

    // Handle dynamic content like question count
    let translatedText = translations[text][targetLanguage];
    if (translatedText && translatedText.includes("{")) {
      // This would handle dynamic replacements if needed
      return translatedText;
    }

    return translatedText;
  }, []);

  const translateToEnglish = useCallback(async (text, sourceLanguage) => {
    if (sourceLanguage === "en") return text;

    setIsLoading(true);
    try {
      // In production, use a proper translation service
      const result = await translateText(text, sourceLanguage, "en");
      return result.translatedText || text;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { translate, translateToEnglish, isLoading };
};
