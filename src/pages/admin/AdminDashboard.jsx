import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import logo from '../../assets/images/RSlogo2.png';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const pendingRes = await API.get('/admin/doctors/pending');
      const allRes = await API.get('/admin/doctors');
      
      if (pendingRes.data.success) {
        setPendingDoctors(pendingRes.data.doctors || []);
      }
      if (allRes.data.success) {
        setAllDoctors(allRes.data.doctors || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setPendingDoctors([]);
      setAllDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApprove = async (doctorId) => {
    try {
      const res = await API.put(`/admin/doctors/${doctorId}/approve`);
      if (res.data.success) {
        setPendingDoctors(prev => prev.filter(d => d.id !== doctorId));
        fetchDoctors();
        showNotification('Doctor has been approved successfully!');
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to approve doctor', 'error');
    }
  };

  const handleReject = async (doctorId) => {
    try {
      const res = await API.put(`/admin/doctors/${doctorId}/reject`);
      if (res.data.success) {
        setPendingDoctors(prev => prev.filter(d => d.id !== doctorId));
        fetchDoctors();
        showNotification('Doctor has been rejected.');
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to reject doctor', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#FCE7F3',
  };

  const headerStyle = {
    backgroundColor: '#ffffff',
    padding: '16px 32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const logoImageStyle = {
    width: '40px',
    height: '40px',
    objectFit: 'contain',
  };

  const logoTextStyle = {
    fontSize: '22px',
    fontWeight: '700',
    color: '#831843',
  };

  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  };

  const logoutButtonStyle = {
    padding: '10px 20px',
    backgroundColor: '#DB2777',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  };

  const userNameStyle = {
    fontSize: '14px',
    color: '#831843',
    fontWeight: '500',
  };

  const mainContentStyle = {
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const pageTitleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#831843',
    marginBottom: '24px',
  };

  const tabContainerStyle = {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
  };

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    backgroundColor: isActive ? '#DB2777' : '#ffffff',
    color: isActive ? '#ffffff' : '#831843',
    border: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
  });

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  };

  const cardHeaderStyle = {
    padding: '16px 24px',
    backgroundColor: '#FDF2F8',
    borderBottom: '1px solid #F9A8D4',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const cardTitleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#831843',
  };

  const badgeStyle = (count) => ({
    backgroundColor: count > 0 ? '#DB2777' : '#9CA3AF',
    color: '#ffffff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
  });

  const listStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  };

  const listItemStyle = {
    padding: '16px 24px',
    borderBottom: '1px solid #F3F4F6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const userDetailsStyle = {
    flex: 1,
  };

  const userNameStyle2 = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px',
  };

  const userEmailStyle = {
    fontSize: '14px',
    color: '#6B7280',
    marginBottom: '2px',
  };

  const userPhoneStyle = {
    fontSize: '13px',
    color: '#9CA3AF',
  };

  const specialtyStyle = {
    fontSize: '14px',
    color: '#DB2777',
    fontWeight: '500',
    marginTop: '4px',
  };

  const statusBadgeStyle = (status) => {
    const colors = {
      pending: { bg: '#FEF3C7', color: '#92400E' },
      active: { bg: '#D1FAE5', color: '#065F46' },
      rejected: { bg: '#FEE2E2', color: '#991B1B' },
    };
    return {
      padding: '4px 10px',
      borderRadius: '15px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: colors[status]?.bg || colors.pending.bg,
      color: colors[status]?.color || colors.pending.color,
    };
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: '8px',
  };

  const approveButtonStyle = {
    padding: '8px 16px',
    backgroundColor: '#10B981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  };

  const rejectButtonStyle = {
    padding: '8px 16px',
    backgroundColor: '#EF4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  };

  const emptyStateStyle = {
    padding: '48px',
    textAlign: 'center',
    color: '#6B7280',
    fontSize: '16px',
  };

  const loadingStyle = {
    padding: '48px',
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: '16px',
  };

  const notificationStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '16px 24px',
    borderRadius: '8px',
    backgroundColor: notification?.type === 'error' ? '#EF4444' : '#10B981',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
  };

  return (
    <div style={containerStyle}>
      {notification && (
        <div style={notificationStyle}>
          {notification.message}
        </div>
      )}
      
      <header style={headerStyle}>
        <div style={logoContainerStyle}>
          <img 
            src={logo} 
            alt="Rossy Resilience Logo" 
            style={logoImageStyle}
          />
          <span style={logoTextStyle}>Rossy Resilience</span>
        </div>
        
        <div style={userInfoStyle}>
          <span style={userNameStyle}>Admin</span>
          <button 
            style={logoutButtonStyle}
            onClick={handleLogout}
            onMouseOver={(e) => e.target.style.backgroundColor = '#BE185D'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#DB2777'}
          >
            Logout
          </button>
        </div>
      </header>
      
      <main style={mainContentStyle}>
        <h1 style={pageTitleStyle}>Admin Dashboard</h1>
        
        <div style={tabContainerStyle}>
          <button 
            style={tabStyle(activeTab === 'pending')}
            onClick={() => setActiveTab('pending')}
          >
            Pending Doctors ({pendingDoctors.length})
          </button>
          <button 
            style={tabStyle(activeTab === 'all')}
            onClick={() => setActiveTab('all')}
          >
            All Doctors ({allDoctors.length})
          </button>
        </div>
        
        {activeTab === 'pending' && (
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <h2 style={cardTitleStyle}>Pending Doctor Approvals</h2>
              <span style={badgeStyle(pendingDoctors.length)}>{pendingDoctors.length} pending</span>
            </div>
            
            {loading ? (
              <div style={loadingStyle}>Loading...</div>
            ) : pendingDoctors.length > 0 ? (
              <ul style={listStyle}>
                {pendingDoctors.map(doctor => (
                  <li key={doctor.doctor.id} style={listItemStyle}>
                    <div style={userDetailsStyle}>
                      <div style={userNameStyle2}>{doctor.full_name}</div>
                      <div style={userEmailStyle}>{doctor.email}</div>
                      <div style={userPhoneStyle}>{doctor.phone_number}</div>
                      <div style={specialtyStyle}>Specialty: {doctor.specialization}</div>
                    </div>
                    <div style={actionButtonsStyle}>
                      <button 
                        style={approveButtonStyle}
                        onClick={() => handleApprove(doctor.doctor.id)}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#10B981'}
                      >
                        Approve
                      </button>
                      <button 
                        style={rejectButtonStyle}
                        onClick={() => handleReject(doctor.doctor.id)}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#DC2626'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#EF4444'}
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={emptyStateStyle}>
                No pending doctor approvals
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'all' && (
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <h2 style={cardTitleStyle}>All Doctors</h2>
              <span style={badgeStyle(allDoctors.length)}>{allDoctors.length} total</span>
            </div>
            
            {loading ? (
              <div style={loadingStyle}>Loading...</div>
            ) : allDoctors.length > 0 ? (
              <ul style={listStyle}>
                {allDoctors.map(doctor => (
                  <li key={doctor.doctor.id} style={listItemStyle}>
                    <div style={userDetailsStyle}>
                      <div style={userNameStyle2}>{doctor.full_name}</div>
                      <div style={userEmailStyle}>{doctor.email}</div>
                      <div style={userPhoneStyle}>{doctor.phone_number}</div>
                      <div style={specialtyStyle}>Specialty: {doctor.specialization}</div>
                    </div>
                    <span style={statusBadgeStyle(doctor.status)}>
                      {doctor.status?.charAt(0).toUpperCase() + doctor.status?.slice(1)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={emptyStateStyle}>
                No doctors found
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;