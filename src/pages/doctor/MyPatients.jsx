import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyPatients = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const containerStyle = {
    padding: '40px',
    maxWidth: '1400px',
    margin: '0 auto',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#831843',
  };

  const searchInputStyle = {
    padding: '12px 20px',
    fontSize: '15px',
    border: '2px solid #F9A8D4',
    borderRadius: '25px',
    outline: 'none',
    width: '300px',
    transition: 'border-color 0.3s ease',
  };

  const tabsContainerStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    borderBottom: '2px solid #F9A8D4',
    paddingBottom: '0',
  };

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    borderRadius: '12px 12px 0 0',
    fontSize: '15px',
    fontWeight: isActive ? '600' : '500',
    color: isActive ? '#831843' : '#9D174D',
    backgroundColor: isActive ? '#ffffff' : 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    borderBottom: isActive ? 'none' : '2px solid transparent',
    marginBottom: '-2px',
  });

  const patientsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
  };

  const patientCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(131, 24, 67, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  };

  const patientHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px',
  };

  const avatarStyle = {
    width: '55px',
    height: '55px',
    borderRadius: '50%',
    backgroundColor: '#FCE7F3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#831843',
    fontSize: '20px',
    fontWeight: '600',
  };

  const patientNameStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#831843',
  };

  const patientInfoStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const infoRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#9D174D',
  };

  const badgeStyle = (status) => {
    const colors = {
      all: { bg: '#E0E7FF', color: '#3730A3' },
      pending: { bg: '#FEF3C7', color: '#92400E' },
      in_progress: { bg: '#DBEAFE', color: '#1E40AF' },
      completed: { bg: '#D1FAE5', color: '#065F46' },
    };
    return {
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: colors[status]?.bg || colors.all.bg,
      color: colors[status]?.color || colors.all.color,
    };
  };

  const cardActionsStyle = {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #F9A8D4',
  };

  const viewButtonStyle = {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#DB2777',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  };

  const actionButtonStyle = (type) => ({
    flex: 1,
    padding: '12px 16px',
    backgroundColor: type === 'accept' ? '#D1FAE5' : '#FEE2E2',
    color: type === 'accept' ? '#065F46' : '#991B1B',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  });

  const patients = [
    { id: 1, name: 'Maria Garcia', email: 'maria.garcia@email.com', phone: '+1 555-0123', lastVisit: '2024-01-15', files: 5, status: 'pending' },
    { id: 2, name: 'Jennifer Smith', email: 'jennifer.smith@email.com', phone: '+1 555-0124', lastVisit: '2024-01-14', files: 8, status: 'in_progress' },
    { id: 3, name: 'Emily Johnson', email: 'emily.johnson@email.com', phone: '+1 555-0125', lastVisit: '2024-01-13', files: 3, status: 'completed' },
    { id: 4, name: 'Sarah Williams', email: 'sarah.williams@email.com', phone: '+1 555-0126', lastVisit: '2024-01-12', files: 6, status: 'pending' },
    { id: 5, name: 'Lisa Brown', email: 'lisa.brown@email.com', phone: '+1 555-0127', lastVisit: '2024-01-11', files: 4, status: 'in_progress' },
    { id: 6, name: 'Amanda Davis', email: 'amanda.davis@email.com', phone: '+1 555-0128', lastVisit: '2024-01-10', files: 7, status: 'completed' },
  ];

  const filteredPatients = patients.filter(patient => {
    const matchesTab = activeTab === 'all' || patient.status === activeTab;
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusLabel = (status) => {
    const labels = {
      all: 'All',
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
    };
    return labels[status] || status;
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>My Patients</h1>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={searchInputStyle}
          onFocus={(e) => e.target.style.borderColor = '#DB2777'}
          onBlur={(e) => e.target.style.borderColor = '#F9A8D4'}
        />
      </div>

      {/* Filter Tabs */}
      <div style={tabsContainerStyle}>
        {['all', 'pending', 'in_progress', 'completed'].map((tab) => (
          <button
            key={tab}
            style={tabStyle(activeTab === tab)}
            onClick={() => setActiveTab(tab)}
          >
            {getStatusLabel(tab)}
          </button>
        ))}
      </div>

      {/* Patients Grid */}
      <div style={patientsGridStyle}>
        {filteredPatients.map((patient) => (
          <div key={patient.id} style={patientCardStyle}>
            <div style={patientHeaderStyle}>
              <div style={avatarStyle}>
                {patient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={patientNameStyle}>{patient.name}</div>
                <span style={badgeStyle(patient.status)}>{getStatusLabel(patient.status)}</span>
              </div>
            </div>

            <div style={patientInfoStyle}>
              <div style={infoRowStyle}>
                <span>📧</span>
                <span>{patient.email}</span>
              </div>
              <div style={infoRowStyle}>
                <span>📱</span>
                <span>{patient.phone}</span>
              </div>
              <div style={infoRowStyle}>
                <span>📅</span>
                <span>Last visit: {patient.lastVisit}</span>
              </div>
              <div style={infoRowStyle}>
                <span>📁</span>
                <span>{patient.files} files</span>
              </div>
            </div>

            <div style={cardActionsStyle}>
              <button
                style={viewButtonStyle}
                onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                onMouseOver={(e) => e.target.style.backgroundColor = '#BE185D'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#DB2777'}
              >
                View Details
              </button>
              {patient.status === 'pending' && (
                <>
                  <button
                    style={actionButtonStyle('accept')}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#A7F3D0'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#D1FAE5'}
                  >
                    Accept
                  </button>
                  <button
                    style={actionButtonStyle('reject')}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#FECACA'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#FEE2E2'}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPatients;