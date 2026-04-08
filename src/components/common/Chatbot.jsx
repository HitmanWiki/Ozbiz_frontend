// frontend/src/components/common/Chatbot.jsx
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, HelpCircle } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Chatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  
  const userType = user?.userType || 'consumer';
  
  useEffect(() => {
    // Load suggested questions
    fetchSuggestions();
    
    // Add welcome message
    setMessages([
      {
        id: 'welcome',
        role: 'bot',
        content: `👋 Hi there! I'm OzBot, your support assistant. I can help you with:\n\n• Finding businesses\n• Writing reviews\n• Listing your business\n• Managing your account\n\nWhat would you like to know?`,
        timestamp: new Date()
      }
    ]);
  }, []);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const fetchSuggestions = async () => {
    try {
      const res = await api.get(`/chatbot/suggestions?userType=${userType}`);
      setSuggestions(res.data.suggestions);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };
  
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      const res = await api.post('/chatbot', {
        message: input,
        userType: userType
      });
      
      const botMessage = {
        id: Date.now() + 1,
        role: 'bot',
        content: res.data.reply,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'bot',
        content: 'Sorry, I\'m having trouble connecting. Please try again or email support@ozbiz.com.au',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setTimeout(() => sendMessage(), 100);
  };
  
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-gold-400 text-navy-900 p-3 rounded-full shadow-lg hover:scale-105 transition-all duration-200 group"
        >
          <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      )}
      
      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-4 right-4 z-50 bg-white rounded-xl shadow-2xl transition-all duration-300 ${
          isMinimized ? 'w-80 h-14' : 'w-80 sm:w-96 h-[500px]'
        }`}>
          {/* Header */}
          <div className="bg-navy-800 text-white p-3 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gold-400 rounded-full flex items-center justify-center">
                <MessageCircle size={16} className="text-navy-900" />
              </div>
              <div>
                <p className="font-semibold text-sm">OzBot Support</p>
                <p className="text-[10px] text-white/60">Online • Instant replies</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          
          {/* Chat Body */}
          {!isMinimized && (
            <>
              <div className="h-[calc(100%-110px)] overflow-y-auto p-3 space-y-3 bg-slate-50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-2.5 ${
                        msg.role === 'user'
                          ? 'bg-navy-800 text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      <p className="text-xs whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[9px] mt-1 ${
                        msg.role === 'user' ? 'text-white/40' : 'text-slate-400'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Suggestions */}
              {suggestions.length > 0 && messages.length < 3 && (
                <div className="px-3 py-2 border-t border-slate-100 bg-white">
                  <p className="text-[10px] text-slate-400 mb-2 flex items-center gap-1">
                    <HelpCircle size={10} /> Suggested questions:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full hover:bg-gold-100 hover:text-gold-700 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Input Area */}
              <div className="p-3 border-t border-slate-100 bg-white">
                <div className="flex gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your question..."
                    className="flex-1 input text-sm resize-none py-2 px-3"
                    rows="1"
                    style={{ minHeight: '38px', maxHeight: '80px' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="btn-primary p-2 disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 text-center mt-2">
                  Powered by OzBiz Support • <a href="mailto:support@ozbiz.com.au" className="hover:text-gold-600">Email us</a>
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}