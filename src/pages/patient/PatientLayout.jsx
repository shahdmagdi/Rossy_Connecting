import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/RSlogo2.png';
import Chatbot from './Chatbot';

const PatientLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/patient/dashboard', icon: '🏠' },
    { name: 'Visits', path: '/patient/visits', icon: '📅' },
    { name: 'Doctor', path: '/patient/doctor', icon: '👨‍⚕️' },
    { name: 'History', path: '/patient/history', icon: '📋' },
    { name: 'Care Plan', path: '/patient/care-plan', icon: '📝' },
  ];

  const headerStyle = {
    backgroundColor: '#831843',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
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
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
  };

  const navStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  };

  const navLinkStyle = (isActive) => ({
    color: isActive ? '#831843' : '#ffffff',
    backgroundColor: isActive ? '#ffffff' : 'transparent',
    textDecoration: 'none',
    padding: '10px 18px',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '500',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  });

  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  };

  const userNameStyle = {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
  };

  const logoutButtonStyle = {
    backgroundColor: '#DB2777',
    color: '#ffffff',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'background-color 0.3s',
  };

  const mobileMenuButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'none',
  };

  const mainContentStyle = {
    paddingTop: '80px',
    minHeight: '100vh',
    backgroundColor: '#FCE7F3',
  };

  // Check if we're on a patient page
  const isPatientPage = location.pathname.startsWith('/patient');

  if (!isPatientPage) {
    return <Outlet />;
  }

  return (
    <>
      {/* Header with Navigation */}
      <header style={headerStyle}>
        <div style={logoContainerStyle}>
          <img src={logo} alt="Rossy Resilience" style={logoImageStyle} />
          <span style={logoTextStyle}>Rossy Resilience</span>
        </div>

        {/* Desktop Navigation */}
        <nav style={navStyle}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={navLinkStyle(location.pathname === item.path)}
              onMouseOver={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                }
              }}
              onMouseOut={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div style={userInfoStyle}>
          <span style={userNameStyle}>
            {user?.name || 'Patient'}
          </span>
          <button
            style={logoutButtonStyle}
            onClick={logout}
            onMouseOver={(e) => e.target.style.backgroundColor = '#BE185D'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#DB2777'}
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          style={{ ...mobileMenuButtonStyle, display: 'none' }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>
      </header>

      {/* Main Content */}
      <main style={mainContentStyle}>
        <Outlet />
      </main>

      {/* Floating Chatbot */}
      <Chatbot />
    </>
  );
};

export default PatientLayout;
