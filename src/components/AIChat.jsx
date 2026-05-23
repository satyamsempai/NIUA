import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Sparkles, AlertCircle, Terminal, Send, X, CornerDownLeft } from 'lucide-react';
import propertiesData from '../properties.json';
import { aggregateKPIs, filterByTenant } from '../utils/dataUtils';

/**
 * AI Response Bento Card for a city.
 */
function CityBentoCard({ city }) {
  const stats = useMemo(() => {
    const filtered = filterByTenant(propertiesData, city);
    return aggregateKPIs(filtered);
  }, [city]);

  return (
    <div className="ai-response-bento">
      <div className="ai-response-card">
        <h4>{city} • Registered</h4>
        <div className="val">{stats.totalRegistered.toLocaleString('en-IN')}</div>
      </div>
      <div className="ai-response-card">
        <h4>{city} • Collection</h4>
        <div className="val" style={{ color: '#8C7A51' }}>
          ₹ {Math.round(stats.collection).toLocaleString('en-IN')}
        </div>
      </div>
    </div>
  );
}

/**
 * Floating AI Command Center.
 * Handles Cmd+K shortcut, expands upwards, displays crisp chat bubbles,
 * renders city statistics bento cards on demand, and shows brass sliding loading animations.
 */
export default function AIChat({ contextString }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Portfolio AI Command active. Ask me about city tax collections, property distributions, or registration pipelines (e.g., 'What is the tax collection in Bangalore vs Jaipur?').",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const apiKey = import.meta.env.VITE_GEMINI_KEY;
  const isKeyMissing = !apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey.trim() === '';

  // Listen for Cmd+K and Escape keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Scroll to bottom of chat history
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading || isKeyMissing) return;

    const userQuery = input.trim();
    setInput('');
    
    // Add user message to history
    const userMsgId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMsgId, role: 'user', text: userQuery }]);
    setLoading(true);

    try {
      const prompt = `${contextString}\n\nUser Question: ${userQuery}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ]
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "No records match this analytical query.";

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + '-ai', role: 'assistant', text: answer.trim() },
      ]);
    } catch (err) {
      console.error("Gemini API error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '-err',
          role: 'assistant',
          text: "⚠️ Query failed. Check VITE_GEMINI_KEY environment configuration and API status.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Detect cities mentioned in assistant responses to render inline bento cards
  const detectCities = (text) => {
    const list = ['Delhi', 'Ahmedabad', 'Pune', 'Jaipur', 'Hyderabad', 'Mumbai', 'Kolkata', 'Bengaluru', 'Chennai', 'Lucknow'];
    const matched = [];
    list.forEach(city => {
      // Handle alternative spellings like Bangalore
      let pattern = city;
      if (city === 'Bengaluru') pattern = '(Bengaluru|Bangalore)';
      const regex = new RegExp(`\\b${pattern}\\b`, 'i');
      if (regex.test(text)) {
        matched.push(city);
      }
    });
    return matched;
  };

  return (
    <>
      {/* Blurred overlay background when expanded */}
      <div 
        className={`ai-expanded-overlay ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Floating Center-Bottom container */}
      <div className="ai-command-center-root">
        <div className={`ai-command-container ${isOpen ? 'active' : ''}`}>
          
          {/* Expanded Chat History Screen */}
          <div className={`command-expanded-panel ${isOpen ? 'active' : ''}`}>
            <div className="expanded-chat-header">
              <h3>
                <Terminal size={16} style={{ color: 'var(--color-primary)' }} />
                AI Command Center
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="badge">Active Terminal</span>
                <button 
                  className="command-icon-btn" 
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Command Center"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="expanded-chat-messages">
              {isKeyMissing && (
                <div className="command-chat-bubble assistant" style={{ borderColor: 'var(--accent-crimson)', background: 'rgba(107, 44, 44, 0.05)' }}>
                  <span className="bubble-sender" style={{ color: '#f87171' }}>System Warning</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#f87171', marginBottom: '4px' }}>
                    <AlertCircle size={14} />
                    VITE_GEMINI_KEY is missing
                  </div>
                  Configure your Gemini API key in a local <code>.env</code> file:
                  <pre style={{ background: '#000', padding: '6px', borderRadius: '4px', marginTop: '6px', fontSize: '11px', color: '#8A8F98' }}>
                    VITE_GEMINI_KEY=your_api_key_here
                  </pre>
                </div>
              )}

              {messages.map((msg) => {
                const mentioned = msg.role === 'assistant' ? detectCities(msg.text) : [];
                return (
                  <div key={msg.id} className={`command-chat-bubble ${msg.role}`}>
                    <span className="bubble-sender">{msg.role === 'user' ? 'You' : 'AI Assistant'}</span>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                    
                    {/* Dynamically render mini bento cards if a city is referenced in the response */}
                    {mentioned.map(city => (
                      <CityBentoCard key={city} city={city} />
                    ))}
                  </div>
                );
              })}

              {/* Loading skeleton */}
              {loading && (
                <div className="command-chat-bubble assistant">
                  <span className="bubble-sender">AI Assistant</span>
                  <div style={{ color: 'var(--color-muted)', marginBottom: '8px' }}>
                    Analyzing municipal records...
                  </div>
                  <div className="brass-loading-bar">
                    <div className="brass-loading-slide"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Command Bar (Always clickable bottom entry point) */}
          <form onSubmit={handleSubmit} className="command-bar-wrapper">
            <Sparkles 
              size={18} 
              style={{ color: isOpen ? 'var(--color-primary)' : 'var(--color-muted)' }} 
              onClick={() => setIsOpen(prev => !prev)}
              className="command-icon-btn"
            />
            <input
              ref={inputRef}
              type="text"
              className="command-input-field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onClick={() => setIsOpen(true)}
              placeholder={isKeyMissing ? "AI Terminal disabled..." : "Ask about properties, taxes, or market trends..."}
              disabled={loading || isKeyMissing}
            />
            
            {/* Keyboard shortcut indicator */}
            {!isOpen && <span className="command-kbd-badge">Ctrl + K</span>}
            
            <button
              type="submit"
              className={`command-icon-btn ${input.trim() ? 'send-active' : ''}`}
              disabled={!input.trim() || loading || isKeyMissing}
              aria-label="Submit Query"
            >
              <Send size={16} />
            </button>
          </form>

        </div>
      </div>
    </>
  );
}
