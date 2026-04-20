import React from 'react';

const CarePlan = () => {
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

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(131, 24, 67, 0.1)',
  };

  const sectionTitleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#831843',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #F3F4F6',
  };

  const checkboxStyle = {
    width: '20px',
    height: '20px',
    marginRight: '15px',
    accentColor: '#831843',
  };

  const itemTextStyle = {
    flex: 1,
    fontSize: '14px',
    color: '#333',
  };

  const timeStyle = {
    fontSize: '12px',
    color: '#666',
    backgroundColor: '#FCE7F3',
    padding: '4px 10px',
    borderRadius: '15px',
  };

  const progressContainerStyle = {
    marginBottom: '20px',
  };

  const progressLabelStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#666',
  };

  const progressBarStyle = {
    height: '10px',
    backgroundColor: '#F3F4F6',
    borderRadius: '10px',
    overflow: 'hidden',
  };

  const progressFillStyle = {
    height: '100%',
    width: '65%',
    backgroundColor: '#831843',
    borderRadius: '10px',
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>My Care Plan</h1>

      {/* Progress Overview */}
      <div style={cardStyle}>
        <div style={progressContainerStyle}>
          <div style={progressLabelStyle}>
            <span>Overall Progress</span>
            <span style={{ color: '#831843', fontWeight: '600' }}>65%</span>
          </div>
          <div style={progressBarStyle}>
            <div style={progressFillStyle}></div>
          </div>
        </div>
      </div>

      {/* Daily Medications */}
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>💊 Daily Medications</div>
        <div style={itemStyle}>
          <input type="checkbox" style={checkboxStyle} defaultChecked />
          <span style={itemTextStyle}>Lisinopril 10mg - Morning</span>
          <span style={timeStyle}>8:00 AM</span>
        </div>
        <div style={itemStyle}>
          <input type="checkbox" style={checkboxStyle} defaultChecked />
          <span style={itemTextStyle}>Metformin 500mg - With breakfast</span>
          <span style={timeStyle}>8:00 AM</span>
        </div>
        <div style={itemStyle}>
          <input type="checkbox" style={checkboxStyle} />
          <span style={itemTextStyle}>Metformin 500mg - With dinner</span>
          <span style={timeStyle}>7:00 PM</span>
        </div>
        <div style={itemStyle}>
          <input type="checkbox" style={checkboxStyle} />
          <span style={itemTextStyle}>Aspirin 81mg - Evening</span>
          <span style={timeStyle}>9:00 PM</span>
        </div>
      </div>

      {/* Lifestyle Changes */}
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>🏃 Lifestyle & Exercise</div>
        <div style={itemStyle}>
          <input type="checkbox" style={checkboxStyle} />
          <span style={itemTextStyle}>Morning walk - 30 minutes</span>
          <span style={timeStyle}>7:00 AM</span>
        </div>
        <div style={itemStyle}>
          <input type="checkbox" style={checkboxStyle} />
          <span style={itemTextStyle}>Exercise session - 45 minutes</span>
          <span style={timeStyle}>6:00 PM</span>
        </div>
        <div style={itemStyle}>
          <input type="checkbox" style={checkboxStyle} />
          <span style={itemTextStyle}>Drink 8 glasses of water</span>
          <span style={timeStyle}>Daily</span>
        </div>
      </div>

      {/* Follow-up Tasks */}
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>📅 Follow-up Tasks</div>
        <div style={itemStyle}>
          <input type="checkbox" style={checkboxStyle} />
          <span style={itemTextStyle}>Blood pressure check</span>
          <span style={timeStyle}>Weekly</span>
        </div>
        <div style={itemStyle}>
          <input type="checkbox" style={checkboxStyle} />
          <span style={itemTextStyle}>Blood sugar monitoring</span>
          <span style={timeStyle}>Daily</span>
        </div>
        <div style={itemStyle}>
          <input type="checkbox" style={checkboxStyle} />
          <span style={itemTextStyle}>Weight check-in</span>
          <span style={timeStyle}>Weekly</span>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>👨‍⚕️ Next Appointments</div>
        <div style={{ fontSize: '14px', color: '#333', padding: '10px 0' }}>
          <div>📅 March 20, 2026 - Dr. Sarah Johnson (General Checkup)</div>
          <div style={{ marginTop: '10px' }}>📅 March 25, 2026 - Dr. Michael Chen (Cardiology)</div>
        </div>
      </div>
    </div>
  );
};

export default CarePlan;
