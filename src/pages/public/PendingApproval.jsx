import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import logo from '../../assets/images/RSlogo2.png';
import { USER_STATUS } from '../../services/authService';

const PendingApproval = () => {
  const navigate = useNavigate();
  const { user, logout, checkApprovalStatus } = useAuth();
  const [isLoading,      setIsLoading]      = useState(false);
  const [statusMessage,  setStatusMessage]  = useState('');
  const [statusType,     setStatusType]     = useState(''); // 'pending' | 'approved' | 'rejected'

  // if somehow an approved doctor lands here, redirect them
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      if (u?.status === USER_STATUS.ACTIVE) {
        navigate('/doctor/dashboard');
      }
    }
  }, [navigate]);

  const handleCheckStatus = async () => {
    setIsLoading(true);
    setStatusMessage('');
    setStatusType('');

    try {
      const updatedUser = await checkApprovalStatus();

      if (!updatedUser) {
        setStatusType('pending');
        setStatusMessage('Your account is still pending approval. Please check back later.');
        return;
      }

      const status = updatedUser.status || updatedUser.verification_status;

      if (status === USER_STATUS.ACTIVE || status === 'approved') {
        setStatusType('approved');
        setStatusMessage('Your account has been approved! Redirecting to your dashboard...');
        setTimeout(() => navigate('/doctor/dashboard'), 1500);

      } else if (status === USER_STATUS.REJECTED || status === 'rejected') {
        setStatusType('rejected');
        setStatusMessage('Your account has been rejected. Please contact support for more information.');

      } else {
        setStatusType('pending');
        setStatusMessage('Your account is still pending approval. Our team typically reviews within 24-48 hours.');
      }

    } catch (error) {
      setStatusType('pending');
      setStatusMessage(error.message || 'Could not check status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // dynamic color for status message
  const statusColor = {
    approved: '#15803D',
    rejected: '#DB2777',
    pending:  '#92400E',
  }[statusType] || '#92400E';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCE7F3', padding: '20px' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '48px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(219,39,119,0.15)', width: '100%', maxWidth: '480px', textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <img src={logo} alt="logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#831843' }}>Rossy Resilience</h1>
        </div>
        <p style={{ fontSize: '14px', color: '#9D174D', marginBottom: '24px' }}>Your Health, Our Priority</p>

        {/* Icon */}
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '48px' }}>
          ⏳
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#92400E', marginBottom: '16px' }}>Account Pending Approval</h2>

        {/* Status box */}
        <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#92400E', marginBottom: '8px' }}>
            Under Review
          </h3>
          <p style={{ fontSize: '14px', color: '#B45309', lineHeight: '1.6' }}>
            Our admin team is reviewing your doctor registration.
            You'll be notified by email once your account has been approved.
          </p>
        </div>

        {/* Doctor info */}
        <div style={{ fontSize: '14px', color: '#9D174D', marginBottom: '24px' }}>
          <p>Name: <strong style={{ color: '#831843' }}>{user?.full_name || user?.name || 'Doctor'}</strong></p>
          <p>Email: <strong style={{ color: '#831843' }}>{user?.email || '—'}</strong></p>
          <p>Role: <strong style={{ color: '#831843' }}>Doctor</strong></p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Button onClick={handleCheckStatus} disabled={isLoading}>
            {isLoading ? 'Checking...' : 'Check Approval Status'}
          </Button>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        {/* Status message after check */}
        {statusMessage && (
          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: statusType === 'approved' ? '#DCFCE7' : statusType === 'rejected' ? '#FCE7F3' : '#FEF3C7', color: statusColor, fontSize: '14px', fontWeight: '500' }}>
            {statusMessage}
          </div>
        )}

        {/* What happens next */}
        <div style={{ backgroundColor: '#F3E8FF', border: '1px solid #9333EA', borderRadius: '8px', padding: '16px', marginTop: '24px', textAlign: 'left' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#7E22CE', marginBottom: '8px' }}>What happens next?</h4>
          <ul style={{ fontSize: '13px', color: '#6B21A8', paddingLeft: '16px', lineHeight: '1.8' }}>
            <li>Our admin team will review your credentials</li>
            <li>You'll receive an email once approved</li>
            <li>After approval, you can access the doctor dashboard</li>
            <li>This typically takes 24–48 hours</li>
          </ul>
        </div>

        <div style={{ marginTop: '16px', fontSize: '14px', color: '#9D174D' }}>
          Need help?{' '}
          <Link to="/contact" style={{ color: '#DB2777', fontWeight: '500' }}>Contact Support</Link>
        </div>

      </div>
    </div>
  );
};

export default PendingApproval;