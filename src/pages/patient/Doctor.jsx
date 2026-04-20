import React, { useState } from 'react';
import './Doctor.css';

const Doctor = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // View state: 'no-doctor' or 'selection'
  const [viewState, setViewState] = useState('no-doctor');
  
  // Selected doctor state
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // ============================================================================
  // DEMO DATA - Replace with Flask API later
  // ============================================================================
  // To integrate with Flask backend later, replace this array with:
  //   const [doctors, setDoctors] = useState([]);
  //   useEffect(() => { fetch('/api/doctors').then(res => res.json()).then(data => setDoctors(data)); }, []);
  
  const DEMO_DOCTORS = [
    {
      id: 1,
      name: 'Dr Asser',
      specialization: 'Breast Oncology & Surgical Oncology',
      hospital: 'City Medical Center',
      experience: '15 years',
      image: '👨‍⚕️'
    },
    {
      id: 2,
      name: 'Dr Sara',
      specialization: 'Medical Oncology (Breast Cancer)',
      hospital: 'Nile Medical Hospital',
      experience: '9 years',
      image: '👩‍⚕️'
    },
    {
      id: 3,
      name: 'Dr Layla',
      specialization: 'Radiology & Breast Imaging',
      hospital: 'Al-Shifa Diagnostic Center',
      experience: '10 years',
      image: '👩‍⚕️'
    },
    {
      id: 4,
      name: 'Dr Ali',
      specialization: 'Radiation Oncology',
      hospital: 'Alexandria Cancer Institute',
      experience: '20 years',
      image: '👨‍⚕️'
    }
  ];

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  // Handle "Assign a doctor" button click - switch to selection view
  const handleStartAssignment = () => {
    setViewState('selection');
    // Set first doctor as default selection
    setSelectedDoctor(DEMO_DOCTORS[0]);
  };

  // Handle doctor card selection
  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
  };

  // Handle final "Assign a doctor" button
  const handleConfirmAssignment = () => {
    if (selectedDoctor) {
      // TODO: Replace with Flask API call later
      // Example: await fetch('/api/assign-doctor', { method: 'POST', body: JSON.stringify({ doctorId: selectedDoctor.id }) });
      
      // Demo behavior - show alert
      alert(`Doctor assigned successfully!\n\nYou have been assigned to ${selectedDoctor.name}.\n\n(This is demo behavior - connect to Flask backend later to save to database)`);
      
      console.log('Selected Doctor:', selectedDoctor);
    }
  };

  // ============================================================================
  // RENDER: STATE 1 - No Doctor Assigned
  // ============================================================================
  const renderNoDoctorState = () => (
    <div className="doctor-no-doctor-container">
      {/* Preference Card */}
      <div className="doctor-preference-card">
        <h2 className="doctor-preference-title">Doctor Assignment Preference</h2>
        <p className="doctor-preference-subtitle">
          Choose whether you want to be assigned to a specific doctor
        </p>
        
        {/* Horizontal Option Bar */}
        <div className="doctor-option-bar">
          <span className="doctor-option-text">
            Assign me to a doctor you can choose different doctors or consult the AI
          </span>
          <label className="doctor-toggle">
            <input type="checkbox" defaultChecked />
            <span className="doctor-toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Empty State Card */}
      <div className="doctor-empty-card">
        <div className="doctor-empty-icon">🏥</div>
        <h3 className="doctor-empty-heading">No Doctor Assigned</h3>
        <p className="doctor-empty-text">
          Enable doctor assignment to get matched with a dedicated healthcare provider 
          who will manage your care or consult the AI.
        </p>
        <button 
          className="doctor-assign-btn"
          onClick={handleStartAssignment}
        >
          Assign a doctor
        </button>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: STATE 2 - Doctor Selection View
  // ============================================================================
  const renderSelectionState = () => (
    <div className="doctor-selection-container">
      <div className="doctor-selection-wrapper">
        {/* Doctor Cards Grid */}
        <div className="doctor-grid">
          {DEMO_DOCTORS.map((doctor) => (
            <div 
              key={doctor.id}
              className={`doctor-card ${selectedDoctor?.id === doctor.id ? 'doctor-card-selected' : ''}`}
              onClick={() => handleSelectDoctor(doctor)}
            >
              <div className="doctor-card-image">{doctor.image}</div>
              <div className="doctor-card-name">{doctor.name}</div>
              <div className="doctor-card-specialization">{doctor.specialization}</div>
              <div className="doctor-card-hospital">{doctor.hospital}</div>
              <div className="doctor-card-experience">{doctor.experience}</div>
            </div>
          ))}
        </div>

        {/* Confirm Button */}
        <div className="doctor-confirm-container">
          <button 
            className="doctor-confirm-btn"
            onClick={handleConfirmAssignment}
          >
            Assign a doctor
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="doctor-page">
      {/* Page Header */}
      <div className="doctor-header">
        <a href="/patient/dashboard" className="doctor-back-link">← Back</a>
        <h1 className="doctor-page-title">My Doctor</h1>
      </div>

      {/* Content - Conditional Rendering */}
      {viewState === 'no-doctor' ? renderNoDoctorState() : renderSelectionState()}
    </div>
  );
};

export default Doctor;
