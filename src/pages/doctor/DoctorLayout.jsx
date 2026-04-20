import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/RSlogo2.png';

const DoctorLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: '📊' },
    { name: 'My Patients', path: '/doctor/patients', icon: '👥' },
    { name: 'Diagnosis', path: '/doctor/diagnosis', icon: '🔬' },
    { name: 'Care Plans', path: '/doctor/care-plans', icon: '📋' },
    { name: 'Clinical Notes', path: '/doctor/notes', icon: '📝' },
  ];

  const sidebarStyle = {
    width: isSidebarOpen ? '260px' : '80px',
    backgroundColor: '#831843',
    minHeight: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease',
    zIndex: 1000,
    overflowX: isSidebarOpen ? 'visible' : 'hidden',
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
    padding: '0 10px',
  };

  const logoImageStyle = {
    width: '40px',
    height: '40px',
    objectFit: 'contain',
  };

  const logoTextStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    opacity: isSidebarOpen ? 1 : 0,
    transition: 'opacity 0.3s ease',
  };

  const navStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  };

  const navLinkStyle = (isActive) => ({
    color: isActive ? '#831843' : '#ffffff',
    backgroundColor: isActive ? '#ffffff' : 'transparent',
    textDecoration: 'none',
    padding: '14px 18px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: isActive ? '600' : '500',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    whiteSpace: 'nowrap',
  });

  const userSectionStyle = {
    paddingTop: '20px',
    borderTop: '1px solid rgba(255,255,255,0.2)',
    marginTop: 'auto',
  };

  const userInfoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '15px',
  };

  const avatarStyle = {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: '#DB2777',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '600',
    flexShrink: 0,
  };

  const userNameStyle = {
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    opacity: isSidebarOpen ? 1 : 0,
    transition: 'opacity 0.3s ease',
  };

  const userSpecialtyStyle = {
    color: '#F9A8D4',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    opacity: isSidebarOpen ? 1 : 0,
    transition: 'opacity 0.3s ease',
  };

  const logoutButtonStyle = {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#ffffff',
    border: 'none',
    padding: '12px 18px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    width: isSidebarOpen ? '100%' : 'auto',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const toggleButtonStyle = {
    position: 'absolute',
    top: '50%',
    right: '-12px',
    transform: 'translateY, -50%)',
    backgroundColor: '#DB2777',
    color: '#ffffff',
    border: 'none',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  };

  const mainContentStyle = {
    marginLeft: isSidebarOpen ? '260px' : '80px',
    paddingTop: '80px',
    minHeight: '100vh',
    backgroundColor: '#FCE7F3',
    transition: 'margin-left 0.3s ease',
  };

  const headerStyle = {
    backgroundColor: '#831843',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    position: 'fixed',
    top: 0,
    left: isSidebarOpen ? '260px' : '80px',
    right: 0,
    zIndex: 999,
    transition: 'left 0.3s ease',
  };

  const headerTitleStyle = {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '600',
  };

  const headerActionsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  };

  const notificationIconStyle = {
    fontSize: '20px',
    cursor: 'pointer',
  };

  const profileAvatarStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#DB2777',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  };

  const isDoctorPage = location.pathname.startsWith('/doctor');

  if (!isDoctorPage) {
    return <Outlet />;
  }

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('patients')) return 'My Patients';
    if (path.includes('diagnosis')) return 'Diagnosis';
    if (path.includes('care-plans')) return 'Care Plans';
    if (path.includes('notes')) return 'Clinical Notes';
    return 'Dashboard';
  };

  const doctorName = user?.name || 'Dr. Sarah Mitchell';
  const specialty = user?.specialty || 'Oncology Specialist';

  return (
    <>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={logoContainerStyle}>
          <img src={logo} alt="Rossy Resilience" style={logoImageStyle} />
          <span style={logoTextStyle}>Rossy Resilience</span>
        </div>

        <nav style={navStyle}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={navLinkStyle(location.pathname === item.path)}
              onMouseOver={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.15)';
                }
              }}
              onMouseOut={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span style={{ opacity: isSidebarOpen ? 1 : 0, width: isSidebarOpen ? 'auto' : 0, overflow: 'hidden' }}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div style={userSectionStyle}>
          <div style={userInfoContainerStyle}>
            <div style={avatarStyle}>
              {doctorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={userNameStyle}>{doctorName}</div>
              <div style={userSpecialtyStyle}>{specialty}</div>
            </div>
          </div>
          <button
            style={logoutButtonStyle}
            onClick={logout}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.25)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.15)'}
          >
            <span>🚪</span>
            <span style={{ opacity: isSidebarOpen ? 1 : 0 }}>Logout</span>
          </button>
        </div>

        {/* Toggle Button */}
        <button
          style={toggleButtonStyle}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Header */}
      <header style={headerStyle}>
        <h1 style={headerTitleStyle}>{getPageTitle()}</h1>
        <div style={headerActionsStyle}>
          <span style={notificationIconStyle}>🔔</span>
          <div style={profileAvatarStyle}>
            {doctorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={mainContentStyle}>
        <Outlet />
      </main>
    </>
  );
};

export default DoctorLayout;