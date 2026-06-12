import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import logo from '../../assets/images/RSlogo2.png';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allDoctors,     setAllDoctors]     = useState([]);
  const [activeTab,      setActiveTab]      = useState('pending');
  const [notification,   setNotification]   = useState(null);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        API.get('/admin/doctors/pending'),
        API.get('/admin/doctors'),
      ]);
      if (pendingRes.data.success) setPendingDoctors(pendingRes.data.doctors || []);
      if (allRes.data.success)     setAllDoctors(allRes.data.doctors || []);
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
    const res = await API.put(`/admin/doctors/${doctorId}/approve`, {});  // ← add {}
    if (res.data.success) {
      fetchDoctors();
      showNotification('Doctor has been approved successfully!');
    }
  } catch (error) {
    showNotification(
      error.response?.data?.message || 'Failed to approve doctor', 'error'
    );
  }
};
  const handleReject = async (doctorId) => {
  try {
    const res = await API.put(`/admin/doctors/${doctorId}/reject`, {});  // ← add {}
    if (res.data.success) {
      fetchDoctors();
      showNotification('Doctor has been rejected.');
    }
  } catch (error) {
    showNotification(
      error.response?.data?.message || 'Failed to reject doctor', 'error'
    );
  }
};
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ── styles ────────────────────────────────────────────
  const containerStyle = { minHeight: '100vh', backgroundColor: '#FCE7F3' };

  const headerStyle = {
    backgroundColor: '#ffffff', padding: '16px 32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  };

  const mainContentStyle = { padding: '32px', maxWidth: '1200px', margin: '0 auto' };

  const tabStyle = (isActive) => ({
    padding: '12px 24px', borderRadius: '8px', fontSize: '16px',
    fontWeight: '600', cursor: 'pointer',
    backgroundColor: isActive ? '#DB2777' : '#ffffff',
    color: isActive ? '#ffffff' : '#831843',
    border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  });

  const cardStyle = {
    backgroundColor: '#ffffff', borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden',
  };

  const listItemStyle = {
    padding: '16px 24px', borderBottom: '1px solid #F3F4F6',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  };

  const statusBadgeStyle = (status) => {
    const colors = {
      pending:  { bg: '#FEF3C7', color: '#92400E' },
      verified: { bg: '#D1FAE5', color: '#065F46' },
      rejected: { bg: '#FEE2E2', color: '#991B1B' },
    };
    return {
      padding: '4px 10px', borderRadius: '15px',
      fontSize: '12px', fontWeight: '600',
      backgroundColor: colors[status]?.bg || colors.pending.bg,
      color:           colors[status]?.color || colors.pending.color,
    };
  };

  const notificationStyle = {
    position: 'fixed', top: '20px', right: '20px',
    padding: '16px 24px', borderRadius: '8px',
    backgroundColor: notification?.type === 'error' ? '#EF4444' : '#10B981',
    color: '#ffffff', fontSize: '14px', fontWeight: '500',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000,
  };

  const DoctorRow = ({ doctor, showActions }) => (
    <li style={listItemStyle}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
          {doctor.full_name}
        </div>
        <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '2px' }}>
          {doctor.email}
        </div>
        <div style={{ fontSize: '13px', color: '#9CA3AF' }}>
          {doctor.phone_number}
        </div>
        <div style={{ fontSize: '14px', color: '#DB2777', fontWeight: '500', marginTop: '4px' }}>
          {doctor.specialization} — {doctor.hospital}
        </div>
      </div>

      {showActions ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{ padding: '8px 16px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            onClick={() => handleApprove(doctor.doctor_id)}
          >
            Approve
          </button>
          <button
            style={{ padding: '8px 16px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            onClick={() => handleReject(doctor.doctor_id)}
          >
            Reject
          </button>
        </div>
      ) : (
        <span style={statusBadgeStyle(doctor.verification_status)}>
          {doctor.verification_status?.charAt(0).toUpperCase() + doctor.verification_status?.slice(1)}
        </span>
      )}
    </li>
  );

  return (
    <div style={containerStyle}>
      {notification && <div style={notificationStyle}>{notification.message}</div>}

      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logo} alt="logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          <span style={{ fontSize: '22px', fontWeight: '700', color: '#831843' }}>Rossy Resilience</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#831843', fontWeight: '500' }}>
            {user?.full_name || 'Admin'}
          </span>
          <button
            style={{ padding: '10px 20px', backgroundColor: '#DB2777', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={mainContentStyle}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#831843', marginBottom: '24px' }}>
          Admin Dashboard
        </h1>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <button style={tabStyle(activeTab === 'pending')} onClick={() => setActiveTab('pending')}>
            Pending Doctors ({pendingDoctors.length})
          </button>
          <button style={tabStyle(activeTab === 'all')} onClick={() => setActiveTab('all')}>
            All Doctors ({allDoctors.length})
          </button>
        </div>

        <div style={cardStyle}>
          <div style={{ padding: '16px 24px', backgroundColor: '#FDF2F8', borderBottom: '1px solid #F9A8D4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#831843' }}>
              {activeTab === 'pending' ? 'Pending Doctor Approvals' : 'All Doctors'}
            </h2>
            <span style={{ backgroundColor: '#DB2777', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' }}>
              {activeTab === 'pending' ? pendingDoctors.length : allDoctors.length}
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF' }}>Loading...</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {activeTab === 'pending' && (
                pendingDoctors.length > 0
                  ? pendingDoctors.map(d => <DoctorRow key={d.doctor_id} doctor={d} showActions={true} />)
                  : <li style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>No pending approvals</li>
              )}
              {activeTab === 'all' && (
                allDoctors.length > 0
                  ? allDoctors.map(d => <DoctorRow key={d.doctor_id} doctor={d} showActions={false} />)
                  : <li style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>No doctors found</li>
              )}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;