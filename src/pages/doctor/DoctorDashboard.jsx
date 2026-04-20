import React from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const navigate = useNavigate();

  const containerStyle = {
    padding: '40px',
    maxWidth: '1400px',
    margin: '0 auto',
  };

  const welcomeStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#831843',
    marginBottom: '10px',
  };

  const subtitleStyle = {
    fontSize: '16px',
    color: '#9D174D',
    marginBottom: '40px',
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '40px',
  };

  const statCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(131, 24, 67, 0.08)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  };

  const statNumberStyle = {
    fontSize: '36px',
    fontWeight: '700',
    color: '#831843',
    marginBottom: '8px',
  };

  const statLabelStyle = {
    fontSize: '14px',
    color: '#9D174D',
    fontWeight: '500',
  };

  const sectionTitleStyle = {
    fontSize: '22px',
    fontWeight: '700',
    color: '#831843',
    marginBottom: '20px',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '30px',
  };

  const activityCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(131, 24, 67, 0.1)',
  };

  const activityItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderBottom: '1px solid #F9A8D4',
  };

  const activityInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  };

  const patientAvatarStyle = {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: '#FCE7F3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#831843',
    fontWeight: '600',
    fontSize: '16px',
  };

  const activityTextStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const patientNameStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#831843',
  };

  const activityDescStyle = {
    fontSize: '14px',
    color: '#9D174D',
  };

  const badgeStyle = (status) => {
    const colors = {
      pending: { bg: '#FEF3C7', color: '#92400E' },
      urgent: { bg: '#FEE2E2', color: '#991B1B' },
      completed: { bg: '#D1FAE5', color: '#065F46' },
    };
    return {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: colors[status]?.bg || colors.pending.bg,
      color: colors[status]?.color || colors.pending.color,
    };
  };

  const timeStyle = {
    fontSize: '13px',
    color: '#9D174D',
    marginTop: '4px',
  };

  const quickActionsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  };

  const actionButtonStyle = {
    backgroundColor: '#FCE7F3',
    border: 'none',
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    transition: 'all 0.3s ease',
    textAlign: 'left',
  };

  const actionIconStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    backgroundColor: '#DB2777',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    flexShrink: 0,
  };

  const actionTextStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const actionTitleStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#831843',
  };

  const actionDescStyle = {
    fontSize: '13px',
    color: '#9D174D',
  };

  const recentActivities = [
    { id: 1, name: 'Maria Garcia', activity: 'New mammogram uploaded', time: '2 hours ago', status: 'pending' },
    { id: 2, name: 'Jennifer Smith', activity: 'Pending diagnosis review', time: '4 hours ago', status: 'urgent' },
    { id: 3, name: 'Emily Johnson', activity: 'Care plan updated', time: '1 day ago', status: 'completed' },
    { id: 4, name: 'Sarah Williams', activity: 'Lab results received', time: '2 days ago', status: 'pending' },
    { id: 5, name: 'Lisa Brown', activity: 'Follow-up scheduled', time: '3 days ago', status: 'completed' },
  ];

  return (
    <div style={containerStyle}>
      <h1 style={welcomeStyle}>Welcome back, Dr. Sarah</h1>
      <p style={subtitleStyle}>Overview of your patient care activities</p>

      {/* Stats Cards */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <div style={statNumberStyle}>24</div>
          <div style={statLabelStyle}>Total Patients</div>
        </div>
        <div style={statCardStyle}>
          <div style={statNumberStyle}>8</div>
          <div style={statLabelStyle}>Pending Diagnosis</div>
        </div>
        <div style={statCardStyle}>
          <div style={statNumberStyle}>15</div>
          <div style={statLabelStyle}>Active Care Plans</div>
        </div>
        <div style={statCardStyle}>
          <div style={statNumberStyle}>12</div>
          <div style={statLabelStyle}>Recent Visits</div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={gridStyle}>
        {/* Recent Activity */}
        <div style={activityCardStyle}>
          <h2 style={sectionTitleStyle}>Recent Activity</h2>
          {recentActivities.map((item) => (
            <div key={item.id} style={activityItemStyle}>
              <div style={activityInfoStyle}>
                <div style={patientAvatarStyle}>
                  {item.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={activityTextStyle}>
                  <span style={patientNameStyle}>{item.name}</span>
                  <span style={activityDescStyle}>{item.activity}</span>
                  <span style={timeStyle}>{item.time}</span>
                </div>
              </div>
              <span style={badgeStyle(item.status)}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={activityCardStyle}>
          <h2 style={sectionTitleStyle}>Quick Actions</h2>
          <div style={quickActionsStyle}>
            <button
              style={actionButtonStyle}
              onClick={() => navigate('/doctor/patients')}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#F9A8D4';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#FCE7F3';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <div style={actionIconStyle}>👥</div>
              <div style={actionTextStyle}>
                <span style={actionTitleStyle}>Review Patients</span>
                <span style={actionDescStyle}>View all patient records</span>
              </div>
            </button>

            <button
              style={actionButtonStyle}
              onClick={() => navigate('/doctor/diagnosis')}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#F9A8D4';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#FCE7F3';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <div style={actionIconStyle}>🔬</div>
              <div style={actionTextStyle}>
                <span style={actionTitleStyle}>Add Diagnosis</span>
                <span style={actionDescStyle}>Create new diagnosis</span>
              </div>
            </button>

            <button
              style={actionButtonStyle}
              onClick={() => navigate('/doctor/notes')}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#F9A8D4';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#FCE7F3';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <div style={actionIconStyle}>📝</div>
              <div style={actionTextStyle}>
                <span style={actionTitleStyle}>View Notes</span>
                <span style={actionDescStyle}>Review clinical notes</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;