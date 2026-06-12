import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMyAssignedPatients,
  getDoctorPendingRequests,
  acceptAssignmentRequest,
  rejectAssignmentRequest,
} from '../../services/assignmentService';

const MyPatients = () => {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────
  const [activeTab, setActiveTab]       = useState('my-patients');
  const [searchQuery, setSearchQuery]   = useState('');

  // Separate lists from separate endpoints
  const [acceptedPatients, setAcceptedPatients] = useState([]);
  const [pendingRequests, setPendingRequests]   = useState([]);

  const [loadingAccepted, setLoadingAccepted] = useState(true);
  const [loadingPending, setLoadingPending]   = useState(true);
  const [error, setError]                     = useState(null);
  const [actionLoading, setActionLoading]     = useState(null);
  const [toast, setToast]                     = useState(null);

  // ── Toast ──────────────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Fetch accepted patients (GET /api/doctor/my-patients) ──
  const fetchAccepted = useCallback(async () => {
    setLoadingAccepted(true);
    try {
      const data = await getMyAssignedPatients();
      if (data.success) {
        setAcceptedPatients(data.patients || []);
      } else {
        setError(data.message || 'Failed to load patients.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to reach the server.');
    } finally {
      setLoadingAccepted(false);
    }
  }, []);

  // ── Fetch pending requests (GET /api/doctor/requests) ──
  const fetchPending = useCallback(async () => {
    setLoadingPending(true);
    try {
      const data = await getDoctorPendingRequests();
      if (data.success) {
        setPendingRequests(data.requests || []);
      }
    } catch (err) {
      // non-fatal — pending tab will just show empty
      console.error('Failed to load pending requests:', err);
    } finally {
      setLoadingPending(false);
    }
  }, []);

  useEffect(() => {
    fetchAccepted();
    fetchPending();
  }, [fetchAccepted, fetchPending]);

  // ── Accept ─────────────────────────────────────────────
  const handleAccept = async (assignmentId, patientName) => {
    setActionLoading(assignmentId + '-accept');
    try {
      const data = await acceptAssignmentRequest(assignmentId);
      if (data.success) {
        // Remove from pending list
        setPendingRequests((prev) => prev.filter((r) => r.assignment_id !== assignmentId));
        // Re-fetch accepted list so the new patient appears from the real DB
        await fetchAccepted();
        setActiveTab('my-patients');
        showToast(`${patientName} is now your patient.`, 'success');
      } else {
        showToast(data.message || 'Could not accept request.', 'error');
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Something went wrong.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Reject ─────────────────────────────────────────────
  const handleReject = async (assignmentId, patientName) => {
    setActionLoading(assignmentId + '-reject');
    try {
      const data = await rejectAssignmentRequest(assignmentId);
      if (data.success) {
        setPendingRequests((prev) => prev.filter((r) => r.assignment_id !== assignmentId));
        showToast(`${patientName}'s request declined.`, 'success');
      } else {
        showToast(data.message || 'Could not reject request.', 'error');
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Something went wrong.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Tabs ────────────────────────────────────────────────
  const tabs = [
    { key: 'my-patients', label: 'My Patients', count: acceptedPatients.length },
    { key: 'pending',     label: 'Pending',     count: pendingRequests.length  },
  ];

  // ── Search filter helpers ───────────────────────────────
  const filterBySearch = (list, nameKey, emailKey) => {
    const q = searchQuery.toLowerCase();
    if (!q) return list;
    return list.filter(
      (item) =>
        item[nameKey]?.toLowerCase().includes(q) ||
        item[emailKey]?.toLowerCase().includes(q)
    );
  };

  const filteredAccepted = filterBySearch(acceptedPatients, 'full_name', 'email');
  const filteredPending  = filterBySearch(
    pendingRequests,
    // pending shape: { patient: { full_name, email } }
    // flatten for search
    '_full_name_search',
    '_email_search'
  ).length === 0 && searchQuery
    ? pendingRequests.filter((r) => {
        const q = searchQuery.toLowerCase();
        return (
          r.patient?.full_name?.toLowerCase().includes(q) ||
          r.patient?.email?.toLowerCase().includes(q)
        );
      })
    : pendingRequests.filter((r) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          r.patient?.full_name?.toLowerCase().includes(q) ||
          r.patient?.email?.toLowerCase().includes(q)
        );
      });

  const isLoading = activeTab === 'my-patients' ? loadingAccepted : loadingPending;

  const getInitials = (name = '') =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  // ── Render ──────────────────────────────────────────────
  return (
    <>
      <style>{`
        /* Toast */
        .pts-toast {
          position:fixed; top:1.5rem; right:1.5rem; z-index:9999;
          display:flex; align-items:center; gap:8px;
          padding:12px 18px; border-radius:12px;
          font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500;
          box-shadow:0 4px 20px rgba(0,0,0,.12);
          animation:pts-in .25s ease, pts-out .3s ease 2.7s forwards;
          max-width:340px;
        }
        @keyframes pts-in  { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pts-out { to{opacity:0;transform:translateY(-6px)} }
        .pts-toast--success { background:#fff; color:#065f46; border:1px solid #a7f3d0; }
        .pts-toast--error   { background:#fff; color:#991b1b; border:1px solid #fecaca; }

        /* Layout */
        .pts-wrap { padding:40px 44px; max-width:1320px; animation:fadeUp .35s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .pts-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; gap:16px; flex-wrap:wrap; }
        .pts-title  { font-family:'DM Serif Display',serif; font-size:28px; color:#0f172a; }

        .search-wrap { position:relative; }
        .search-wrap svg { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none; }
        .search-input {
          padding:11px 18px 11px 42px;
          font-family:'DM Sans',sans-serif; font-size:14px;
          border:1.5px solid #e2e8f0; border-radius:12px; outline:none;
          width:280px; color:#0f172a; background:white;
          transition:border-color .2s,box-shadow .2s;
        }
        .search-input:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.1); }
        .search-input::placeholder { color:#94a3b8; }

        /* Tabs */
        .tabs-bar { display:flex; gap:4px; margin-bottom:28px; background:white; border:1px solid rgba(15,23,42,.06); border-radius:12px; padding:5px; width:fit-content; }
        .tab-btn {
          padding:8px 18px; border:none; border-radius:9px;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500;
          cursor:pointer; color:#64748b; background:transparent; transition:all .2s;
          display:flex; align-items:center; gap:6px;
        }
        .tab-btn.active { background:#0f172a; color:white; font-weight:600; }
        .tab-btn:not(.active):hover { background:#f1f5f9; color:#0f172a; }
        .tab-badge {
          background:rgba(15,23,42,.1); color:inherit;
          border-radius:20px; padding:1px 8px; font-size:11px; font-weight:700;
        }
        .tab-btn.active .tab-badge { background:rgba(255,255,255,.2); color:white; }
        .tab-badge--pending { background:#fef3c7; color:#92400e; }
        .tab-btn.active .tab-badge--pending { background:rgba(255,255,255,.25); color:white; }

        /* Grid */
        .pts-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(330px,1fr)); gap:20px; }

        /* Card */
        .pt-card {
          background:white; border-radius:16px;
          border:1px solid rgba(15,23,42,.06);
          box-shadow:0 1px 4px rgba(15,23,42,.06);
          overflow:hidden; transition:transform .2s,box-shadow .2s;
        }
        .pt-card:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(15,23,42,.10); }

        .pt-card-top { padding:22px 22px 0; display:flex; align-items:flex-start; gap:14px; }
        .pt-avatar {
          width:52px; height:52px; border-radius:14px;
          background:linear-gradient(135deg,#dbeafe,#bfdbfe);
          display:flex; align-items:center; justify-content:center;
          color:#1d4ed8; font-size:17px; font-weight:700; flex-shrink:0;
        }
        .pt-avatar--pending { background:linear-gradient(135deg,#fef3c7,#fde68a); color:#92400e; }
        .pt-name { font-size:16px; font-weight:700; color:#0f172a; margin-bottom:5px; }
        .status-chip {
          display:inline-block; padding:3px 10px; border-radius:20px;
          font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em;
        }

        .pt-details { padding:16px 22px; display:flex; flex-direction:column; gap:8px; }
        .pt-detail-row { display:flex; align-items:center; gap:10px; font-size:13px; color:#475569; }
        .pt-detail-row svg { flex-shrink:0; color:#94a3b8; }

        .pt-card-footer {
          padding:14px 22px 20px;
          border-top:1px solid rgba(15,23,42,.05);
          display:flex; gap:8px;
        }
        .btn-primary {
          flex:1; padding:10px 14px;
          background:#0f172a; color:white;
          border:none; border-radius:10px;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
          cursor:pointer; transition:background .2s,transform .15s;
        }
        .btn-primary:hover { background:#1e293b; transform:translateY(-1px); }
        .btn-accept {
          flex:1; padding:10px 14px;
          background:#ecfdf5; color:#065f46;
          border:1.5px solid #a7f3d0; border-radius:10px;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
          cursor:pointer; transition:all .2s;
        }
        .btn-accept:hover:not(:disabled) { background:#d1fae5; }
        .btn-accept:disabled,.btn-reject:disabled { opacity:.6; cursor:not-allowed; }
        .btn-reject {
          flex:1; padding:10px 14px;
          background:#fff5f5; color:#991b1b;
          border:1.5px solid #fecaca; border-radius:10px;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
          cursor:pointer; transition:all .2s;
        }
        .btn-reject:hover:not(:disabled) { background:#fee2e2; }

        /* Skeleton */
        .skeleton-card {
          background:white; border-radius:16px;
          border:1px solid rgba(15,23,42,.06); height:220px;
          background-image:linear-gradient(90deg,#f8faff 25%,#f1f5ff 50%,#f8faff 75%);
          background-size:200% 100%; animation:shimmer 1.4s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* Empty */
        .empty-full {
          grid-column:1/-1;
          display:flex; flex-direction:column; align-items:center;
          padding:80px 20px; text-align:center;
          background:white; border-radius:16px;
          border:1px solid rgba(15,23,42,.06);
        }
        .empty-circle {
          width:72px; height:72px; border-radius:50%;
          background:#f8faff;
          display:flex; align-items:center; justify-content:center;
          color:#cbd5e1; margin-bottom:20px;
        }
        .empty-full h4 { font-family:'DM Serif Display',serif; font-size:20px; color:#334155; margin-bottom:8px; }
        .empty-full p  { font-size:14px; color:#94a3b8; max-width:320px; line-height:1.6; }

        /* Error */
        .error-bar {
          background:#fee2e2; border:1px solid #fca5a5; border-radius:12px;
          padding:14px 18px; font-size:14px; color:#991b1b; margin-bottom:20px;
          display:flex; align-items:center; justify-content:space-between; gap:12px;
        }
        .btn-retry {
          background:#991b1b; color:white; border:none; border-radius:8px;
          padding:7px 14px; font-family:'DM Sans',sans-serif;
          font-size:13px; font-weight:600; cursor:pointer; white-space:nowrap;
        }
        .btn-retry:hover { background:#7f1d1d; }

        @media (max-width:600px) {
          .pts-wrap { padding:24px 16px; }
          .search-input { width:100%; }
          .pts-header { flex-direction:column; align-items:flex-start; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className={`pts-toast pts-toast--${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}

      <div className="pts-wrap">
        {/* Header */}
        <div className="pts-header">
          <h1 className="pts-title">My Patients</h1>
          <div className="search-wrap">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search by name or email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="error-bar">
            <span>{error}</span>
            <button className="btn-retry" onClick={() => { fetchAccepted(); fetchPending(); }}>
              Retry
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs-bar">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              <span className={`tab-badge ${t.key === 'pending' && !activeTab.includes('pending') ? 'tab-badge--pending' : ''}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── MY PATIENTS TAB ── */}
        {activeTab === 'my-patients' && (
          <div className="pts-grid">
            {loadingAccepted ? (
              Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton-card" />)
            ) : filteredAccepted.length === 0 ? (
              <div className="empty-full">
                <div className="empty-circle">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                  </svg>
                </div>
                <h4>{searchQuery ? 'No results found' : 'No patients yet'}</h4>
                <p>
                  {searchQuery
                    ? `No patients matched "${searchQuery}".`
                    : 'Accept a pending request and your patients will appear here.'}
                </p>
              </div>
            ) : (
              filteredAccepted.map((patient) => (
                <div key={patient.patient_id} className="pt-card">
                  <div className="pt-card-top">
                    <div className="pt-avatar">{getInitials(patient.full_name)}</div>
                    <div>
                      <div className="pt-name">{patient.full_name}</div>
                      <span className="status-chip" style={{ background: '#d1fae5', color: '#065f46' }}>
                        Active Patient
                      </span>
                    </div>
                  </div>

                  <div className="pt-details">
                    {patient.email && (
                      <div className="pt-detail-row">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        {patient.email}
                      </div>
                    )}
                    {patient.phone_number && (
                      <div className="pt-detail-row">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
                        </svg>
                        {patient.phone_number}
                      </div>
                    )}
                    {patient.gender && (
                      <div className="pt-detail-row">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <circle cx="12" cy="8" r="4"/><path d="M12 12v8M9 18h6"/>
                        </svg>
                        {patient.gender}
                      </div>
                    )}
                    {patient.whatsapp_link && (
                      <div className="pt-detail-row">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                        </svg>
                        <a href={patient.whatsapp_link} target="_blank" rel="noreferrer"
                           style={{ color: '#25d366', textDecoration: 'none', fontWeight: 600 }}>
                          WhatsApp
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-card-footer">
                    <button
                      className="btn-primary"
                      onClick={() => navigate(`/doctor/patients/${patient.patient_id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── PENDING TAB ── */}
        {activeTab === 'pending' && (
          <div className="pts-grid">
            {loadingPending ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton-card" />)
            ) : filteredPending.length === 0 ? (
              <div className="empty-full">
                <div className="empty-circle">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
                    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
                  </svg>
                </div>
                <h4>{searchQuery ? 'No results found' : 'No pending requests'}</h4>
                <p>
                  {searchQuery
                    ? `No requests matched "${searchQuery}".`
                    : 'New patient requests will appear here.'}
                </p>
              </div>
            ) : (
              filteredPending.map((req) => {
                const p = req.patient;
                const isActing =
                  actionLoading === req.assignment_id + '-accept' ||
                  actionLoading === req.assignment_id + '-reject';
                return (
                  <div key={req.assignment_id} className="pt-card">
                    <div className="pt-card-top">
                      <div className="pt-avatar pt-avatar--pending">{getInitials(p.full_name)}</div>
                      <div>
                        <div className="pt-name">{p.full_name}</div>
                        <span className="status-chip" style={{ background: '#fef3c7', color: '#92400e' }}>
                          Pending
                        </span>
                      </div>
                    </div>

                    <div className="pt-details">
                      {p.email && (
                        <div className="pt-detail-row">
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                          </svg>
                          {p.email}
                        </div>
                      )}
                      {p.phone_number && (
                        <div className="pt-detail-row">
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
                          </svg>
                          {p.phone_number}
                        </div>
                      )}
                      {p.gender && (
                        <div className="pt-detail-row">
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <circle cx="12" cy="8" r="4"/><path d="M12 12v8M9 18h6"/>
                          </svg>
                          {p.gender}
                        </div>
                      )}
                    </div>

                    <div className="pt-card-footer">
                      <button
                        className="btn-accept"
                        onClick={() => handleAccept(req.assignment_id, p.full_name)}
                        disabled={isActing}
                      >
                        {actionLoading === req.assignment_id + '-accept' ? '…' : 'Accept'}
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleReject(req.assignment_id, p.full_name)}
                        disabled={isActing}
                      >
                        {actionLoading === req.assignment_id + '-reject' ? '…' : 'Reject'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default MyPatients;