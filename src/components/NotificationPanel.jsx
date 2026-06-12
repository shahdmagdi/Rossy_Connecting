import React, { useState, useEffect, useCallback, useRef } from 'react';
import API from '../services/api';

const ICON_MAP = {
  doctor_created_care_plan: { icon: '📋', label: 'Care plan',  bg: '#E1F5EE', color: '#0F6E56' },
  doctor_accepted_patient:  { icon: '✅', label: 'Accepted',   bg: '#EAF3DE', color: '#3B6D11' },
  doctor_rejected_patient:  { icon: '❌', label: 'Rejected',   bg: '#FCEBEB', color: '#A32D2D' },
  patient_uploaded_scan:    { icon: '🩻', label: 'Scan',       bg: '#EEEDFE', color: '#534AB7' },
  patient_assigned_doctor:  { icon: '🩺', label: 'Assignment', bg: '#FEF3C7', color: '#B45309' },
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Bell button ──────────────────────────────────────────
export const NotificationBell = ({ onClick, unreadCount }) => (
  <button
    onClick={onClick}
    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
    style={{
      position: 'relative',
      background: '#fff',
      border: '1px solid #F9D5E5',
      cursor: 'pointer',
      padding: '10px 12px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(131,24,67,0.08)',
      transition: 'background 0.15s, border-color 0.15s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = '#FCE7F3';
      e.currentTarget.style.borderColor = '#E5C4D2';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = '#fff';
      e.currentTarget.style.borderColor = '#F9D5E5';
    }}
  >
    <span style={{ fontSize: '22px', lineHeight: 1 }}>🔔</span>
    {unreadCount > 0 && (
      <span style={{
        position: 'absolute', top: '-6px', right: '-6px',
        minWidth: '18px', height: '18px',
        backgroundColor: '#DC2626', color: '#fff',
        fontSize: '11px', fontWeight: '700',
        borderRadius: '99px', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 4px', lineHeight: 1,
        border: '2px solid #FCE7F3',
      }}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    )}
  </button>
);

// ── Slide-in panel ───────────────────────────────────────
const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifs,  setNotifs]  = useState([]);
  const [filter,  setFilter]  = useState('all');
  const [loading, setLoading] = useState(false);
  const panelRef              = useRef();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/notifications');
      setNotifs(res.data.notifications || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isOpen) load(); }, [isOpen, load]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const markRead = async (id, e) => {
    e.stopPropagation();
    try {
      await API.put(`/notifications/${id}/read`);
    } catch { /* optimistic anyway */ }
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
    } catch { /* optimistic anyway */ }
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const ASSIGN_TYPES = ['doctor_accepted_patient', 'doctor_rejected_patient', 'patient_assigned_doctor'];

  const filtered = notifs.filter(n => {
    if (filter === 'unread')    return !n.is_read;
    if (filter === 'care_plan') return n.type === 'doctor_created_care_plan';
    if (filter === 'assignment') return ASSIGN_TYPES.includes(n.type);
    return true;
  });

  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.25)',
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s',
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Notifications"
        aria-modal="true"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '420px', maxWidth: '100vw',
          backgroundColor: '#fff',
          zIndex: 1000,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(131,24,67,0.10)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #F9D5E5',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🔔</span>
              <span style={{ fontSize: '17px', fontWeight: '700', color: '#831843' }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{
                  backgroundColor: '#FEE2E2', color: '#991B1B',
                  fontSize: '12px', fontWeight: '600',
                  padding: '2px 8px', borderRadius: '99px',
                }}>
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    fontSize: '12px', color: '#9D174D', background: 'none',
                    border: '1px solid #E5C4D2', borderRadius: '8px',
                    padding: '4px 10px', cursor: 'pointer', fontWeight: '600',
                  }}
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                aria-label="Close notifications"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '20px', color: '#9D174D', padding: '4px',
                  borderRadius: '6px', lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { key: 'all',        label: 'All' },
              { key: 'unread',     label: 'Unread' },
              { key: 'care_plan',  label: 'Care plans' },
              { key: 'assignment', label: 'Assignments' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  padding: '5px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '600',
                  cursor: 'pointer', transition: 'all 0.15s',
                  border: filter === key ? '1.5px solid #831843' : '1.5px solid #E5C4D2',
                  backgroundColor: filter === key ? '#831843' : '#fff',
                  color: filter === key ? '#fff' : '#831843',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
          gap: '8px', padding: '14px 20px',
          borderBottom: '1px solid #F9D5E5', flexShrink: 0,
        }}>
          {[
            { label: 'Total',  value: notifs.length,               color: '#831843' },
            { label: 'Unread', value: unreadCount,                  color: '#DC2626' },
            { label: 'Read',   value: notifs.length - unreadCount,  color: '#16A34A' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              backgroundColor: '#FDF2F8', borderRadius: '10px',
              padding: '10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color }}>{value}</div>
              <div style={{ fontSize: '11px', color: '#BE185D', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#C084AC', fontSize: '14px' }}>
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#C084AC' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔕</div>
              <div style={{ fontSize: '14px' }}>No notifications here</div>
            </div>
          ) : (
            filtered.map(n => {
              const m = ICON_MAP[n.type] || { icon: '🔔', label: 'Notification', bg: '#FCE7F3', color: '#831843' };
              return (
                <div
                  key={n.id}
                  style={{
                    display: 'flex', gap: '12px',
                    padding: '12px',
                    borderRadius: '12px',
                    marginBottom: '6px',
                    backgroundColor: n.is_read ? '#fff' : '#FDF2F8',
                    border: n.is_read ? '1px solid #F3E8EE' : '1px solid #F9A8C9',
                    transition: 'background 0.15s',
                    position: 'relative',
                  }}
                >
                  {/* Unread dot */}
                  {!n.is_read && (
                    <div style={{
                      position: 'absolute', top: '14px', right: '12px',
                      width: '8px', height: '8px',
                      borderRadius: '50%', backgroundColor: '#DC2626',
                    }} />
                  )}

                  {/* Icon */}
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: m.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px',
                  }}>
                    {m.icon}
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#831843', marginBottom: '3px' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.5', marginBottom: '6px' }}>
                      {n.body}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: '600',
                        padding: '2px 8px', borderRadius: '99px',
                        backgroundColor: m.bg, color: m.color,
                      }}>
                        {m.label}
                      </span>
                      <span style={{ fontSize: '11px', color: '#aaa' }}>
                        🕐 {timeAgo(n.created_at)}
                      </span>
                      {!n.is_read && (
                        <button
                          onClick={(e) => markRead(n.id, e)}
                          style={{
                            fontSize: '11px', color: '#9D174D', background: 'none',
                            border: 'none', cursor: 'pointer', fontWeight: '600',
                            padding: '2px 4px', borderRadius: '4px',
                            textDecoration: 'underline',
                          }}
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;