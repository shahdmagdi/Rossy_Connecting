import React, { useState } from 'react';

const Visits = () => {
  // Demo toggle - set to true to see active state, false for inactive
  const [isActive, setIsActive] = useState(false);

  // Sample visits data
  const visitsData = [
    {
      id: 1,
      date: 'March 15, 2026',
      type: 'General Checkup',
      files: 3,
      status: 'completed',
      icon: '🏥'
    },
    {
      id: 2,
      date: 'March 20, 2026',
      type: 'Follow-up Visit',
      files: 2,
      status: 'pending',
      icon: '📋'
    },
    {
      id: 3,
      date: 'March 25, 2026',
      type: 'Cardiology Consultation',
      files: 0,
      status: 'pending',
      icon: '❤️'
    }
  ];

  // Styles
  const containerStyle = {
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '15px',
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#831843',
    margin: 0,
  };

  const newVisitButtonStyle = {
    backgroundColor: '#DB2777',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.3s',
  };

  // Inactive State Styles
  const inactiveContainerStyle = {
    minHeight: 'calc(100vh - 200px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  };

  const inactiveCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(131, 24, 67, 0.15)',
    maxWidth: '500px',
    width: '100%',
    overflow: 'hidden',
  };

  const inactiveTopStyle = {
    backgroundColor: '#ffffff',
    padding: '40px 30px',
    textAlign: 'center',
    borderBottom: '1px solid #F3F4F6',
  };

  const inactiveIconStyle = {
    fontSize: '48px',
    marginBottom: '15px',
  };

  const inactiveTitleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#831843',
    marginBottom: '8px',
  };

  const inactiveSubtitleStyle = {
    fontSize: '14px',
    color: '#666',
  };

  const inactiveBottomStyle = {
    backgroundColor: '#F9FAFB',
    padding: '25px 30px',
    textAlign: 'center',
  };

  const inactiveBottomTextStyle = {
    fontSize: '13px',
    color: '#9CA3AF',
    margin: 0,
  };

  // Active State Styles
  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  };

  const statCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '25px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(131, 24, 67, 0.1)',
  };

  const statNumberStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#831843',
    marginBottom: '5px',
  };

  const statLabelStyle = {
    fontSize: '14px',
    color: '#666',
  };

  const visitsListStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 15px rgba(131, 24, 67, 0.1)',
    overflow: 'hidden',
  };

  const visitRowStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '20px 25px',
    borderBottom: '1px solid #F3F4F6',
    gap: '15px',
  };

  const visitIconStyle = {
    width: '45px',
    height: '45px',
    backgroundColor: '#FCE7F3',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  };

  const visitInfoStyle = {
    flex: 1,
  };

  const visitDateStyle = {
    fontSize: '15px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '3px',
  };

  const visitTypeStyle = {
    fontSize: '13px',
    color: '#666',
  };

  const visitFilesStyle = {
    fontSize: '12px',
    color: '#9CA3AF',
    marginRight: '15px',
  };

  const statusBadgeStyle = (status) => ({
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    marginRight: '15px',
    backgroundColor: status === 'completed' ? '#D1FAE5' : '#FEF3C7',
    color: status === 'completed' ? '#065F46' : '#92400E',
  });

  const viewDetailsStyle = {
    color: '#DB2777',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
  };

  // Demo toggle button style
  const demoToggleStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: '#831843',
    color: '#ffffff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '25px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    zIndex: 1000,
  };

  // Render Inactive State
  const renderInactiveState = () => (
    <div style={inactiveContainerStyle}>
      <div style={inactiveCardStyle}>
        <div style={inactiveTopStyle}>
          <div style={inactiveIconStyle}>👨‍⚕️</div>
          <div style={inactiveTitleStyle}>You need to assign a doctor first</div>
          <div style={inactiveSubtitleStyle}>Please go to Doctor page</div>
        </div>
        <div style={inactiveBottomStyle}>
          <p style={inactiveBottomTextStyle}>
            This feature will send your files and results to your doctor
          </p>
        </div>
      </div>
    </div>
  );

  // Render Active State
  const renderActiveState = () => {
    const totalVisits = visitsData.length;
    const completedVisits = visitsData.filter(v => v.status === 'completed').length;
    const totalFiles = visitsData.reduce((sum, v) => sum + v.files, 0);

    return (
      <>
        {/* Summary Cards */}
        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={statNumberStyle}>{totalVisits}</div>
            <div style={statLabelStyle}>Total Visits</div>
          </div>
          <div style={statCardStyle}>
            <div style={statNumberStyle}>{completedVisits}</div>
            <div style={statLabelStyle}>Completed</div>
          </div>
          <div style={statCardStyle}>
            <div style={statNumberStyle}>{totalFiles}</div>
            <div style={statLabelStyle}>Total Files</div>
          </div>
        </div>

        {/* Visits History List */}
        <div style={visitsListStyle}>
          {visitsData.map((visit) => (
            <div key={visit.id} style={visitRowStyle}>
              <div style={visitIconStyle}>{visit.icon}</div>
              <div style={visitInfoStyle}>
                <div style={visitDateStyle}>{visit.date}</div>
                <div style={visitTypeStyle}>{visit.type}</div>
              </div>
              <span style={visitFilesStyle}>{visit.files} files</span>
              <span style={statusBadgeStyle(visit.status)}>
                {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
              </span>
              <span style={viewDetailsStyle}>View details →</span>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>My Visits</h1>
        <button 
          style={newVisitButtonStyle}
          onMouseOver={(e) => e.target.style.backgroundColor = '#BE185D'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#DB2777'}
        >
          + New Visit
        </button>
      </div>

      {/* Content based on mode */}
      {isActive ? renderActiveState() : renderInactiveState()}

      {/* Demo Toggle Button */}
      <button 
        style={demoToggleStyle}
        onClick={() => setIsActive(!isActive)}
      >
        {isActive ? 'Show Inactive Mode' : 'Show Active Mode'}
      </button>
    </div>
  );
};

export default Visits;
