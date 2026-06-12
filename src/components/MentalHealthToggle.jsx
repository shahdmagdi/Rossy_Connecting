import React, { useState, useEffect } from 'react';
import API from '../services/api';

/**
 * MentalHealthToggle
 * ─────────────────
 * Props:
 *   externalMode (boolean) — when passed from PatientDashboard,
 *   syncs the toggle state if the modal just enabled the mode.
 */
const MentalHealthToggle = ({ externalMode }) => {
  const [enabled,  setEnabled]  = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [toggling, setToggling] = useState(false);

  // Fetch current status from server on mount
  useEffect(() => {
    API.get('/patient/mental-health-mode')
      .then(res => setEnabled(!!res.data?.mental_health_mode))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Sync with modal if it just enabled the mode
  useEffect(() => {
    if (externalMode !== undefined) {
      setEnabled(externalMode);
    }
  }, [externalMode]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res  = await API.post('/patient/mental-health-mode/toggle');
      const data = res.data;
      if (data.success) {
        setEnabled(data.mental_health_mode);
        localStorage.setItem('mentalHealthMode', data.mental_health_mode ? 'enabled' : 'disabled');
        localStorage.setItem('mentalHealthAlert_interacted', 'true');
      }
    } catch (err) {
      console.error('Toggle failed:', err);
    } finally {
      setToggling(false);
    }
  };

  if (loading) return null;

  return (
    <div style={{
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'space-between',
      backgroundColor: enabled ? '#f0fdf4' : '#fff8f9',
      border:          `1.5px solid ${enabled ? '#bbf7d0' : '#fce7f3'}`,
      borderRadius:    '16px',
      padding:         '16px 20px',
      gap:             '16px',
      transition:      'all 0.3s ease',
    }}>
      {/* Left: info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
          backgroundColor: enabled ? '#dcfce7' : '#fce7f3',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', transition: 'background-color 0.3s',
        }}>
          🧠
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: '14px', fontWeight: '700',
            color: enabled ? '#166534' : '#831843',
            marginBottom: '2px',
          }}>
            Mental Health Mode
          </div>
          <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.4' }}>
            {enabled
              ? 'ON — You see gentle recommendations only'
              : 'OFF — You see full diagnosis & confidence scores'}
          </div>
        </div>
      </div>

      {/* Right: toggle switch */}
      <button
        onClick={handleToggle}
        disabled={toggling}
        aria-label={enabled ? 'Turn off Mental Health Mode' : 'Turn on Mental Health Mode'}
        style={{
          flexShrink:      0,
          width:           '52px',
          height:          '28px',
          borderRadius:    '99px',
          border:          'none',
          cursor:          toggling ? 'not-allowed' : 'pointer',
          backgroundColor: enabled ? '#16a34a' : '#d1d5db',
          position:        'relative',
          transition:      'background-color 0.3s ease',
          opacity:         toggling ? 0.6 : 1,
          padding:         0,
        }}
      >
        <span style={{
          position:        'absolute',
          top:             '3px',
          left:            enabled ? '27px' : '3px',
          width:           '22px',
          height:          '22px',
          borderRadius:    '50%',
          backgroundColor: '#fff',
          boxShadow:       '0 1px 4px rgba(0,0,0,0.2)',
          transition:      'left 0.3s ease',
          display:         'block',
        }} />
      </button>
    </div>
  );
};

export default MentalHealthToggle;