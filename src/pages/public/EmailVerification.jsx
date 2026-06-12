import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import logo from '../../assets/images/RSlogo2.png';
import authService from '../../services/authService';

const EmailVerification = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const email     = location.state?.email || '';
  const role      = location.state?.role  || 'patient'; // 👈 read role
  const { login } = useAuth();

  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [errors,           setErrors]           = useState({});
  const [isLoading,        setIsLoading]        = useState(false);
  const [resendTimer,      setResendTimer]      = useState(0);
  const [resendEnabled,    setResendEnabled]    = useState(true);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendEnabled(true);
    }
  }, [resendTimer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newCode = [...verificationCode];
    newCode[index] = element.value;
    setVerificationCode(newCode);
    if (errors.code) setErrors(prev => ({ ...prev, code: '' }));
    if (element.value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && verificationCode[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newCode = [...verificationCode];
    for (let i = 0; i < pastedData.length; i++) {
      if (!isNaN(pastedData[i])) newCode[i] = pastedData[i];
    }
    setVerificationCode(newCode);
    const lastFilledIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = verificationCode.join('');

    if (code.length !== 6) {
      setErrors({ code: 'Please enter the complete 6-digit code' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // 👇 pick the right function based on role
      const response = role === 'doctor'
        ? await authService.verifyDoctorEmail(code)
        : await authService.verifyPatientEmail(code);

      if (response.success) {
        localStorage.removeItem('pendingUser');

        // doctors don't get a user back — they wait for admin approval
        if (role === 'doctor') {
          navigate('/pending-approval');
          return;
        }

        /// admins get logged in immediately
if (response.user?.role === 'admin') {
  if (response.user) login(response.user);
  navigate('/admin/dashboard');
} else {
  // patients must go through login so consent page appears
  navigate('/login');
}

      } else {
        setErrors({ code: response.message || 'Invalid verification code' });
      }

    } catch (error) {
      setErrors({ code: error.message || 'Verification failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendEnabled(false);
    setResendTimer(60);
    setErrors({});

    try {
      // 👇 pick the right resend function based on role
      const response = role === 'doctor'
        ? await authService.resendDoctorCode()
        : await authService.resendPatientCode();

      if (!response.success) {
        setErrors({ general: response.message || 'Failed to resend code.' });
        setResendEnabled(true);
        setResendTimer(0);
      }
    } catch (error) {
      setErrors({ general: error.message || 'Failed to resend code.' });
      setResendEnabled(true);
      setResendTimer(0);
    }
  };

  // ── styles ────────────────────────────────────────────
  const containerStyle = {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#FCE7F3', padding: '20px',
  };
  const cardStyle = {
    backgroundColor: '#ffffff', padding: '48px', borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(219,39,119,0.15)',
    width: '100%', maxWidth: '420px', textAlign: 'center',
  };
  const codeInputStyle = (hasError) => ({
    width: '48px', height: '56px', textAlign: 'center',
    fontSize: '24px', fontWeight: '600', borderRadius: '8px',
    border: hasError ? '2px solid #DB2777' : '2px solid #F9A8D4',
    backgroundColor: '#FDF2F8', color: '#831843',
    outline: 'none', transition: 'border-color 0.3s ease',
  });

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
          <img src={logo} alt="logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#831843' }}>Rossy Resilience</h1>
        </div>
        <p style={{ fontSize: '14px', color: '#9D174D', marginBottom: '24px' }}>Your Health, Our Priority</p>

        {/* Icon */}
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '36px' }}>
          📧
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#831843', marginBottom: '12px' }}>Verify Your Email</h2>
        <p style={{ fontSize: '14px', color: '#9D174D', marginBottom: '32px', lineHeight: '1.6' }}>
          We've sent a 6-digit verification code to<br />
          <span style={{ fontWeight: '600', color: '#831843' }}>{email}</span>
        </p>

        {errors.general && (
          <div style={{ color: '#DB2777', fontSize: '14px', marginBottom: '16px' }}>{errors.general}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                ref={(el) => inputRefs.current[index] = el}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                style={codeInputStyle(!!errors.code)}
                disabled={isLoading}
              />
            ))}
          </div>

          {errors.code && (
            <div style={{ color: '#DB2777', fontSize: '14px', marginBottom: '16px' }}>{errors.code}</div>
          )}

          <Button type="submit" disabled={isLoading} style={{ width: '100%' }}>
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Button>
        </form>

        {/* Resend */}
        <div style={{ marginTop: '16px', fontSize: '14px', color: '#9D174D' }}>
          {resendEnabled ? (
            <button type="button" onClick={handleResendCode}
              style={{ background: 'none', border: 'none', color: '#DB2777', fontWeight: '600', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>
              Resend Verification Code
            </button>
          ) : (
            <span>Resend code in {resendTimer} seconds</span>
          )}
        </div>

        <div style={{ marginTop: '32px', fontSize: '14px', color: '#9D174D' }}>
          Already verified? <Link to="/login" style={{ color: '#DB2777', fontWeight: '500' }}>Login</Link>
        </div>

      </div>
    </div>
  );
};

export default EmailVerification;