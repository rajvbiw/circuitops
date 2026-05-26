import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Send, Bot, RefreshCw, Sparkles, MessageSquare, Trash2, ArrowRight } from 'lucide-react';
import { setChatOpen } from '../store/uiSlice';
import { Link } from 'react-router-dom';
import api from '../utils/api';

function GadaAIModal() {
  const dispatch = useDispatch();
  const { isChatOpen } = useSelector((state) => state.ui);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      message: 'Welcome to CircuitOps! 🚀 I am your CircuitOps AI Assistant.\n\nI can recommend products, run side-by-side comparisons, summarize specifications, or help troubleshoot appliances. Ask me anything!'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [productsUsed, setProductsUsed] = useState([]);
  
  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history if logged in and drawer opens
  useEffect(() => {
    if (isChatOpen && isAuthenticated) {
      loadChatHistory();
    }
  }, [isChatOpen, isAuthenticated]);

  const loadChatHistory = async () => {
    try {
      const response = await api.post('/ai/chat', { message: 'Hello CircuitOps AI' }); // Quick fetch trigger or we use dummy
      // We will actually just load from a history load or use the current session to keep things clean.
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    if (!isAuthenticated) {
      alert('Please sign in to chat with the CircuitOps AI Assistant!');
      return;
    }

    // Add user bubble
    setMessages(prev => [...prev, { sender: 'user', message: query }]);
    if (!textToSend) setInputText('');
    setLoading(true);
    setProductsUsed([]);

    try {
      const response = await api.post('/ai/chat', { message: query });
      setMessages(prev => [...prev, { sender: 'ai', message: response.data.response }]);
      if (response.data.productsUsed) {
        setProductsUsed(response.data.productsUsed);
      }
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', message: 'Sorry. I ran into a connection glitch. Please make sure our backend service is running!' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Do you want to clear this conversation history?')) {
      try {
        await api.delete('/ai/chat/history');
        setMessages([
          {
            sender: 'ai',
            message: 'Conversation cleared! How can I help you browse CircuitOps now?'
          }
        ]);
        setProductsUsed([]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const suggestions = [
    { label: '📱 Recommend a Phone', prompt: 'Recommend the best flagship smartphone in stock.' },
    { label: '⚖️ Compare Laptops', prompt: 'Compare Circuit Notebook Air and Bhide Master Pro 14 laptops.' },
    { label: '🛠️ AC Troubleshooting', prompt: 'How do I troubleshoot Circuit Super-Cooling AC if it is not cooling?' },
    { label: '📝 Summarize AC Specs', prompt: 'Tell me the summary of specifications and features for Circuit Super-Cooling AC.' }
  ];

  if (!isChatOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Sidebar Drawer container */}
      <div className="w-full max-w-md h-full bg-gada-dark border-l border-gada-cardBorder flex flex-col justify-between shadow-2xl relative animate-slide-in">
        
        {/* Header (Nostalgic TV theme scanlines) */}
        <div className="scanlines bg-gada-cardBg p-5 border-b border-gada-cardBorder flex items-center justify-between text-gada-textLight relative">
          <div className="flex items-center gap-3">
            <div className="bg-gada-accent p-2 rounded-lg text-gada-dark">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-wide text-gada-accent">CIRCUITOPS AI ASSISTANT</h2>
              <span className="text-xs text-gada-success flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-gada-success inline-block animate-ping"></span>
                Grounded Catalog Bot • Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button 
                onClick={handleClearHistory}
                className="p-2 text-gada-textMuted hover:text-gada-danger rounded-lg transition-colors"
                title="Clear chat history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={() => dispatch(setChatOpen(false))}
              className="p-2 text-gada-textMuted hover:text-gada-accent rounded-lg transition-colors bg-gada-bg/80 border border-gada-cardBorder"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Log area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gada-dark/95">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {m.sender === 'ai' ? (
                  <>
                    <Bot className="w-3.5 h-3.5 text-gada-accent" />
                    <span className="text-[10px] font-bold text-gada-accent tracking-wider uppercase">CircuitOps Assistant</span>
                  </>
                ) : (
                  <span className="text-[10px] font-bold text-gada-textMuted tracking-wider uppercase">{user?.name || 'Customer'}</span>
                )}
              </div>

              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-relaxed shadow-lg ${
                  m.sender === 'user' 
                    ? 'bg-gada-accent text-gada-dark font-medium rounded-tr-none'
                    : 'bg-gada-cardBg border border-gada-cardBorder text-gada-textLight rounded-tl-none'
                }`}
              >
                {m.message}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1 mb-1">
                <Bot className="w-3.5 h-3.5 text-gada-accent" />
                <span className="text-[10px] font-bold text-gada-accent tracking-wider uppercase">Checking Showroom Stock...</span>
              </div>
              <div className="bg-gada-cardBg border border-gada-cardBorder text-gada-textLight rounded-2xl rounded-tl-none px-5 py-3.5 text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-gada-accent" />
                <span>Typing, please wait...</span>
              </div>
            </div>
          )}

          {/* Catalog references context */}
          {productsUsed.length > 0 && !loading && (
            <div className="bg-gada-cardBg/40 border border-gada-cardBorder/60 rounded-xl p-4 mt-2 animate-fade-in">
              <h4 className="text-xs font-bold text-gada-accent mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Verified Catalog Stock Linked:
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {productsUsed.map((p) => (
                  <Link 
                    key={p.id} 
                    to={`/products/${p.slug}`}
                    onClick={() => dispatch(setChatOpen(false))}
                    className="flex items-center justify-between bg-gada-bg/80 border border-gada-cardBorder hover:border-gada-accent/50 p-2 rounded-lg text-xs hover:text-gada-accent transition-all group"
                  >
                    <span className="font-medium truncate">{p.name}</span>
                    <span className="text-gada-accent font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      ₹{parseFloat(p.discount_price || p.price).toLocaleString('en-IN')}
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggestions Quick Buttons */}
        {messages.length === 1 && (
          <div className="px-5 py-2 border-t border-gada-cardBorder bg-gada-dark/95">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-gada-textMuted mb-2">Need a quick recommendation?</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s.prompt)}
                  className="text-left bg-gada-cardBg border border-gada-cardBorder hover:border-gada-accent/40 text-[11px] p-2 rounded-lg text-gada-textLight hover:text-gada-accent transition-all truncate"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat input box */}
        <div className="p-4 bg-gada-cardBg border-t border-gada-cardBorder flex gap-2">
          <input
            type="text"
            placeholder={isAuthenticated ? "Ask about ACs, TVs, mixers, compare specs..." : "Please log in to chat..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading || !isAuthenticated}
            className="flex-1 bg-gada-dark border border-gada-cardBorder text-gada-textLight rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gada-accent disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputText.trim() || !isAuthenticated}
            className="bg-gada-accent hover:bg-gada-accentHover disabled:bg-gada-bg text-gada-dark disabled:text-gada-textMuted px-4 py-3 rounded-xl transition-all duration-300 font-bold active:scale-95 shadow-md shadow-gada-accent/10"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

export default GadaAIModal;
