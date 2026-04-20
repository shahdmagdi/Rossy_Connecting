import React from 'react';

const History = () => {
  const containerStyle = {
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#831843',
    marginBottom: '30px',
  };

  const sectionStyle = {
    marginBottom: '30px',
  };

  const sectionTitleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#831843',
    marginBottom: '15px',
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 2px 10px rgba(131, 24, 67, 0.08)',
  };

  const recordTitleStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  };

  const recordDetailStyle = {
    fontSize: '13px',
    color: '#666',
    marginBottom: '5px',
  };

  const tagStyle = {
    display: 'inline-block',
    backgroundColor: '#FCE7F3',
    color: '#831843',
    padding: '3px 10px',
    borderRadius: '15px',
    fontSize: '12px',
    marginRight: '8px',
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Medical History</h1>

      {/* Diagnoses */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>📋 Diagnoses</h2>
        <div style={cardStyle}>
          <div style={recordTitleStyle}>Hypertension (Essential)</div>
          <p style={recordDetailStyle}>Diagnosed: January 15, 2025</p>
          <p style={recordDetailStyle}>By: Dr. Sarah Johnson</p>
          <div>
            <span style={tagStyle}>Chronic</span>
            <span style={tagStyle}>Active</span>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={recordTitleStyle}>Type 2 Diabetes Mellitus</div>
          <p style={recordDetailStyle}>Diagnosed: March 10, 2024</p>
          <p style={recordDetailStyle}>By: Dr. Michael Chen</p>
          <div>
            <span style={tagStyle}>Chronic</span>
            <span style={tagStyle}>Active</span>
          </div>
        </div>
      </div>

      {/* Procedures */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>🏥 Procedures & Surgeries</h2>
        <div style={cardStyle}>
          <div style={recordTitleStyle}>Appendectomy</div>
          <p style={recordDetailStyle}>Date: June 2020</p>
          <p style={recordDetailStyle}>Hospital: City General Hospital</p>
        </div>
      </div>

      {/* Allergies */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>⚠️ Allergies</h2>
        <div style={cardStyle}>
          <div style={recordTitleStyle}>Penicillin</div>
          <p style={recordDetailStyle}>Reaction: Skin rash, difficulty breathing</p>
        </div>
        <div style={cardStyle}>
          <div style={recordTitleStyle}>Shellfish</div>
          <p style={recordDetailStyle}>Reaction: Hives, swelling</p>
        </div>
      </div>

      {/* Immunizations */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>💉 Immunizations</h2>
        <div style={cardStyle}>
          <div style={recordTitleStyle}>COVID-19 Vaccine (Pfizer)</div>
          <p style={recordDetailStyle}>Last dose: October 2025</p>
        </div>
        <div style={cardStyle}>
          <div style={recordTitleStyle}>Influenza Vaccine</div>
          <p style={recordDetailStyle}>Last dose: January 2026</p>
        </div>
      </div>
    </div>
  );
};

export default History;
