import React, { useState, useEffect, useCallback, useRef } from 'react';
import API from '../services/api';

// ── Icon/color map for doctor notification types ─────────
const ICON_MAP = {
  patient_assigned_doctor: { icon: '🩺', label: 'Assignment', bg: '#FEF3C7', color: '#B45309' },
  patient_uploaded_scan:   { icon: '🩻', label: 'New Scan',   bg: '#EEEDFE', color: '#534AB7' },
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
export const DoctorNotificationBell = ({ onClick, unreadCount }) => (
  <button
    onClick={onClick}
    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
    style={{
      position: 'relative',
      background: 'white',
      border: '1px solid rgba(15,23,42,0.08)',
      cursor: 'pointer',
      width: 38,
      height: 38,
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#475569',
      transition: 'all 0.2s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = '#f1f5ff';
      e.currentTarget.style.color = '#0f172a';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'white';
      e.currentTarget.style.color = '#475569';
    }}
  >
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
    {unreadCount > 0 && (
      <span style={{
        position: 'absolute', top: -5, right: -5,
        minWidth: 17, height: 17,
        backgroundColor: '#ef4444',
        color: 'white',
        fontSize: 10, fontWeight: 700,
        borderRadius: 99,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 4px',
        border: '2px solid white',
      }}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    )}
  </button>
);

// ── Slide-in panel ───────────────────────────────────────
const DoctorNotificationPanel = ({ isOpen, onClose, onUnreadChange }) => {
  const [notifs,  setNotifs]  = useState([]);
  const [filter,  setFilter]  = useState('all');
  const [loading, setLoading] = useState(false);
  const panelRef              = useRef();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/notifications');
      const all = res.data.notifications || [];
      setNotifs(all);
      if (onUnreadChange) {
        onUnreadChange(all.filter(n => !n.is_read).length);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [onUnreadChange]);

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
    } catch { /* optimistic */ }
    setNotifs(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, is_read: true } : n);
      if (onUnreadChange) onUnreadChange(updated.filter(n => !n.is_read).length);
      return updated;
    });
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
    } catch { /* optimistic */ }
    setNotifs(prev => {
      const updated = prev.map(n => ({ ...n, is_read: true }));
      if (onUnreadChange) onUnreadChange(0);
      return updated;
    });
  };

  const filtered = notifs.filter(n => {
    if (filter === 'unread')     return !n.is_read;
    if (filter === 'scan')       return n.type === 'patient_uploaded_scan';
    if (filter === 'assignment') return n.type === 'patient_assigned_doctor';
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
          backgroundColor: 'rgba(6,13,31,0.3)',
          zIndex: 1099,
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
          width: 420, maxWidth: '100vw',
          backgroundColor: 'white',
          zIndex: 1100,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-4px 0 32px rgba(6,13,31,0.14)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #f1f5f9',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#0f172a" strokeWidth={1.8}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{
                  backgroundColor: '#fee2e2', color: '#991b1b',
                  fontSize: 12, fontWeight: 600,
                  padding: '2px 8px', borderRadius: 99,
                }}>
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    fontSize: 12, color: '#2563eb', background: 'none',
                    border: '1px solid #bfdbfe', borderRadius: 8,
                    padding: '4px 10px', cursor: 'pointer', fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
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
                  fontSize: 20, color: '#94a3b8', padding: 4,
                  borderRadius: 6, lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { key: 'all',        label: 'All' },
              { key: 'unread',     label: 'Unread' },
              { key: 'scan',       label: 'Scans' },
              { key: 'assignment', label: 'Assignments' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                  border: filter === key ? '1.5px solid #0f172a' : '1.5px solid #e2e8f0',
                  backgroundColor: filter === key ? '#0f172a' : 'white',
                  color: filter === key ? 'white' : '#475569',
                  fontFamily: "'DM Sans', sans-serif",
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
          gap: 8, padding: '14px 20px',
          borderBottom: '1px solid #f1f5f9', flexShrink: 0,
        }}>
          {[
            { label: 'Total',  value: notifs.length,              color: '#0f172a' },
            { label: 'Unread', value: unreadCount,                 color: '#ef4444' },
            { label: 'Read',   value: notifs.length - unreadCount, color: '#10b981' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              backgroundColor: '#f8faff', borderRadius: 10,
              padding: 10, textAlign: 'center',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔕</div>
              <div style={{ fontSize: 14 }}>No notifications here</div>
            </div>
          ) : (
            filtered.map(n => {
              const m = ICON_MAP[n.type] || { icon: '🔔', label: 'Notification', bg: '#f1f5f9', color: '#475569' };
              return (
                <div
                  key={n.id}
                  style={{
                    display: 'flex', gap: 12,
                    padding: 14,
                    borderRadius: 14,
                    marginBottom: 8,
                    backgroundColor: n.is_read ? 'white' : '#f8faff',
                    border: n.is_read ? '1px solid #f1f5f9' : '1px solid #bfdbfe',
                    transition: 'background 0.15s',
                    position: 'relative',
                  }}
                >
                  {/* Unread dot */}
                  {!n.is_read && (
                    <div style={{
                      position: 'absolute', top: 14, right: 12,
                      width: 8, height: 8,
                      borderRadius: '50%', backgroundColor: '#ef4444',
                    }} />
                  )}

                  {/* Icon */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: m.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                  }}>
                    {m.icon}
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.55, marginBottom: 8 }}>
                      {n.body}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        padding: '2px 8px', borderRadius: 99,
                        backgroundColor: m.bg, color: m.color,
                      }}>
                        {m.label}
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
                        🕐 {timeAgo(n.created_at)}
                      </span>
                      {!n.is_read && (
                        <button
                          onClick={(e) => markRead(n.id, e)}
                          style={{
                            fontSize: 11, color: '#2563eb', background: 'none',
                            border: 'none', cursor: 'pointer', fontWeight: 600,
                            padding: '2px 4px', borderRadius: 4,
                            textDecoration: 'underline',
                            fontFamily: "'DM Sans', sans-serif",
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

export default DoctorNotificationPanel;