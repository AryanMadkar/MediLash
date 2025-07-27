import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import VoiceInput from './VoiceInput';
import MessageBubble from './MessageBubble';
import { useMedicalChat } from '../hooks/useMedicalChat';

const ChatInterface = ({ selectedLanguage, translate, translationLoading }) => {
  const [input, setInput] = useState('');
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const {
    messages,
    isLoading,
    sessionId,
    consultationStage,
    questionCount,
    sendMessage,
    startNewConsultation,
    endConsultation
  } = useMedicalChat(selectedLanguage, translate);

  /* ----------------- helpers ----------------- */
  const scrollToBottom = () => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Only auto-scroll when new messages are added AND user hasn't manually scrolled up
  useEffect(() => {
    const checkScrollPosition = () => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShouldAutoScroll(isNearBottom);
      }
    };

    // Check scroll position before auto-scrolling
    checkScrollPosition();
    
    // Only scroll if user is near bottom
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length]); // Only trigger on message count change, not content change

  // Handle manual scrolling
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  };

  // Auto-resize textarea without scrolling
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    if (!input.trim() || isLoading) return;

    const msg = input.trim();
    setInput('');
    setShouldAutoScroll(true); // Allow auto-scroll for new messages

    try {
      if (!sessionId) {
        await startNewConsultation(msg);
      } else {
        await sendMessage(msg);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit(e);
    }
  };

  const handleEndConsultation = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await endConsultation();
    } catch (error) {
      console.error('End consultation error:', error);
    }
  };

  /* ----------------- UI ----------------- */
  return (
    <div className="flex flex-col h-[70vh] max-h-[800px] relative">
      {/* header */}
      <div className="flex-none p-4 border-b border-gray-700 bg-gray-800/30 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <div>
              <h3 className="font-semibold text-white">
                {translate('Medical Consultation', selectedLanguage)}
              </h3>
              {consultationStage && (
                <p className="text-xs text-gray-400">
                  {translate(`Stage: ${consultationStage}`, selectedLanguage)}
                </p>
              )}
            </div>
          </div>

          {sessionId && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">
                {translate(`Questions: ${questionCount}/5`, selectedLanguage)}
              </span>

              <button
                type="button"
                onClick={handleEndConsultation}
                className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded-full border border-red-400/30 hover:bg-red-400/10 transition-colors"
              >
                {translate('End Consultation', selectedLanguage)}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* messages */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/20 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🩺</div>
            <p className="text-gray-400 text-lg mb-2">
              {translate('Welcome to Medical AI Assistant', selectedLanguage)}
            </p>
            <p className="text-gray-500">
              {translate('Describe your symptoms to start a consultation', selectedLanguage)}
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble
              key={`msg-${i}-${msg.timestamp}`}
              message={msg}
              selectedLanguage={selectedLanguage}
              translate={translate}
            />
          ))
        )}

        {isLoading && (
          <div className="flex items-center space-x-3 p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            </div>
            <div>
              <p className="text-white font-medium">AI Doctor</p>
              <p className="text-gray-400 text-sm">
                {translate('Doctor is typing...', selectedLanguage)}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* input */}
      <div className="flex-none p-4 border-t border-gray-700 bg-gray-800/30 rounded-b-2xl">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={translate('Describe your symptoms...', selectedLanguage)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 resize-none min-h-[50px] max-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              rows={1}
            />

            {/* voice input */}
            <div className="absolute right-2 bottom-2">
              <VoiceInput
                onTranscript={(t) => setInput(t)}
                selectedLanguage={selectedLanguage}
                translate={translate}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl px-6 py-3 font-medium transition-colors flex items-center space-x-2"
            onSubmit={(e) => e.preventDefault()}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span className="hidden sm:inline">
              {translate('Send', selectedLanguage)}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
