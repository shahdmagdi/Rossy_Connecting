import React, { useState, useRef, useEffect } from 'react';

const ruleBasedResponses = {
  greeting: {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'start', 'help'],
    responses: [
      "Hello! I'm Rossy Resilience Health Assistant. How can I help you today?",
      "Hi there! I'm here to help with any health-related questions you might have.",
      "Hello! Feel free to ask me about breast cancer, symptoms, prevention, or how to use this website."
    ]
  },
  website: {
    keywords: ['website', 'use', 'how do i', 'how to', 'app', 'platform', 'navigate', 'login', 'pages', 'navigation', 'dashboard'],
    responses: [
      "This website has 5 main pages: 🏠 Home/Dashboard - Shows your health overview and upcoming visits; 📅 Visits - View and manage your appointments; 👨‍⚕️ Doctor - Connect with your healthcare providers; 📋 History - View your medical records and past visits; 📝 Care Plan - Access your personalized treatment plan. Use the top navigation menu to switch between pages.",
      "The navigation is simple! At the top you'll see: Dashboard (your health summary), Visits (schedule appointments), Doctor (contact your medical team), History (past medical records), and Care Plan (your treatment details). Click any option to navigate to that page.",
      "To use this website: 1) Dashboard - See your health overview and upcoming visits. 2) Visits - Schedule or view appointments with your doctors. 3) Doctor - Find and contact your healthcare providers. 4) History - Browse your complete medical history. 5) Care Plan - Follow your personalized treatment schedule and medications. The chatbot is available on all pages to help you!"
    ]
  },
  breastCancer: {
    keywords: ['breast cancer', 'what is', 'about', 'explain', 'cancer', 'tumor'],
    responses: [
      "Breast cancer is a type of cancer that develops in the breast tissue. It occurs when cells in the breast grow abnormally and uncontrollably, forming a tumor. Early detection through regular screenings significantly improves treatment outcomes.",
      "Breast cancer is one of the most common cancers affecting women. It can affect anyone, regardless of age or family history. Regular self-exams and mammograms are key to early detection.",
      "Breast cancer develops when cells in the breast mutate and grow abnormally. While it can be hereditary, many cases occur in women without family history. Treatment options include surgery, chemotherapy, radiation, and targeted therapy."
    ]
  },
  symptoms: {
    keywords: ['symptom', 'signs', 'warning', 'detect', 'find', 'lump', 'pain', 'discharge'],
    responses: [
      "Common signs of breast cancer include: a new lump in the breast or underarm area, changes in breast size or shape, skin irritation or dimpling, nipple discharge, or pain in the breast area. However, some cases show no symptoms initially.",
      "Watch for these warning signs: a lump or thickening in the breast, changes in how the breast or nipple looks, any discharge from the nipple, or persistent pain. Remember, these symptoms can also be caused by non-cancerous conditions.",
      "Breast cancer symptoms to be aware of: new lumps, changes in breast shape or size, skin changes (redness or dimpling), nipple changes, or unusual discharge. Regular screenings can detect changes before you notice symptoms."
    ]
  },
  prevention: {
    keywords: ['prevent', 'prevention', 'reduce risk', 'avoid', 'stop', 'lower risk', 'protect'],
    responses: [
      "To reduce breast cancer risk: Maintain a healthy weight, exercise regularly, limit alcohol, avoid smoking, and discuss genetic testing with your doctor if you have family history.",
      "Prevention strategies include: regular exercise, maintaining a healthy weight, limiting alcohol consumption, breastfeeding if possible, and discussing screening schedules with your healthcare provider.",
      "While there's no guaranteed prevention, you can lower your risk through lifestyle changes: stay active, eat a balanced diet, limit alcohol, and attend regular screenings as recommended by your doctor."
    ]
  },
  screening: {
    keywords: ['screening', 'mammogram', 'exam', 'check', 'scan', 'detect', 'test', 'early'],
    responses: [
      "Mammograms are X-ray examinations of the breast that can detect cancer early, often before lumps can be felt. Women aged 40+ should discuss screening schedules with their doctor.",
      "Regular mammograms can detect breast cancer years before symptoms appear. The recommended frequency depends on your age and risk factors. Talk to your healthcare provider about what's right for you.",
      "Breast screening typically involves mammograms starting at age 40, though your doctor may recommend earlier screening based on your risk factors. Self-exams monthly and clinical exams yearly are also recommended."
    ]
  },
  treatment: {
    keywords: ['treatment', 'therapy', 'cure', 'chemo', 'radiation', 'surgery', 'medicine', 'doctor'],
    responses: [
      "Treatment options for breast cancer include surgery (lumpectomy or mastectomy), chemotherapy, radiation therapy, hormone therapy, and targeted therapy. Your oncologist will recommend the best approach for your specific case.",
      "Breast cancer treatment is personalized based on cancer type and stage. Common treatments include surgery to remove tumors, chemotherapy, radiation, and targeted therapies. Recent advances have significantly improved outcomes.",
      "Modern breast cancer treatments are highly effective. Options include surgery, chemotherapy, radiation, and advanced targeted therapies. Your medical team will create a personalized treatment plan based on your specific diagnosis."
    ]
  },
  risk: {
    keywords: ['risk', 'risk factor', 'chance', 'likelihood', 'who get', 'who gets', 'family', 'hereditary'],
    responses: [
      "Risk factors for breast cancer include: age (risk increases with age), family history, genetic mutations (BRCA1/BRCA2), early menstruation, late menopause, and certain lifestyle factors.",
      "While breast cancer risk increases with age and family history, most cases occur in women without known risk factors. Being aware of your family history and discussing it with your doctor is important.",
      "Key risk factors include age, family history, genetic factors (like BRCA genes), reproductive history, and lifestyle factors. Having risk factors doesn't mean you'll develop cancer, and many diagnosed patients have no known risk factors."
    ]
  },
  mentalHealth: {
    keywords: ['stress', 'anxiety', 'depression', 'mental', 'emotional', 'scared', 'worried', 'fear', 'cope'],
    responses: [
      "It's completely normal to feel anxious or stressed after a breast cancer diagnosis. Consider talking to a mental health professional, joining a support group, practicing relaxation techniques, or speaking with loved ones about your feelings.",
      "Managing emotional health is important during your cancer journey. Practice self-care, stay connected with supportive people, consider counseling, and remember that it's okay to feel overwhelmed sometimes.",
      "Emotional support is crucial. Don't hesitate to seek professional help if you're feeling anxious or depressed. Many hospitals offer support groups and counseling services for cancer patients and survivors."
    ]
  },
  survival: {
    keywords: ['survival', 'survivor', 'outcome', 'prognosis', 'stage', 'stage 1', 'stage 2', 'stage 3', 'stage 4'],
    responses: [
      "Breast cancer survival rates have improved significantly with modern treatments. Early detection leads to the best outcomes. Survival rates vary by cancer stage, with early-stage cancers having over 90% five-year survival rates.",
      "Today, many women survive breast cancer thanks to early detection and improved treatments. Survival rates are highest when cancer is caught early. Your medical team will discuss your specific prognosis.",
      "Breast cancer is highly treatable, especially when detected early. Modern treatments have significantly improved survival rates. The five-year survival rate for localized breast cancer is over 99%."
    ]
  },
  support: {
    keywords: ['support', 'help', 'resources', ' groups', 'donate', 'charity', 'organization'],
    responses: [
      "For support, consider Rossy Resilience Foundation which provides resources for breast cancer patients. You can also contact your healthcare team for local support groups and counseling services.",
      "We're here to help! Connect with your healthcare team for resources, ask questions through this chatbot, or explore organizations like the American Cancer Society for additional support.",
      "Your healthcare provider can connect you with support groups, counseling services, and financial assistance programs. Many communities also have local breast cancer support organizations."
    ]
  },
  appointment: {
    keywords: ['appointment', 'visit', 'schedule', 'book', 'doctor', 'clinic', 'hospital', 'upcoming'],
    responses: [
      "You can schedule or view your appointments through the dashboard. Go to the Visits section to see upcoming appointments or book new ones with your healthcare provider.",
      "To manage your appointments, visit the Appointments page in your patient dashboard. You can view upcoming visits, reschedule, or book new appointments with your care team.",
      "Your appointment information is available in the Visits section of your patient dashboard. Contact your healthcare provider's office directly for scheduling changes or urgent appointments."
    ]
  },
  carePlan: {
    keywords: ['care plan', 'treatment plan', 'plan', 'schedule', 'medication', 'medicine', 'drug'],
    responses: [
      "Your personalized care plan is available in the Care Plan section of your patient dashboard. It outlines your treatment schedule, medications, and follow-up care instructions.",
      "You can view your complete care plan in the Care Plan section. This includes your treatment schedule, medications, appointment reminders, and other important care instructions from your medical team.",
      "Your care plan is accessible through your patient dashboard. It contains all your treatment details, medication schedules, and follow-up care information tailored to your specific diagnosis."
    ]
  },
  history: {
    keywords: ['history', 'medical history', 'record', 'records', 'past', 'previous'],
    responses: [
      "You can view your medical history, including past visits and treatments, in the History section of your patient dashboard.",
      "Your complete medical history is available in the patient dashboard's History section. This includes all your recorded visits, diagnoses, and treatment information.",
      "Access your health records through the History section. Your medical history, including previous visits and treatments, is stored securely and available for your review."
    ]
  },
  contact: {
    keywords: ['contact', 'reach', 'talk', 'speak', 'call', 'phone', 'email', 'message'],
    responses: [
      "You can contact your healthcare team through the patient portal or by calling your clinic directly. For urgent matters, please call your clinic's emergency line.",
      "To reach your healthcare team, use the patient portal messaging system or call your clinic directly. If this is an emergency, please call 911 or go to the nearest emergency room.",
      "You can message your doctor through the patient portal or call your clinic. For immediate medical concerns, contact emergency services or visit your nearest emergency room."
    ]
  },
  default: {
    keywords: [],
    responses: [
      "I'm here to help with general health questions. You can ask me about breast cancer symptoms, prevention, treatment, or how to use this website.",
      "I understand you have a question. I can help with information about breast cancer, symptoms, prevention, screening, and using this platform.",
      "For specific medical advice, please consult your healthcare provider. I'm happy to answer general questions about breast cancer or help you navigate this website."
    ]
  }
};

const getRuleBasedResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();
  
  for (const [category, data] of Object.entries(ruleBasedResponses)) {
    if (category === 'default') continue;
    
    const hasKeyword = data.keywords.some(keyword => lowerMessage.includes(keyword));
    if (hasKeyword) {
      const randomIndex = Math.floor(Math.random() * data.responses.length);
      return { 
        response: data.responses[randomIndex], 
        hasDisclaimer: true 
      };
    }
  }
  
  const defaultResponses = ruleBasedResponses.default.responses;
  const randomIndex = Math.floor(Math.random() * defaultResponses.length);
  return { 
    response: defaultResponses[randomIndex], 
    hasDisclaimer: true 
  };
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm Rossy Resilience Health Assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Floating button styles
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

  // Chat window styles
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

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Header styles
  const headerStyle = {
    backgroundColor: '#831843',
    color: '#ffffff',
    padding: '16px 20px',
    borderRadius: '20px 20px 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  // Messages container styles
  const messagesContainerStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#FDF2F8',
  };

  // Chat bubble styles
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
  };

  // Typing indicator styles
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

  // Input area styles
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

  // Disclaimer banner styles
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

  // Suggestion chips styles
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

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    const newUserMessage = { 
      id: Date.now(), 
      text: userMessage, 
      sender: 'user' 
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      const { response, hasDisclaimer } = getRuleBasedResponse(userMessage);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        hasDisclaimer: hasDisclaimer
      };
      setMessages(prev => [...prev, botMessage]);
      
      if (hasDisclaimer) {
        setShowDisclaimer(true);
      }
      setIsLoading(false);
    }, 500);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputText(suggestion);
    inputRef.current?.focus();
  };

  // Chat icon SVG (robot/health assistant icon)
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

  // Close icon SVG
  const closeIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  // Send icon SVG
  const sendIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );

  // Typing dots component
  const TypingIndicator = () => (
    <div style={typingIndicatorStyle}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#831843', animation: 'bounce 1s infinite' }} />
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#831843', animation: 'bounce 1s infinite 0.2s' }} />
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#831843', animation: 'bounce 1s infinite 0.4s' }} />
    </div>
  );

  // Suggestions for initial view
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
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Rossy Resilience</div>
              </div>
            </div>
          </div>

          <div style={messagesContainerStyle}>
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
            
            {/* Typing indicator */}
            {isLoading && <TypingIndicator />}
            
            {/* Show suggestions on first message if only bot message */}
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

          {/* Medical Disclaimer */}
          {showDisclaimer && (
            <div style={disclaimerStyle}>
              ⚠️ <strong>Medical Disclaimer:</strong> This chatbot provides general health information and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for medical concerns.
            </div>
          )}

          {/* Input area */}
          <div style={inputAreaStyle}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              style={inputStyle}
              disabled={isLoading}
            />
            <button
              className="send-btn"
              style={{
                ...sendButtonStyle,
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
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
