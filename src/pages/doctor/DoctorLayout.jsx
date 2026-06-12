import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/RSlogo2.png';
import authService from '../../services/authService';
import DoctorNotificationPanel, { DoctorNotificationBell } from '../../components/Doctornotifications';

const DoctorLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navItems = [
    {
      name: 'Dashboard',
      path: '/doctor/dashboard',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      ),
    },
    {
      name: 'My Patients',
      path: '/doctor/patients',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      name: 'Patient Requests',
      path: '/doctor/patient-requests',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="19" y1="8" x2="19" y2="14"/>
          <line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
      ),
    },
    
    {
      name: 'Clinical Notes',
      path: '/doctor/notes',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
    },
  ];

  const doctorName = user?.name || 'Doctor';
  const specialty = user?.specialty || 'Specialist';
  const initials = doctorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('patient-requests')) return 'Patient Requests';
    if (path.includes('patients') && path.split('/').length > 3) return 'Patient Details';
    if (path.includes('patients')) return 'My Patients';
    
    if (path.includes('notes')) return 'Clinical Notes';
    return 'Dashboard';
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) { setDeleteError('Password is required.'); return; }
    try {
      setDeleteLoading(true);
      setDeleteError('');
      await authService.deleteAccount(deletePassword);
      logout();
      navigate('/login');
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setDeletePassword('');
    setDeleteError('');
  };

  const isDoctorPage = location.pathname.startsWith('/doctor');
  if (!isDoctorPage) return <Outlet />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy-950: #060d1f;
          --navy-900: #0a1628;
          --navy-800: #0f2040;
          --navy-700: #163058;
          --navy-600: #1e3f6e;
          --blue-500: #2563eb;
          --blue-400: #3b82f6;
          --blue-300: #93c5fd;
          --blue-100: #dbeafe;
          --slate-50: #f8faff;
          --slate-100: #f1f5ff;
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #94a3b8;
          --white: #ffffff;
          --danger: #ef4444;
          --danger-light: #fee2e2;
          --success: #10b981;
          --warning: #f59e0b;
          --sidebar-width: 260px;
          --sidebar-collapsed: 72px;
          --header-height: 68px;
          --radius-sm: 8px;
          --radius-md: 12px;
          --radius-lg: 16px;
          --radius-xl: 20px;
          --shadow-sm: 0 1px 3px rgba(6,13,31,0.08), 0 1px 2px rgba(6,13,31,0.04);
          --shadow-md: 0 4px 16px rgba(6,13,31,0.10), 0 2px 6px rgba(6,13,31,0.06);
          --shadow-lg: 0 12px 40px rgba(6,13,31,0.15), 0 4px 12px rgba(6,13,31,0.08);
          --transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        body { font-family: 'DM Sans', sans-serif; background: var(--slate-50); }

        .sidebar {
          width: var(--sidebar-width);
          background: linear-gradient(160deg, var(--navy-900) 0%, var(--navy-800) 50%, #112240 100%);
          min-height: 100vh;
          position: fixed;
          top: 0; left: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          transition: width var(--transition);
          z-index: 1000;
          overflow: hidden;
          box-shadow: 4px 0 24px rgba(6,13,31,0.18);
        }
        .sidebar.collapsed { width: var(--sidebar-collapsed); }
        .sidebar::before {
          content: '';
          position: absolute;
          top: -80px; left: -80px;
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .sidebar::after {
          content: '';
          position: absolute;
          bottom: 60px; right: -60px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%);
          pointer-events: none;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 28px 22px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: relative;
        }
        .sidebar-logo img { width: 36px; height: 36px; object-fit: contain; flex-shrink: 0; border-radius: 8px; }
        .sidebar-logo-text {
          font-family: 'DM Serif Display', serif;
          font-size: 17px;
          color: white;
          white-space: nowrap;
          opacity: 1;
          transition: opacity var(--transition);
          letter-spacing: 0.01em;
        }
        .sidebar.collapsed .sidebar-logo-text { opacity: 0; pointer-events: none; }

        .sidebar-nav { display: flex; flex-direction: column; gap: 4px; padding: 20px 12px; flex: 1; }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: var(--radius-md);
          text-decoration: none;
          color: rgba(255,255,255,0.6);
          font-size: 14px;
          font-weight: 500;
          transition: all var(--transition);
          white-space: nowrap;
          position: relative;
          overflow: hidden;
        }
        .nav-link:hover { color: white; background: rgba(255,255,255,0.08); }
        .nav-link.active {
          color: white;
          background: linear-gradient(135deg, rgba(37,99,235,0.5) 0%, rgba(59,130,246,0.3) 100%);
          box-shadow: 0 2px 12px rgba(37,99,235,0.25);
        }
        .nav-link.active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; height: 60%;
          width: 3px;
          background: var(--blue-400);
          border-radius: 0 3px 3px 0;
        }
        .nav-link-icon { flex-shrink: 0; display: flex; align-items: center; }
        .nav-link-label {
          opacity: 1;
          transition: opacity var(--transition);
          font-weight: 500;
        }
        .sidebar.collapsed .nav-link-label { opacity: 0; width: 0; overflow: hidden; }

        .sidebar-bottom {
          padding: 16px 12px 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .doctor-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 10px;
          border-radius: var(--radius-md);
          margin-bottom: 10px;
        }
        .doctor-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--blue-500), #1d4ed8);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 14px; font-weight: 700;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(37,99,235,0.4);
        }
        .doctor-info { overflow: hidden; opacity: 1; transition: opacity var(--transition); }
        .sidebar.collapsed .doctor-info { opacity: 0; width: 0; }
        .doctor-name { color: white; font-size: 13px; font-weight: 600; white-space: nowrap; }
        .doctor-specialty { color: rgba(255,255,255,0.45); font-size: 11px; white-space: nowrap; margin-top: 2px; }

        .sidebar-action-btn {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 14px;
          border: none; border-radius: var(--radius-md);
          background: transparent;
          color: rgba(255,255,255,0.5);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          cursor: pointer;
          transition: all var(--transition);
          text-align: left;
          white-space: nowrap;
          margin-bottom: 2px;
        }
        .sidebar-action-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.85); }
        .sidebar-action-btn.danger:hover { background: rgba(239,68,68,0.15); color: #fca5a5; }
        .sidebar-action-btn svg { flex-shrink: 0; }
        .sidebar-action-btn span { opacity: 1; transition: opacity var(--transition); }
        .sidebar.collapsed .sidebar-action-btn span { opacity: 0; width: 0; overflow: hidden; }

        .toggle-btn {
          position: absolute;
          top: 50%;
          right: -13px;
          transform: translateY(-50%);
          width: 26px; height: 26px;
          background: var(--blue-500);
          border: 2px solid var(--navy-900);
          border-radius: 50%;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: white;
          font-size: 10px;
          z-index: 1001;
          transition: background var(--transition);
          box-shadow: 0 2px 8px rgba(37,99,235,0.4);
        }
        .toggle-btn:hover { background: #1d4ed8; }

        .header {
          background: white;
          height: var(--header-height);
          position: fixed; top: 0; right: 0;
          left: var(--sidebar-width);
          z-index: 999;
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          border-bottom: 1px solid rgba(15,23,42,0.06);
          transition: left var(--transition);
          box-shadow: var(--shadow-sm);
        }
        .header.collapsed { left: var(--sidebar-collapsed); }
        .header-title {
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .header-actions { display: flex; align-items: center; gap: 16px; }
        .header-avatar {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, var(--blue-500), #1d4ed8);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 13px; font-weight: 700;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(37,99,235,0.3);
        }
        .breadcrumb {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: var(--text-muted);
        }
        .breadcrumb span { color: var(--text-secondary); font-weight: 500; }

        .main-content {
          margin-left: var(--sidebar-width);
          padding-top: var(--header-height);
          min-height: 100vh;
          background: var(--slate-50);
          transition: margin-left var(--transition);
        }
        .main-content.collapsed { margin-left: var(--sidebar-collapsed); }

        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(6,13,31,0.6);
          backdrop-filter: blur(6px);
          z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-card {
          background: white;
          border-radius: var(--radius-xl);
          padding: 40px;
          width: 440px;
          box-shadow: var(--shadow-lg);
          animation: slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-icon {
          width: 56px; height: 56px;
          background: var(--danger-light);
          border-radius: var(--radius-lg);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          color: var(--danger);
        }
        .modal-title {
          font-family: 'DM Serif Display', serif;
          font-size: 22px; color: var(--text-primary);
          margin-bottom: 10px;
        }
        .modal-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px; }
        .modal-input-label { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; display: block; }
        .modal-input {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: var(--radius-md);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; color: var(--text-primary);
          outline: none;
          transition: border-color var(--transition);
          margin-bottom: 8px;
        }
        .modal-input:focus { border-color: var(--danger); }
        .modal-input.has-error { border-color: var(--danger); margin-bottom: 0; }
        .modal-error {
          font-size: 12px;
          color: var(--danger);
          margin-bottom: 16px;
          margin-top: 4px;
          min-height: 18px;
        }
        .modal-actions { display: flex; gap: 12px; margin-top: 16px; }
        .btn-cancel {
          flex: 1; padding: 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: var(--radius-md);
          background: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition);
        }
        .btn-cancel:hover { background: var(--slate-100); }
        .btn-delete {
          flex: 1; padding: 12px;
          border: none;
          border-radius: var(--radius-md);
          background: var(--danger);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all var(--transition);
          opacity: 0.4;
        }
        .btn-delete.enabled { opacity: 1; }
        .btn-delete.enabled:hover:not(:disabled) { background: #dc2626; transform: translateY(-1px); }
        .btn-delete:disabled { cursor: not-allowed; }
      `}</style>

      {/* Sidebar */}
      <aside className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <img src={logo} alt="Rossy Resilience" />
          <span className="sidebar-logo-text">Rossy Resilience</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${
                location.pathname === item.path ||
                (item.path !== '/doctor/dashboard' && location.pathname.startsWith(item.path))
                  ? 'active'
                  : ''
              }`}
            >
              <span className="nav-link-icon">{item.icon}</span>
              <span className="nav-link-label">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="doctor-profile">
            <div className="doctor-avatar">{initials}</div>
            <div className="doctor-info">
              <div className="doctor-name">{doctorName}</div>
              <div className="doctor-specialty">{specialty}</div>
            </div>
          </div>

          <button className="sidebar-action-btn" onClick={logout}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Sign out</span>
          </button>

          <button className="sidebar-action-btn danger" onClick={() => setShowDeleteModal(true)}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            <span>Delete account</span>
          </button>
        </div>

        <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M6 2L3 5l3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M4 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </aside>

      {/* Header */}
      <header className={`header ${!isSidebarOpen ? 'collapsed' : ''}`}>
        <div>
          <h1 className="header-title">{getPageTitle()}</h1>
          <div className="breadcrumb">
            <span>Doctor Portal</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span>{getPageTitle()}</span>
          </div>
        </div>
        <div className="header-actions">
          <DoctorNotificationBell
            onClick={() => setNotifOpen(true)}
            unreadCount={unreadCount}
          />
          <div className="header-avatar">{initials}</div>
        </div>
      </header>

      {/* Main */}
      <main className={`main-content ${!isSidebarOpen ? 'collapsed' : ''}`}>
        <Outlet />
      </main>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCloseModal()}>
          <div className="modal-card">
            <div className="modal-icon">
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h2 className="modal-title">Delete your account</h2>
            <p className="modal-desc">
              This action is <strong>permanent and irreversible</strong>. All your patient records, clinical notes, care plans, and diagnoses associated with your account will be permanently deleted.
            </p>
            <label className="modal-input-label">Confirm your password</label>
            <input
              className={`modal-input${deleteError ? ' has-error' : ''}`}
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }}
            />
            {deleteError && <p className="modal-error">{deleteError}</p>}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
              <button
                className={`btn-delete ${deletePassword && !deleteLoading ? 'enabled' : ''}`}
                onClick={handleDeleteAccount}
                disabled={!deletePassword || deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Panel */}
      <DoctorNotificationPanel
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        onUnreadChange={setUnreadCount}
      />
    </>
  );
};

export default DoctorLayout;