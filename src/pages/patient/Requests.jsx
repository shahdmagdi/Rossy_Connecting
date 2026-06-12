import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';

const statusColors = {
  pending:  { bg: '#FEF9C3', color: '#854D0E', label: 'Pending'  },
  approved: { bg: '#DCFCE7', color: '#166534', label: 'Approved' },
  rejected: { bg: '#FFE4E6', color: '#9F1239', label: 'Rejected' },
};

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [deletingId, setDeletingId] = useState(null); // which row is being deleted

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await authService.getPatientRequests();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleCancel = async (assignmentId) => {
    setDeletingId(assignmentId);
    try {
      await authService.cancelPatientRequest(assignmentId);
      // Remove from list without refetching
      setRequests(prev => prev.filter(r => r.assignment_id !== assignmentId));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Styles ──────────────────────────────────────────────
  const page = {
    padding: '32px 24px',
    maxWidth: '800px',
    margin: '0 auto',
  };
  const heading = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#831843',
    marginBottom: '6px',
  };
  const sub = {
    fontSize: '14px',
    color: '#9D174D',
    marginBottom: '28px',
  };
  const card = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(219,39,119,0.10)',
    overflow: 'hidden',
  };
  const emptyWrap = {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#9D174D',
  };
  const row = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 24px',
    borderBottom: '1px solid #FDF2F8',
    gap: '12px',
    flexWrap: 'wrap',
  };
  const doctorName = {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px',
  };
  const doctorMeta = {
    fontSize: '13px',
    color: '#6B7280',
  };
  const badge = (status) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: statusColors[status]?.bg    || '#F3F4F6',
    color:           statusColors[status]?.color  || '#374151',
  });
  const cancelBtn = (isDeleting) => ({
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: isDeleting ? '#F9A8D4' : '#DB2777',
    border: 'none',
    cursor: isDeleting ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background-color 0.2s',
  });

  // ── Render ───────────────────────────────────────────────
  if (loading) return (
    <div style={{ ...page, textAlign: 'center', paddingTop: '80px' }}>
      <div style={{ color: '#DB2777', fontSize: '15px' }}>Loading requests…</div>
    </div>
  );

  return (
    <div style={page}>
      <h1 style={heading}>My Requests</h1>
      <p style={sub}>Doctor assignment requests you have submitted</p>

      {error && (
        <div style={{
          backgroundColor: '#FFE4E6', border: '1px solid #FECDD3',
          borderRadius: '10px', padding: '12px 16px',
          color: '#9F1239', fontSize: '14px', marginBottom: '20px',
        }}>
          {error}
        </div>
      )}

      <div style={card}>
        {requests.length === 0 ? (
          <div style={emptyWrap}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📨</div>
            <p style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
              No requests yet
            </p>
            <p style={{ fontSize: '13px', color: '#BE185D' }}>
              Visit the Doctor page to request a doctor assignment.
            </p>
          </div>
        ) : (
          requests.map((req, index) => {
            const isLast     = index === requests.length - 1;
            const isDeleting = deletingId === req.assignment_id;
            const status     = req.status?.toLowerCase();

            return (
              <div
                key={req.assignment_id}
                style={{ ...row, borderBottom: isLast ? 'none' : '1px solid #FDF2F8' }}
              >
                {/* Doctor info */}
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <div style={doctorName}>{req.doctor.full_name}</div>
                  <div style={doctorMeta}>
                    {req.doctor.specialization} · {req.doctor.hospital}
                  </div>
                  <div style={{ ...doctorMeta, marginTop: '4px' }}>
                    Requested: {new Date(req.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </div>
                </div>

                {/* Status badge */}
                <div>
                  <span style={badge(status)}>
                    {statusColors[status]?.label || req.status}
                  </span>
                </div>

                {/* Cancel button — only for pending */}
                {status === 'pending' && (
                  <button
                    style={cancelBtn(isDeleting)}
                    onClick={() => handleCancel(req.assignment_id)}
                    disabled={isDeleting}
                    title="Cancel request"
                    onMouseOver={e => { if (!isDeleting) e.currentTarget.style.backgroundColor = '#BE185D'; }}
                    onMouseOut={e =>  { if (!isDeleting) e.currentTarget.style.backgroundColor = '#DB2777'; }}
                  >
                    {isDeleting ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                          <animateTransform attributeName="transform" type="rotate"
                            from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                        </path>
                      </svg>
                    ) : (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                        stroke="#ffffff" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    )}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Requests;