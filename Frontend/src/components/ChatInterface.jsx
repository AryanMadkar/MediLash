import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, MessageCircle } from 'lucide-react';
import VoiceInput from './VoiceInput';
import MessageBubble from './MessageBubble';
import { useMedicalChat } from '../hooks/useMedicalChat';

const ChatInterface = ({ selectedLanguage, translate, translationLoading }) => {
  const [input, setInput] = useState('');
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

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

  // Enhanced scroll management
  const scrollToBottom = (force = false) => {
    if ((shouldAutoScroll && !isUserScrolling) || force) {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  // Detect user scrolling
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      
      setIsUserScrolling(true);
      setShouldAutoScroll(isNearBottom);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Reset user scrolling flag after 1 second of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, 1000);
    }
  };

  // Only auto-scroll for new messages, not on submit
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Only auto-scroll for doctor responses, not user messages
      if (lastMessage.sender === 'doctor') {
        setTimeout(() => scrollToBottom(), 300);
      }
    }
  }, [messages.length, shouldAutoScroll]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!input.trim() || isLoading) return;

    const msg = input.trim();
    setInput('');
    
    // Prevent auto-scroll on user message submission
    setIsUserScrolling(true);
    setShouldAutoScroll(false);

    try {
      if (!sessionId) {
        await startNewConsultation(msg);
      } else {
        await sendMessage(msg);
      }
      
      // Re-enable auto-scroll for doctor response
      setTimeout(() => {
        setIsUserScrolling(false);
        setShouldAutoScroll(true);
      }, 500);
      
    } catch (error) {
      console.error('Submit error:', error);
      setIsUserScrolling(false);
      setShouldAutoScroll(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
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

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-xl">
      {/* Enhanced Header */}
      <div className="flex-none bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border-b border-slate-700/50 p-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {translate('Medical AI Assistant', selectedLanguage)}
              </h2>
              {consultationStage && (
                <p className="text-sm text-slate-400">
                  {translate(`Stage: ${consultationStage}`, selectedLanguage)} • 
                  <span className="ml-1 text-blue-400">{questionCount}/5 questions</span>
                </p>
              )}
            </div>
          </div>
          
          {sessionId && (
            <button
              onClick={handleEndConsultation}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {translate('End Consultation', selectedLanguage)}
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Messages Container */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl border border-slate-700/30">
              <Sparkles className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold text-white mb-3">
                {translate('Welcome to Medical AI Assistant', selectedLanguage)}
              </h3>
              <p className="text-slate-300 text-lg max-w-md">
                {translate('Describe your symptoms to start a consultation', selectedLanguage)}
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                message={message}
                selectedLanguage={selectedLanguage}
                translate={translate}
              />
            ))}
            {isLoading && (
              <div className="flex items-center space-x-3 p-4">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-4 shadow-xl border border-slate-600/50">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-slate-300 text-sm">
                      {translate('Doctor is typing...', selectedLanguage)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Area */}
      <div className="flex-none p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border-t border-slate-700/50 rounded-b-2xl">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={translate('Describe your symptoms...', selectedLanguage)}
              className="w-full p-4 bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 min-h-[60px] max-h-[120px] backdrop-blur-xl shadow-xl"
              rows={1}
              disabled={isLoading}
            />
            <div className="absolute bottom-2 right-2">
              <VoiceInput
                onTranscript={(transcript) => {
                  setInput(prev => prev + (prev ? ' ' : '') + transcript);
                }}
                selectedLanguage={selectedLanguage}
                translate={translate}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-slate-600 disabled:to-slate-500 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-xl hover:shadow-2xl group disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Send className="h-6 w-6 group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
