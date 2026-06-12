import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/RSlogo2.png';
import Chatbot from './Chatbot';
import { useNavigate } from "react-router-dom";

const PatientLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home',      path: '/patient/dashboard', icon: '🏠' },
    { name: 'Visits',    path: '/patient/visits',    icon: '📅' },
    { name: 'Doctor',    path: '/patient/doctor',    icon: '👨‍⚕️' },
    { name: 'Requests',  path: '/patient/requests',  icon: '📨' },
    { name: 'History',   path: '/patient/history',   icon: '📋' },
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

  const mainContentStyle = {
    paddingTop: '80px',
    minHeight: '100vh',
    backgroundColor: '#FCE7F3',
  };

  const isPatientPage = location.pathname.startsWith('/patient');
  if (!isPatientPage) return <Outlet />;

  return (
    <>
      <header style={headerStyle}>

        {/* Logo */}
        <div style={logoContainerStyle}>
          <img src={logo} alt="Rossy Resilience" style={logoImageStyle} />
          <span style={logoTextStyle}>Rossy Resilience</span>
        </div>

        {/* Nav Links */}
        <nav style={navStyle}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={navLinkStyle(location.pathname === item.path)}
              onMouseOver={(e) => {
                if (location.pathname !== item.path)
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseOut={(e) => {
                if (location.pathname !== item.path)
                  e.target.style.backgroundColor = 'transparent';
              }}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User Info + Logout + Delete */}
        <div style={userInfoStyle}>
          <span style={userNameStyle}>
            {user?.name || 'Patient'}
          </span>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

            {/* Logout */}
            <button
              style={logoutButtonStyle}
              onClick={logout}
              onMouseOver={(e) => e.target.style.backgroundColor = '#BE185D'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#DB2777'}
            >
              Logout
            </button>

            {/* Delete Account — round trash icon */}
            <button
              onClick={() => navigate('/delete-account')}
              title="Delete Account"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#DB2777',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#BE185D'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#DB2777'}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                stroke="#ffffff" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>

          </div>
        </div>

      </header>

      <main style={mainContentStyle}>
        <Outlet />
      </main>

      <Chatbot />
    </>
  );
};

export default PatientLayout;