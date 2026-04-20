import React from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================
// BACKGROUND IMAGE - PUT YOUR IMAGE PATH HERE
// ============================================
// Put your image in: public/images/ folder, then use format: "/images/filename.jpg"
const BACKGROUND_IMAGE = "/images/bgimagehome.jpg";
// ============================================

// ============================================
// LOGO IMAGE - PUT YOUR LOGO PATH HERE
// ============================================
// Put your logo in: public/images/ folder, then use format: "/images/filename.png"
// Leave empty to show default text logo
const LOGO_IMAGE = "/images/ourlogo.png";
// ============================================

const Home = () => {
  const navigate = useNavigate();

  // Main container - full viewport without scroll
  const containerStyle = {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#FFF0F5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
    overflow: 'hidden',
    position: 'relative',
    backgroundImage: BACKGROUND_IMAGE ? `url(${BACKGROUND_IMAGE})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  // Card container - fits screen
  const cardStyle = {
    width: '100%',
    maxWidth: '1100px',
    height: 'calc(100vh - 40px)',
    maxHeight: '750px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    border: '1px solid rgba(233, 30, 99, 0.2)',
    boxShadow: '0 20px 60px rgba(233, 30, 99, 0.15), 0 8px 20px rgba(0,0,0,0.08)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    zIndex: 1,
  };

  // Header row
  const headerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8px 20px',
    borderBottom: '1px solid rgba(233, 30, 99, 0.1)',
    position: 'relative',
    zIndex: 1,
    flexShrink: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  };

  // Logo section
  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  // Logo image or circle
  const logoImageStyle = LOGO_IMAGE ? {
    height: '100px',
    width: 'auto',
  } : {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #E91E63 0%, #FF4081 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)',
  };

  const titleContainerStyle = {
    textAlign: 'center',
    padding: '10px 0 6px 0',
    position: 'relative',
    zIndex: 1,
    flexShrink: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  };

  const mainTitleStyle = {
    fontSize: '36px',
    fontWeight: '700',
    color: '#880E4F',
    letterSpacing: '2px',
    margin: 0,
    textShadow: '1px 1px 2px rgba(233, 30, 99, 0.1)',
  };

  // Content area - takes remaining space
  const contentStyle = {
    display: 'flex',
    gap: '20px',
    padding: '8px 28px 16px 28px',
    flex: 1,
    position: 'relative',
    zIndex: 1,
    overflow: 'hidden',
    minHeight: 0,
  };

  // Column styles
  const columnStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minHeight: 0,
  };

  const columnTitleStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#880E4F',
    marginBottom: '2px',
    flexShrink: 0,
  };

  // Card styles - equal height
  const cardBaseStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '12px',
    padding: '14px 16px',
    boxShadow: '0 4px 12px rgba(233, 30, 99, 0.08), 0 2px 4px rgba(0,0,0,0.04)',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflow: 'hidden',
    border: '1px solid rgba(233, 30, 99, 0.1)',
  };

  const cardTitleStyle = {
    fontSize: '15px',
    fontWeight: '700',
    color: '#C2185B',
    marginBottom: '8px',
    flexShrink: 0,
  };

  const bulletStyle = {
    fontSize: '13px',
    color: '#424242',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    lineHeight: 1.3,
  };

  const bulletDotStyle = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#E91E63',
    flexShrink: 0,
  };

  // Bottom button
  const buttonContainerStyle = {
    position: 'absolute',
    bottom: '16px',
    right: '28px',
    zIndex: 2,
  };

  const buttonStyle = {
    padding: '12px 28px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #E91E63 0%, #FF4081 100%)',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(233, 30, 99, 0.4)',
    transition: 'all 0.3s ease',
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={logoContainerStyle}>
            {LOGO_IMAGE ? (
              <img src={LOGO_IMAGE} alt="Logo" style={logoImageStyle} />
            ) : (
              <div style={logoImageStyle}>
                <svg width="24" height="24" viewBox="0 0 30 30" fill="white">
                  <circle cx="15" cy="8" r="6" fill="white"/>
                  <path d="M8 28 Q8 18 15 14 Q22 18 22 28 L22 30 L8 30 Z" fill="white"/>
                  <path d="M10 14 L10 8 L20 8 L20 14" fill="none" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
            )}
            
          </div>
          
        </div>

        {/* Main Title */}
        <div style={titleContainerStyle}>
          <h1 style={mainTitleStyle}>Rossy Resilience</h1>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Left Column */}
          <div style={columnStyle}>
            <h2 style={columnTitleStyle}>What we provide</h2>
            
            {/* Card 1: For Patients */}
            <div style={cardBaseStyle}>
              <h3 style={cardTitleStyle}>For Patients</h3>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>Ai diagnosis</div>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>Recommendation for next step</div>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>connection with doctor</div>
            </div>

            {/* Card 2: For Doctors */}
            <div style={cardBaseStyle}>
              <h3 style={cardTitleStyle}>For Doctors</h3>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>Review patient files</div>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>Run AI diagnosis & staging</div>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>Submit final diagnosis</div>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>Add clinical notes</div>
            </div>

            {/* Card 3: Why Choose Us */}
            <div style={cardBaseStyle}>
              <h3 style={cardTitleStyle}>Why Choose Us</h3>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>Faster diagnosis</div>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>Reduced stress</div>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>AI-supported decisions</div>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>Organized care</div>
            </div>
          </div>

          {/* Right Column */}
          <div style={columnStyle}>
            <h2 style={columnTitleStyle}>How to Reduce Breast Cancer Risk</h2>

            {/* Card 1: Early Detection */}
            <div style={cardBaseStyle}>
              <h3 style={cardTitleStyle}>Early Detection & Awareness</h3>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>Perform monthly breast self-exams</div>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>Schedule regular screenings and check-ups</div>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>Know your family medical history</div>
            </div>

            {/* Card 2: Healthy Lifestyle */}
            <div style={cardBaseStyle}>
              <h3 style={cardTitleStyle}>Healthy Lifestyle</h3>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>Stay physically active</div>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>Eat balanced, nutritious meals</div>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>Maintain a healthy weight</div>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>Avoid smoking and limit alcohol</div>
            </div>

            {/* Card 3: Emotional Well-Being */}
            <div style={cardBaseStyle}>
              <h3 style={cardTitleStyle}>Emotional Well-Being</h3>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>Manage stress and anxiety</div>
              <div style={bulletStyle}><span style={bulletDotStyle}></span>Practice relaxation</div>
            </div>
          </div>
        </div>

        {/* Bottom Button */}
        <div style={buttonContainerStyle}>
          <button 
            style={buttonStyle}
            onClick={handleLogin}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 20px rgba(233, 30, 99, 0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(233, 30, 99, 0.4)';
            }}
          >
            GET STARTED
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
