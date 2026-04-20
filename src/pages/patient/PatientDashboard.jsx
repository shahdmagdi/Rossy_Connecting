import React from 'react';
import MentalHealthAlert from '../../components/MentalHealthAlert';

const PatientDashboard = () => {
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#FCE7F3',
    paddingTop: '80px',
  };

  const mainContentStyle = {
    padding: '40px',
    maxWidth: '1200px',
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

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(131, 24, 67, 0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
  };

  const cardTitleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#831843',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const cardTextStyle = {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
  };

  const iconStyle = {
    width: '40px',
    height: '40px',
    backgroundColor: '#FCE7F3',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
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
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  };

  const statNumberStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#831843',
    marginBottom: '5px',
  };

  const statLabelStyle = {
    fontSize: '14px',
    color: '#666',
  };

  return (
    <div style={containerStyle}>
      {/* Main Content */}
      <main style={mainContentStyle}>
        <h1 style={welcomeStyle}>Patient Dashboard</h1>
        <p style={subtitleStyle}>Your health, our priority - Welcome to your personal health portal</p>

        {/* Stats Overview */}
        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={statNumberStyle}>3</div>
            <div style={statLabelStyle}>Upcoming Appointments</div>
          </div>
          <div style={statCardStyle}>
            <div style={statNumberStyle}>12</div>
            <div style={statLabelStyle}>Medical Records</div>
          </div>
          <div style={statCardStyle}>
            <div style={statNumberStyle}>2</div>
            <div style={statLabelStyle}>Prescriptions</div>
          </div>
          <div style={statCardStyle}>
            <div style={statNumberStyle}>1</div>
            <div style={statLabelStyle}>Pending Results</div>
          </div>
        </div>

        {/* Feature Cards */}
        <div style={gridStyle}>
          {/* Book Appointment */}
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              <div style={iconStyle}>📅</div>
              Book Appointment
            </div>
            <p style={cardTextStyle}>
              Schedule an appointment with our experienced doctors. Choose your preferred date and time.
            </p>
          </div>

          {/* Medical Records */}
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              <div style={iconStyle}>📋</div>
              Medical Records
            </div>
            <p style={cardTextStyle}>
              View and manage your medical history, test results, and health documents securely.
            </p>
          </div>

          {/* Prescriptions */}
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              <div style={iconStyle}>💊</div>
              Prescriptions
            </div>
            <p style={cardTextStyle}>
              Access your current prescriptions and request refills directly from your doctor.
            </p>
          </div>

          {/* Health Tracker */}
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              <div style={iconStyle}>❤️</div>
              Health Tracker
            </div>
            <p style={cardTextStyle}>
              Monitor your vitals, track symptoms, and maintain a daily health journal.
            </p>
          </div>

          {/* Lab Results */}
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              <div style={iconStyle}>🔬</div>
              Lab Results
            </div>
            <p style={cardTextStyle}>
              View your laboratory test results as soon as they become available.
            </p>
          </div>

          {/* Messages */}
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              <div style={iconStyle}>💬</div>
              Messages
            </div>
            <p style={cardTextStyle}>
              Communicate with your healthcare providers securely and receive updates.
            </p>
          </div>
        </div>
      </main>
      
      {/* Mental Health Alert Modal */}
      <MentalHealthAlert />
    </div>
  );
};

export default PatientDashboard;
