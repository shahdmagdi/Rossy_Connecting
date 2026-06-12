import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── state ──────────────────────────────────────────────
  const [patients,        setPatients]        = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [notes,           setNotes]           = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);

  // action states
  const [actionLoading, setActionLoading] = useState({}); // { [assignmentId]: 'accepting' | 'rejecting' }
  const [actionError,   setActionError]   = useState('');

  // ── fetch all dashboard data ───────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [patientsRes, requestsRes, notesRes] = await Promise.all([
          API.get('/doctor/my-patients'),
          API.get('/doctor/requests'),
          API.get('/doctor/notes'),
        ]);
        setPatients(patientsRes.data?.patients || []);
        setPendingRequests(requestsRes.data?.requests || []);
        setNotes(notesRes.data?.notes || []);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── accept / reject handlers ───────────────────────────
  const handleAccept = async (assignmentId) => {
    setActionLoading(p => ({ ...p, [assignmentId]: 'accepting' }));
    setActionError('');
    try {
      await API.put(`/doctor/requests/${assignmentId}/accept`);
      // Refresh patients + requests
      const [patientsRes, requestsRes] = await Promise.all([
        API.get('/doctor/my-patients'),
        API.get('/doctor/requests'),
      ]);
      setPatients(patientsRes.data?.patients || []);
      setPendingRequests(requestsRes.data?.requests || []);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to accept request.');
    } finally {
      setActionLoading(p => { const n = { ...p }; delete n[assignmentId]; return n; });
    }
  };

  const handleReject = async (assignmentId) => {
    setActionLoading(p => ({ ...p, [assignmentId]: 'rejecting' }));
    setActionError('');
    try {
      await API.put(`/doctor/requests/${assignmentId}/reject`);
      setPendingRequests(prev => prev.filter(r => r.assignment_id !== assignmentId));
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reject request.');
    } finally {
      setActionLoading(p => { const n = { ...p }; delete n[assignmentId]; return n; });
    }
  };

  const doctorFirstName = user?.full_name?.split(' ')[0] || 'Doctor';

  // ── stat cards ─────────────────────────────────────────
  const statCards = [
    {
      label: 'Total Patients',
      value: patients.length,
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      color: '#2563eb', bg: '#eff6ff',
      onClick: () => navigate('/doctor/patients'),
    },
    {
      label: 'Pending Requests',
      value: pendingRequests.length,
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      color: pendingRequests.length > 0 ? '#f59e0b' : '#10b981',
      bg:    pendingRequests.length > 0 ? '#fffbeb' : '#ecfdf5',
      onClick: null,
    },
    {
      label: 'Clinical Notes',
      value: notes.length,
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
      color: '#8b5cf6', bg: '#f5f3ff',
      onClick: () => navigate('/doctor/notes'),
    },
  ];

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <style>{`
        .dash-wrap {
          padding: 40px 44px;
          max-width: 1320px;
          animation: dashIn 0.4s ease;
        }
        @keyframes dashIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .dash-greeting { margin-bottom: 36px; }
        .dash-greeting h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 30px; color: #0f172a; margin-bottom: 6px;
        }
        .dash-greeting p { font-size: 14px; color: #64748b; }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 36px;
        }
        @media (max-width: 900px) { .stat-grid { grid-template-columns: 1fr 1fr; } }

        .stat-card {
          background: white; border-radius: 16px; padding: 24px;
          border: 1px solid rgba(15,23,42,0.06);
          box-shadow: 0 1px 4px rgba(15,23,42,0.06);
          display: flex; align-items: flex-start; gap: 16px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card.clickable { cursor: pointer; }
        .stat-card.clickable:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15,23,42,0.10); }
        .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-value { font-family: 'DM Serif Display', serif; font-size: 32px; color: #0f172a; line-height: 1; margin-bottom: 6px; }
        .stat-label { font-size: 13px; color: #64748b; font-weight: 500; }
        .stat-skeleton { width: 48px; height: 34px; background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size: 200% 100%; border-radius: 6px; animation: shimmer 1.4s infinite; margin-bottom: 6px; }

        .dash-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 1000px) { .dash-grid { grid-template-columns: 1fr; } }

        .card { background: white; border-radius: 16px; border: 1px solid rgba(15,23,42,0.06); box-shadow: 0 1px 4px rgba(15,23,42,0.06); overflow: hidden; }
        .card-header { padding: 24px 28px 0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .card-title { font-family: 'DM Serif Display', serif; font-size: 18px; color: #0f172a; }
        .card-count { font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 99px; }
        .card-link { font-size: 13px; color: #2563eb; font-weight: 600; text-decoration: none; cursor: pointer; padding: 6px 12px; border-radius: 8px; transition: background 0.2s; background: none; border: none; }
        .card-link:hover { background: #eff6ff; }

        /* Patients list */
        .patient-list { padding: 0 28px 24px; display: flex; flex-direction: column; gap: 10px; }
        .patient-item {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 16px; background: #f8faff;
          border: 1px solid rgba(15,23,42,0.05); border-radius: 12px;
          cursor: pointer; transition: all 0.2s;
        }
        .patient-item:hover { background: #eff6ff; border-color: rgba(37,99,235,0.15); transform: translateX(3px); }
        .pat-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg,#dbeafe,#93c5fd);
          display: flex; align-items: center; justify-content: center;
          color: #1d4ed8; font-size: 13px; font-weight: 700; flex-shrink: 0;
        }
        .pat-name { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 3px; }
        .pat-meta { font-size: 12px; color: #64748b; }
        .pat-mh { font-size: 10px; background: #ede9fe; color: #5b21b6; padding: 2px 8px; border-radius: 99px; font-weight: 700; margin-left: 6px; }
        .pat-arrow { margin-left: auto; color: #cbd5e1; flex-shrink: 0; }

        /* Requests list */
        .request-list { padding: 0 28px 24px; display: flex; flex-direction: column; gap: 12px; }
        .request-item {
          background: #fffbeb; border: 1.5px solid #fde68a;
          border-radius: 14px; padding: 16px 18px;
          transition: box-shadow 0.2s;
        }
        .request-item:hover { box-shadow: 0 4px 16px rgba(245,158,11,0.12); }
        .req-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .req-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg,#fef3c7,#fde68a);
          display: flex; align-items: center; justify-content: center;
          color: #92400e; font-size: 12px; font-weight: 700; flex-shrink: 0;
        }
        .req-name { font-size: 14px; font-weight: 700; color: #0f172a; }
        .req-meta { font-size: 12px; color: #78350f; margin-top: 2px; }
        .req-date { font-size: 11px; color: #a16207; margin-left: auto; flex-shrink: 0; }
        .req-actions { display: flex; gap: 8px; }
        .btn-accept {
          flex: 1; padding: 9px; border: none; border-radius: 9px;
          background: linear-gradient(135deg,#059669,#047857);
          color: white; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s; box-shadow: 0 2px 8px rgba(5,150,105,0.3);
        }
        .btn-accept:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(5,150,105,0.4); }
        .btn-accept:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .btn-reject {
          flex: 1; padding: 9px; border: 1.5px solid #fca5a5; border-radius: 9px;
          background: white; color: #dc2626; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .btn-reject:hover:not(:disabled) { background: #fff1f1; }
        .btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Notes list */
        .notes-list { padding: 0 28px 24px; display: flex; flex-direction: column; gap: 10px; }
        .note-item {
          background: #f8faff; border: 1px solid rgba(15,23,42,0.05);
          border-radius: 12px; padding: 14px 16px;
        }
        .note-title { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
        .note-vis {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.04em; padding: 2px 8px; border-radius: 99px;
        }
        .note-content { font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .note-date { font-size: 11px; color: #94a3b8; }

        /* Skeleton rows */
        .skel-row { height: 64px; border-radius: 12px; background: linear-gradient(90deg,#f8faff 25%,#f1f5ff 50%,#f8faff 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }

        /* Empty state */
        .empty-state { display: flex; flex-direction: column; align-items: center; padding: 40px 28px; text-align: center; color: #94a3b8; }
        .empty-icon { width: 52px; height: 52px; border-radius: 14px; background: #f8faff; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; color: #cbd5e1; }
        .empty-state h4 { font-size: 14px; font-weight: 600; color: #64748b; margin-bottom: 4px; }
        .empty-state p { font-size: 12px; color: #94a3b8; }

        .error-banner { background: #fee2e2; border: 1px solid #fca5a5; border-radius: 12px; padding: 16px 20px; font-size: 14px; color: #991b1b; margin-bottom: 24px; }
        .action-error { background: #fee2e2; border: 1px solid #fca5a5; border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #991b1b; margin: 0 28px 16px; }

        @media (max-width: 700px) { .dash-wrap { padding: 20px 16px; } }
      `}</style>

      <div className="dash-wrap">

        {/* Greeting */}
        <div className="dash-greeting">
          <h2>Welcome back, Dr. {doctorFirstName} 👋</h2>
          <p>Here's an overview of your patients and pending requests</p>
        </div>

        {error && <div className="error-banner">⚠️ {error}</div>}

        {/* Stat cards */}
        <div className="stat-grid">
          {statCards.map((s) => (
            <div
              key={s.label}
              className={`stat-card ${s.onClick ? 'clickable' : ''}`}
              onClick={s.onClick || undefined}
            >
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <div>
                {loading
                  ? <div className="stat-skeleton" />
                  : <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                }
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid: patients + requests/notes */}
        <div className="dash-grid">

          {/* ── My Patients ── */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">My Patients</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {!loading && patients.length > 0 && (
                  <span className="card-count" style={{ background: '#eff6ff', color: '#2563eb' }}>
                    {patients.length}
                  </span>
                )}
                <button className="card-link" onClick={() => navigate('/doctor/patients')}>View all →</button>
              </div>
            </div>

            <div className="patient-list">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="skel-row" />)
              ) : patients.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    </svg>
                  </div>
                  <h4>No patients yet</h4>
                  <p>Patients will appear here once they are assigned to you.</p>
                </div>
              ) : (
                patients.slice(0, 5).map(p => {
                  const initials = p.full_name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '?';
                  return (
                    <div
                      key={p.patient_id}
                      className="patient-item"
                      onClick={() => navigate(`/doctor/patients/${p.patient_id}`)}
                    >
                      <div className="pat-avatar">{initials}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="pat-name">
                          {p.full_name}
                          {p.mental_health_mode && <span className="pat-mh">🧠 MH</span>}
                        </div>
                        <div className="pat-meta">
                          {p.email}
                          {p.date_of_birth && ` · DOB: ${formatDate(p.date_of_birth)}`}
                        </div>
                      </div>
                      <div className="pat-arrow">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </div>
                    </div>
                  );
                })
              )}
              {/* "View more" if more than 5 */}
              {!loading && patients.length > 5 && (
                <button
                  onClick={() => navigate('/doctor/patients')}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 0', textAlign: 'center' }}
                >
                  +{patients.length - 5} more patients →
                </button>
              )}
            </div>
          </div>

          {/* ── Right column: Pending Requests + Recent Notes ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Pending Patient Requests */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Pending Requests</h3>
                {!loading && pendingRequests.length > 0 && (
                  <span className="card-count" style={{ background: '#fef3c7', color: '#92400e' }}>
                    {pendingRequests.length} waiting
                  </span>
                )}
              </div>

              {actionError && <div className="action-error">⚠️ {actionError}</div>}

              <div className="request-list">
                {loading ? (
                  [1,2].map(i => <div key={i} className="skel-row" />)
                ) : pendingRequests.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    </div>
                    <h4>No pending requests</h4>
                    <p>New patient requests will appear here.</p>
                  </div>
                ) : (
                  pendingRequests.map(req => {
                    const p        = req.patient;
                    const initials = p?.full_name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '?';
                    const isAct    = actionLoading[req.assignment_id];
                    return (
                      <div key={req.assignment_id} className="request-item">
                        <div className="req-header">
                          <div className="req-avatar">{initials}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="req-name">{p?.full_name}</div>
                            <div className="req-meta">
                              {p?.email}
                              {p?.gender && ` · ${p.gender}`}
                            </div>
                          </div>
                          <div className="req-date">{formatDate(req.created_at)}</div>
                        </div>
                        <div className="req-actions">
                          <button
                            className="btn-accept"
                            onClick={() => handleAccept(req.assignment_id)}
                            disabled={!!isAct}
                          >
                            {isAct === 'accepting' ? 'Accepting…' : '✓ Accept'}
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleReject(req.assignment_id)}
                            disabled={!!isAct}
                          >
                            {isAct === 'rejecting' ? 'Rejecting…' : '✕ Reject'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Clinical Notes */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Notes</h3>
                <button className="card-link" onClick={() => navigate('/doctor/notes')}>View all →</button>
              </div>
              <div className="notes-list">
                {loading ? (
                  [1,2,3].map(i => <div key={i} className="skel-row" />)
                ) : notes.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <h4>No notes yet</h4>
                    <p>Clinical notes will appear here once created.</p>
                  </div>
                ) : (
                  notes.slice(0, 4).map(note => (
                    <div key={note.id} className="note-item">
                      <div className="note-title">
                        {note.title}
                        <span
                          className="note-vis"
                          style={note.visibility === 'shared'
                            ? { background: '#dcfce7', color: '#166534' }
                            : { background: '#f1f5f9', color: '#475569' }
                          }
                        >
                          {note.visibility === 'shared' ? '📋 Care Plan' : '🔒 Private'}
                        </span>
                      </div>
                      <div className="note-content">{note.content}</div>
                      <div className="note-date">{formatDate(note.created_at)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;