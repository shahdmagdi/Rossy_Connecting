import React, { useState, useEffect, useRef } from 'react';
import './MentalHealthAlert.css';

const MentalHealthAlert = () => {
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    // Check if user has already interacted with this popup
    const hasInteracted = localStorage.getItem('mentalHealthAlert_interacted');
    
    if (!hasInteracted) {
      // Show popup after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('mentalHealthAlert_interacted', 'true');
  };

  const handleEnable = () => {
    // Save mental health mode preference
    localStorage.setItem('mentalHealthMode', 'enabled');
    localStorage.setItem('mentalHealthAlert_interacted', 'true');
    setIsVisible(false);
  };

  const handleMaybeLater = () => {
    localStorage.setItem('mentalHealthAlert_interacted', 'true');
    setIsVisible(false);
  };

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay" onClick={handleOutsideClick}>
      <div className="modal-container" ref={modalRef}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={handleClose}>
          ✕
        </button>

        {/* Content */}
        <div className="modal-content">
          <h2 className="modal-title">Your mental health matters 🌱</h2>
          <p className="modal-message">
            Turn on Mental Health Mode for gentle guidance and mental health resources.
            Mental Health Mode provides gentle guidance and recommendations for your next steps, without detecting
          </p>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button className="modal-btn modal-btn-primary" onClick={handleEnable}>
            Enable Mental Health Mode
          </button>
          <button className="modal-btn modal-btn-secondary" onClick={handleMaybeLater}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthAlert;
