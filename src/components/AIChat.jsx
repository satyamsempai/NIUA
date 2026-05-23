import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, AlertCircle } from 'lucide-react';

/**
 * Conversational side panel powered by Gemini 1.5 Flash.
 * Pre-injects property statistics context to provide accurate answers.
 */
export default function AIChat({ contextString }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am your NIUA Property Tax AI Assistant. Ask me anything about the property tax dataset. E.g.,\n- Which city has the highest collection?\n- Show the approval rates of all cities.\n- How many properties are pending in Bangalore?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const apiKey = import.meta.env.VITE_GEMINI_KEY;
  const isKeyMissing = !apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey.trim() === '';

  // Auto-scroll to the bottom of chat history when a new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || isKeyMissing) return;

    const userQuery = input.trim();
    setInput('');
    
    // Add user message to history
    const userMsgId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMsgId, role: 'user', text: userQuery }]);
    setLoading(true);

    try {
      // Build request body combining context summary (as system) and user question
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
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to find an answer based on the statistical context.";

      // Add assistant response to history
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
          text: "⚠️ Sorry, I encountered an error communicating with the AI service. Please make sure your Gemini API key in the .env file is correct and you have internet access.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-sidebar">
      <div className="ai-sidebar-header">
        <Bot size={22} className="icon" />
        <div>
          <h2>AI Tax Assistant</h2>
          <p>Powered by Gemini 3.5 Flash</p>
        </div>
      </div>

      <div className="chat-messages">
        {/* API Key Missing Alert */}
        {isKeyMissing && (
          <div className="chat-message system-alert">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', fontWeight: 600 }}>
              <AlertCircle size={16} />
              API Key Not Configured
            </div>
            <span>
              Create a <code>.env</code> file in the root directory and add <code>VITE_GEMINI_KEY=your_key</code> to enable conversational analysis.
            </span>
          </div>
        )}

        {/* Message History */}
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            <span className="message-sender">{msg.role === 'user' ? 'You' : 'AI Assistant'}</span>
            <span className="message-text">{msg.text}</span>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="chat-message assistant">
            <span className="message-sender">AI Assistant</span>
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="chat-input-wrapper">
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isKeyMissing ? "AI Chat is disabled..." : "Ask about properties, collections, rates..."}
            disabled={loading || isKeyMissing}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!input.trim() || loading || isKeyMissing}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
