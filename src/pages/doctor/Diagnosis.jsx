import React, { useState } from 'react';

const Diagnosis = () => {
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
  };

  const listStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  };

  const itemCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(131, 24, 67, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const patientInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  };

  const avatarStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#FCE7F3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#831843',
    fontWeight: '600',
  };

  const patientDetailsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const nameStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#831843',
  };

  const metaStyle = {
    fontSize: '14px',
    color: '#9D174D',
  };

  const badgeStyle = {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  };

  const viewButtonStyle = {
    padding: '10px 20px',
    backgroundColor: '#DB2777',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  };

  const pendingDiagnoses = [
    { id: 1, name: 'Maria Garcia', date: '2024-01-15', type: 'Mammogram', status: 'Pending' },
    { id: 2, name: 'Jennifer Smith', date: '2024-01-14', type: 'Biopsy', status: 'Pending' },
    { id: 3, name: 'Sarah Williams', date: '2024-01-12', type: 'Blood Test', status: 'Pending' },
    { id: 4, name: 'Emily Johnson', date: '2024-01-11', type: 'MRI', status: 'Pending' },
  ];

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Pending Diagnosis</h1>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      <div style={listStyle}>
        {pendingDiagnoses.map((item) => (
          <div key={item.id} style={itemCardStyle}>
            <div style={patientInfoStyle}>
              <div style={avatarStyle}>
                {item.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={patientDetailsStyle}>
                <span style={nameStyle}>{item.name}</span>
                <span style={metaStyle}>{item.date} - {item.type}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={badgeStyle}>{item.status}</span>
              <button style={viewButtonStyle}>Review</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Diagnosis;