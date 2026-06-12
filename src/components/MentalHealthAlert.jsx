import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import './MentalHealthAlert.css';

const MentalHealthAlert = ({ onModeChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error,     setError]     = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const hasInteracted = localStorage.getItem('mentalHealthAlert_interacted');
    if (hasInteracted) return;

    API.get('/patient/mental-health-mode')
      .then(res => {
        const isEnabled = res.data?.mental_health_mode;
        if (!isEnabled) {
          setTimeout(() => setIsVisible(true), 500);
        } else {
          localStorage.setItem('mentalHealthAlert_interacted', 'true');
        }
      })
      .catch(() => {
        setTimeout(() => setIsVisible(true), 500);
      });
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    setIsSuccess(false);
    setError(null);
  };

  const handleClose = () => {
    localStorage.setItem('mentalHealthAlert_interacted', 'true');
    dismiss();
  };

  const handleMaybeLater = () => {
    localStorage.setItem('mentalHealthAlert_interacted', 'true');
    dismiss();
  };

  const handleEnable = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const statusRes = await API.get('/patient/mental-health-mode');
      const already   = statusRes.data?.mental_health_mode;

      if (!already) {
        const res  = await API.post('/patient/mental-health-mode/toggle');
        const data = res.data;
        if (!data.success) throw new Error(data.message || 'Something went wrong.');
        localStorage.setItem('mentalHealthMode', 'enabled');
        if (onModeChange) onModeChange(true);
      } else {
        if (onModeChange) onModeChange(true);
      }

      localStorage.setItem('mentalHealthAlert_interacted', 'true');
      setIsSuccess(true);
      setTimeout(dismiss, 2200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not enable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className="mha-overlay" onClick={handleOutsideClick}>
      <div className="mha-container" ref={modalRef}>
        <div className="mha-band" />

        {!isSuccess && (
          <button className="mha-close" onClick={handleClose} aria-label="Close">✕</button>
        )}

        {isSuccess ? (
          <div className="mha-success">
            <div className="mha-success-icon">🌱</div>
            <h2 className="mha-success-title">Mental Health Mode is ON</h2>
            <p className="mha-success-msg">
              You can turn it off anytime from your dashboard.
            </p>
          </div>
        ) : (
          <>
            <div className="mha-header">
              <div className="mha-emoji">🧠</div>
              <h2 className="mha-title">Mental Health Mode</h2>
              <p className="mha-subtitle">A gentler way to view your results</p>
            </div>

            <div className="mha-compare">
              <div className="mha-compare-col mha-col-off">
                <div className="mha-col-badge mha-badge-off">Mode OFF</div>
                <ul className="mha-list">
                  <li>🔴 You see the full diagnosis <strong>(Normal / Benign / Malignant)</strong></li>
                  <li>📊 You see the confidence percentage</li>
                  <li>📋 All technical details are visible</li>
                </ul>
              </div>
              <div className="mha-divider-v" />
              <div className="mha-compare-col mha-col-on">
                <div className="mha-col-badge mha-badge-on">Mode ON ✨</div>
                <ul className="mha-list">
                  <li>💬 You only see a <strong>gentle recommendation</strong> for your next step</li>
                  <li>🙈 No scary numbers or labels</li>
                  <li>🩺 Your doctor still sees everything</li>
                </ul>
              </div>
            </div>

            <p className="mha-note">
              💡 You can turn this on or off anytime from your dashboard.
            </p>

            {error && <p className="mha-error">{error}</p>}

            <div className="mha-actions">
              <button
                className={`mha-btn mha-btn-primary${isLoading ? ' loading' : ''}`}
                onClick={handleEnable}
                disabled={isLoading}
              >
                {isLoading ? <><span className="mha-spinner" /> Enabling…</> : '✨ Enable Mental Health Mode'}
              </button>
              <button className="mha-btn mha-btn-secondary" onClick={handleMaybeLater} disabled={isLoading}>
                Keep it off for now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MentalHealthAlert;