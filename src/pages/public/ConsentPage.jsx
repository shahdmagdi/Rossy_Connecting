import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import logo from '../../assets/images/RSlogo2.png';

const ConsentPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  // temp_token and user info were passed via navigate state from Login
  const tempToken = location.state?.temp_token;
  const userData  = location.state?.user;

  const [accepted, setAccepted]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // If someone lands here without a temp_token, send them back to login
  if (!tempToken) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleAccept = async () => {
    if (!accepted) { setError('Please check the box to confirm you have read and agree to the terms.'); return; }

    try {
      setLoading(true);
      setError('');
      const response = await authService.acceptConsent(tempToken);

      // Full login — store user and set cookies (backend sets them)
      login(response.user);
      navigate('/patient/dashboard', { replace: true });

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    // Just send them back to login — no account deletion
    navigate('/login', { replace: true });
  };

  return (
    <div style={styles.page}>
      {/* Background decoration */}
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />

      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logoRow}>
          <img src={logo} alt="Rossy Resilience" style={styles.logoImg} />
          <span style={styles.logoText}>Rossy Resilience</span>
        </div>

        {/* Greeting */}
        {userData?.full_name && (
          <p style={styles.greeting}>Welcome, <strong>{userData.full_name}</strong> 👋</p>
        )}

        <h1 style={styles.title}>Terms & Conditions</h1>
        <p style={styles.subtitle}>
          Before you continue, please read and accept our terms of use and privacy policy.
        </p>

        {/* Consent document */}
        <div style={styles.scrollBox}>

          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>1. Data Collection & Usage</h3>
            <p style={styles.sectionText}>
              By using Rossy Resilience, you agree that we may collect and process your personal
              health information, including but not limited to: medical history, visit records,
              care plans, and diagnostic results. This data is used solely to provide and improve
              your healthcare experience on our platform.
            </p>
          </section>

          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>2. Doctor Access to Your Records</h3>
            <p style={styles.sectionText}>
              Your assigned doctor will have access to your health records, scans, and clinical
              notes within this platform. This access is strictly limited to healthcare professionals
              involved in your care and is protected under applicable medical privacy regulations.
            </p>
          </section>

          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>3. AI-Assisted Features</h3>
            <p style={styles.sectionText}>
              Our platform uses AI-powered tools, including a health chatbot and diagnostic
              assistance features. These tools are designed to support — not replace — your
              doctor's professional judgment. Always consult a qualified healthcare provider
              for medical decisions.
            </p>
          </section>

          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>4. Data Security</h3>
            <p style={styles.sectionText}>
              We implement industry-standard encryption and security practices to protect your
              personal health information. However, no system is completely immune to security
              risks, and you acknowledge this by using our platform.
            </p>
          </section>

          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>5. Your Rights</h3>
            <p style={styles.sectionText}>
              You have the right to access, correct, or request deletion of your personal data
              at any time by contacting our support team. You may also withdraw consent, which
              will result in account deactivation and removal of your data from our systems.
            </p>
          </section>

          <section style={{ ...styles.section, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
            <h3 style={styles.sectionTitle}>6. Updates to These Terms</h3>
            <p style={styles.sectionText}>
              We may update these terms from time to time. You will be notified of significant
              changes via email. Continued use of the platform following notification constitutes
              your acceptance of the revised terms.
            </p>
          </section>

        </div>

        {/* Checkbox */}
        <div
          style={{
            ...styles.checkRow,
            borderColor: accepted ? '#DB2777' : '#FECDD3',
            backgroundColor: accepted ? '#FDF2F8' : '#FFF1F2',
          }}
          onClick={() => { setAccepted(!accepted); setError(''); }}
        >
          <div style={{ ...styles.customCheck, borderColor: accepted ? '#DB2777' : '#FDA4AF', backgroundColor: accepted ? '#DB2777' : 'white' }}>
            {accepted && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <label style={styles.checkLabel}>
            I have read and agree to the <strong>Terms & Conditions</strong> and{' '}
            <strong>Privacy Policy</strong> of Rossy Resilience. I consent to the collection
            and use of my health data as described above.
          </label>
        </div>

        {/* Error */}
        {error && <p style={styles.errorText}>{error}</p>}

        {/* Buttons */}
        <div style={styles.btnRow}>
          <button style={styles.btnDecline} onClick={handleDecline} disabled={loading}>
            Decline
          </button>
          <button
            style={{
              ...styles.btnAccept,
              opacity: accepted && !loading ? 1 : 0.5,
              cursor: accepted && !loading ? 'pointer' : 'not-allowed',
            }}
            onClick={handleAccept}
            disabled={!accepted || loading}
          >
            {loading ? (
              <span style={styles.spinner}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                  </path>
                </svg>
              </span>
            ) : 'Accept & Continue'}
          </button>
        </div>

        <p style={styles.footNote}>
          Declining will return you to the login page. Your account will remain inactive until consent is given.
        </p>
      </div>
    </div>
  );
};

export default ConsentPage;

// ── Styles ────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#FCE7F3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 20px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'fixed',
    top: '-120px',
    right: '-120px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(251,207,232,0.7) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgCircle2: {
    position: 'fixed',
    bottom: '-100px',
    left: '-80px',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(253,164,175,0.4) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(190,18,60,0.12)',
    padding: '40px 40px 32px',
    width: '100%',
    maxWidth: '600px',
    position: 'relative',
    zIndex: 1,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  logoImg: {
    width: '36px',
    height: '36px',
    objectFit: 'contain',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#831843',
    letterSpacing: '-0.3px',
  },
  greeting: {
    fontSize: '14px',
    color: '#9D174D',
    marginBottom: '8px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#BE123C',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  scrollBox: {
    backgroundColor: '#FFF8FA',
    border: '1px solid #FECDD3',
    borderRadius: '12px',
    padding: '20px 22px',
    maxHeight: '260px',
    overflowY: 'auto',
    marginBottom: '20px',
    scrollbarWidth: 'thin',
    scrollbarColor: '#FDA4AF transparent',
  },
  section: {
    marginBottom: '18px',
    paddingBottom: '18px',
    borderBottom: '1px solid #FCE7F3',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#BE123C',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  sectionText: {
    fontSize: '13px',
    color: '#374151',
    lineHeight: '1.7',
  },
  checkRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1.5px solid',
    cursor: 'pointer',
    marginBottom: '16px',
    transition: 'all 0.2s ease',
    userSelect: 'none',
  },
  customCheck: {
    width: '20px',
    height: '20px',
    borderRadius: '5px',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '1px',
    transition: 'all 0.2s ease',
  },
  checkLabel: {
    fontSize: '13px',
    color: '#374151',
    lineHeight: '1.6',
    cursor: 'pointer',
  },
  errorText: {
    fontSize: '13px',
    color: '#BE123C',
    marginBottom: '12px',
    marginTop: '-8px',
  },
  btnRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  btnDecline: {
    flex: 1,
    padding: '13px',
    border: '1.5px solid #FECDD3',
    borderRadius: '10px',
    backgroundColor: 'white',
    color: '#9D174D',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  btnAccept: {
    flex: 2,
    padding: '13px',
    border: 'none',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #BE123C 0%, #DB2777 100%)',
    color: 'white',
    fontSize: '14px',
    fontWeight: '700',
    transition: 'opacity 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    display: 'flex',
    alignItems: 'center',
  },
  footNote: {
    fontSize: '12px',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: '1.5',
  },
};