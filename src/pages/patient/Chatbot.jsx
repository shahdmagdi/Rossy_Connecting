import React, { useState, useRef, useEffect } from 'react';
import API from '../../services/api';  // adjust path if Chatbot.jsx lives elsewhere

const CHATBOT = '/chatbot';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm Rossy Resilience Health Assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionError, setSessionError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Session management ─────────────────────────────────
  const createSession = async () => {
    try {
      const res = await API.post(`${CHATBOT}/session`);
      setSessionId(res.data.session_id);
      setSessionError(null);
      return res.data.session_id;
    } catch (err) {
      console.error('Failed to create session:', err);
      setSessionError('Could not connect to the server. Please try again later.');
      return null;
    }
  };

  // Create session when chat opens for the first time
  useEffect(() => {
    if (isOpen && !sessionId) {
      createSession();
    }
  }, [isOpen]);

  // ── Floating button styles ─────────────────────────────
  const floatingButtonStyle = {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#831843',
    border: 'none',
    boxShadow: '0 4px 20px rgba(131, 24, 67, 0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    transition: 'transform 0.3s, box-shadow 0.3s',
  };

  const chatWindowStyle = {
    position: 'fixed',
    bottom: '120px',
    right: '30px',
    width: '500px',
    height: '600px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(131, 24, 67, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    overflow: 'hidden',
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowDisclaimer(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const headerStyle = {
    backgroundColor: '#831843',
    color: '#ffffff',
    padding: '16px 20px',
    borderRadius: '20px 20px 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const messagesContainerStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#FDF2F8',
  };

  const userBubbleStyle = {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: '18px 18px 4px 18px',
    fontSize: '14px',
    lineHeight: '1.5',
    alignSelf: 'flex-end',
    backgroundColor: '#831843',
    color: '#ffffff',
    wordWrap: 'break-word',
  };

  const botBubbleStyle = {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: '18px 18px 18px 4px',
    fontSize: '14px',
    lineHeight: '1.5',
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    color: '#333',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
  };

  const typingIndicatorStyle = {
    display: 'flex',
    gap: '4px',
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    borderRadius: '18px 18px 18px 4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    alignSelf: 'flex-start',
    width: 'fit-content',
  };

  const inputAreaStyle = {
    padding: '16px',
    borderTop: '1px solid #F3F4F6',
    display: 'flex',
    gap: '10px',
    backgroundColor: '#ffffff',
  };

  const inputStyle = {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '25px',
    border: '2px solid #F3F4F6',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.3s',
  };

  const sendButtonStyle = {
    backgroundColor: '#831843',
    color: '#ffffff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  };

  const disclaimerStyle = {
    backgroundColor: '#FEF3C7',
    border: '1px solid #F59E0B',
    borderRadius: '8px',
    padding: '10px 14px',
    margin: '10px 20px',
    fontSize: '12px',
    color: '#92400E',
    textAlign: 'center',
  };

  const suggestionContainerStyle = {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '8px',
  };

  const suggestionChipStyle = {
    backgroundColor: '#FCE7F3',
    color: '#831843',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '16px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  };

  // ── Send message ───────────────────────────────────────
  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setMessages(prev => [...prev, { id: Date.now(), text: userMessage, sender: 'user' }]);
    setInputText('');
    setIsLoading(true);

    try {
      // Ensure we have a session
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId = await createSession();
        if (!currentSessionId) {
          throw new Error('No session available');
        }
      }

      const res = await API.post(`${CHATBOT}/message`, {
        session_id: currentSessionId,
        message: userMessage,
      }, { timeout: 120000 }); // 2 min — RAG pipeline needs time

      if (!res.data.success) throw new Error(res.data.message || 'Request failed');

      const answer = res.data.assistant_message?.content || 'Sorry, I could not get a response.';

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: answer,
        sender: 'bot',
        hasDisclaimer: true,
      }]);
      setShowDisclaimer(true);

    } catch (err) {
      console.error('Chat error:', err);
      const msg = err.response?.data?.message || err.message || 'Something went wrong. Please try again.';
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `⚠️ ${msg}`,
        sender: 'bot',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputText(suggestion);
    inputRef.current?.focus();
  };

  // ── Icons ──────────────────────────────────────────────
  const chatIcon = (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <line x1="12" y1="8" x2="12" y2="11" />
      <circle cx="8" cy="13" r="1.5" fill="white" />
      <circle cx="16" cy="13" r="1.5" fill="white" />
      <line x1="8" y1="17" x2="8" y2="17.01" strokeWidth="2" />
      <line x1="16" y1="17" x2="16" y2="17.01" strokeWidth="2" />
    </svg>
  );

  const closeIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  const sendIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );

  const TypingIndicator = () => (
    <div style={typingIndicatorStyle}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#831843', animation: 'bounce 1s infinite' }} />
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#831843', animation: 'bounce 1s infinite 0.2s' }} />
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#831843', animation: 'bounce 1s infinite 0.4s' }} />
    </div>
  );

  const suggestions = [
    "How do I use this website?",
    "What is breast cancer?",
    "What are the symptoms?",
    "How can I prevent it?"
  ];

  return (
    <>
      <style>
        {`
          @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-4px); }
          }
          .chat-float-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 25px rgba(131, 24, 67, 0.5) !important;
          }
          .suggestion-chip:hover {
            background-color: #F9D5E4 !important;
          }
          .send-btn:hover {
            background-color: #6B112A !important;
          }
        `}
      </style>

      <button
        style={floatingButtonStyle}
        className="chat-float-btn"
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? closeIcon : chatIcon}
      </button>

      {isOpen && (
        <div style={chatWindowStyle}>
          <div style={headerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '18px' }}>💬</span>
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '16px' }}>Health Assistant</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  {sessionId ? 'Rossy Resilience' : sessionError ? '⚠️ Offline' : 'Connecting...'}
                </div>
              </div>
            </div>
          </div>

          <div style={messagesContainerStyle}>
            {/* Session error banner */}
            {sessionError && (
              <div style={{
                backgroundColor: '#FEE2E2',
                border: '1px solid #F87171',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '12px',
                color: '#991B1B',
                textAlign: 'center',
              }}>
                ⚠️ {sessionError}
                <button
                  onClick={createSession}
                  style={{
                    marginLeft: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#831843',
                    cursor: 'pointer',
                    fontWeight: '600',
                    textDecoration: 'underline',
                    fontSize: '12px',
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                style={msg.sender === 'user' ? userBubbleStyle : botBubbleStyle}
              >
                {msg.text}
                {msg.hasDisclaimer && (
                  <div style={{
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: '1px solid #E5E7EB',
                    fontSize: '11px',
                    color: '#92400E',
                    fontStyle: 'italic'
                  }}>
                    ⚠️ This information is for educational purposes only. Always consult a healthcare provider.
                  </div>
                )}
              </div>
            ))}

            {isLoading && <TypingIndicator />}

            {messages.length === 1 && (
              <div style={suggestionContainerStyle}>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-chip"
                    style={suggestionChipStyle}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {showDisclaimer && (
            <div style={disclaimerStyle}>
              ⚠️ <strong>Medical Disclaimer:</strong> This chatbot provides general health information and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for medical concerns.
            </div>
          )}

          <div style={inputAreaStyle}>
            <input
              ref={inputRef}
              type="text"
              placeholder={sessionId ? "Type your message..." : "Connecting to server..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              style={inputStyle}
              disabled={isLoading || !!sessionError}
            />
            <button
              className="send-btn"
              style={{
                ...sendButtonStyle,
                opacity: (isLoading || !inputText.trim() || !!sessionError) ? 0.6 : 1,
                cursor: (isLoading || !inputText.trim() || !!sessionError) ? 'not-allowed' : 'pointer',
              }}
              onClick={handleSend}
              disabled={isLoading || !inputText.trim() || !!sessionError}
            >
              {isLoading ? '...' : sendIcon}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;