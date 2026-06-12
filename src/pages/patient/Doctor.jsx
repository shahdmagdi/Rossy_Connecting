import React, { useState, useEffect } from 'react';
import './Doctor.css';
import authService from '../../services/authService';

const Doctor = () => {
  const [viewState, setViewState] = useState('loading');
  const [assignedDoctor, setAssignedDoctor] = useState(null);
  const [assignmentId, setAssignmentId] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const [myDoctorRes, requestsRes, doctorsRes] = await Promise.all([
          authService.getMyDoctor(),
          authService.getPatientRequests(),
          authService.getDoctors(),
        ]);

        setDoctors(doctorsRes.data?.doctors || []);

        const requests = requestsRes.requests || [];
        const approved = requests.find(r => r.status === 'approved');
        const pending = requests.find(r => r.status === 'pending');

        if (myDoctorRes.success && myDoctorRes.doctor) {
          setAssignedDoctor(myDoctorRes.doctor);
          if (approved) setAssignmentId(approved.assignment_id);
          setViewState('approved');
        } else if (pending) {
          setAssignedDoctor(pending.doctor);
          setAssignmentId(pending.assignment_id);
          setViewState('pending');
        } else {
          setViewState('no-doctor');
        }
      } catch (err) {
        console.error(err);
        setViewState('no-doctor');
      }
    };
    init();
  }, []);

  const handleStartAssignment = async () => {
    setViewState('selection');
    if (doctors.length === 0) {
      try {
        const doctorsRes = await authService.getDoctors();
        setDoctors(doctorsRes.data?.doctors || []);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSelectDoctor = (doctor) => setSelectedDoctor(doctor);

  const handleConfirmAssignment = async () => {
    if (!selectedDoctor) return;
    setLoading(true);
    setError('');
    try {
      await authService.requestDoctor(selectedDoctor.doctor_id);
      setAssignedDoctor(selectedDoctor);
      setViewState('pending');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!assignmentId) return;
    setRemoveLoading(true);
    setError('');
    try {
      await authService.cancelPatientRequest(assignmentId);
      setAssignedDoctor(null);
      setAssignmentId(null);
      setViewState('no-doctor');
    } catch (err) {
      setError(err.message || 'Failed to cancel request.');
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleRemoveDoctor = async () => {
    setRemoveLoading(true);
    setError('');
    try {
      await authService.removeMyDoctor();
      setAssignedDoctor(null);
      setAssignmentId(null);
      setViewState('no-doctor');
    } catch (err) {
      setError(err.message || 'Failed to remove doctor.');
    } finally {
      setRemoveLoading(false);
    }
  };

  // ───────── LOADING ─────────
  const renderLoading = () => (
    <div style={s.centered}>
      <div style={{ color: '#DB2777', fontSize: '15px' }}>Loading…</div>
    </div>
  );

  // ───────── NO DOCTOR ─────────
  const renderNoDoctorState = () => (
    <div className="doctor-no-doctor-container">
      <div className="doctor-empty-card">
        <div className="doctor-empty-icon">🏥</div>
        <h3 className="doctor-empty-heading">No Doctor Assigned</h3>
        <p className="doctor-empty-text">
          Enable doctor assignment to get matched with a healthcare provider
        </p>
        <button className="doctor-assign-btn" onClick={handleStartAssignment}>
          Assign a doctor
        </button>
      </div>
    </div>
  );

  // ───────── PENDING ─────────
  const renderPendingState = () => (
    <div style={s.centerWrap}>
      <div style={s.card}>
        <div style={s.pendingIconWrap}>⏳</div>

        <h3 style={s.cardTitle}>Request Pending</h3>
        <p style={s.cardSubtitle}>
          Waiting for doctor approval...
        </p>

        {assignedDoctor && (
          <div style={s.doctorPreview}>
            <div style={s.doctorAvatar}>👨‍⚕️</div>
            <div>
              <div style={s.doctorName}>{assignedDoctor.full_name}</div>
              <div style={s.doctorMeta}>
                {assignedDoctor.specialization}
              </div>
            </div>
          </div>
        )}

        
      </div>
    </div>
  );

  // ───────── APPROVED ─────────
  const renderApprovedState = () => (
    <div style={s.centerWrap}>
      <div style={s.card}>

        <div style={s.approvedBadge}>✓ Assigned Doctor</div>

        <div style={s.avatarWrap}>
          <span style={{ fontSize: '52px' }}>👨‍⚕️</span>
        </div>

        <h2 style={s.approvedName}>{assignedDoctor?.full_name}</h2>
        <p style={s.approvedSpec}>{assignedDoctor?.specialization}</p>

        <div style={s.contactRow}>

          <a
            href={`mailto:${assignedDoctor?.email || ''}`}
            style={s.emailBtn}
          >
            Email
          </a>

          <a
            href={
              assignedDoctor?.whatsapp_link ||
              `https://wa.me/${assignedDoctor?.phone_number || ''}`
            }
            target="_blank"
            rel="noreferrer"
            style={s.whatsappBtn}
          >
            WhatsApp
          </a>

        </div>

        <button style={s.removeBtn} onClick={handleRemoveDoctor}>
          {removeLoading ? 'Removing…' : 'Remove Doctor'}
        </button>
      </div>
    </div>
  );

  // ───────── SELECTION ─────────
  const renderSelectionState = () => (
    <div style={s.centerWrap}>
      <div style={s.card}>

        <h3 style={s.cardTitle}>Select Doctor</h3>

        <div style={s.grid}>
          {doctors.map((doctor) => (
            <div
              key={doctor.doctor_id}
              style={{
                ...s.doctorCard,
                ...(selectedDoctor?.doctor_id === doctor.doctor_id
                  ? s.selectedCard
                  : {})
              }}
              onClick={() => handleSelectDoctor(doctor)}
            >
              <div style={{ fontSize: '28px' }}>👨‍⚕️</div>
              <div style={{ fontWeight: '600' }}>{doctor.full_name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {doctor.specialization}
              </div>
            </div>
          ))}
        </div>

        <button
          style={s.confirmBtn}
          onClick={handleConfirmAssignment}
          disabled={loading || !selectedDoctor}
        >
          {loading ? 'Sending…' : 'Assign Doctor'}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {viewState === 'loading' && renderLoading()}
      {viewState === 'no-doctor' && renderNoDoctorState()}
      {viewState === 'pending' && renderPendingState()}
      {viewState === 'approved' && renderApprovedState()}
      {viewState === 'selection' && renderSelectionState()}
    </div>
  );
};

export default Doctor;

// ───────── STYLES ONLY ─────────
const s = {
  centered: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px 20px',
  },

  centerWrap: {
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 20px',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: '18px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    padding: '30px',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
  },

  pendingIconWrap: {
    fontSize: '32px',
    marginBottom: '10px',
  },

  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '8px',
  },

  cardSubtitle: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '20px',
  },

  doctorPreview: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '20px',
    justifyContent: 'center',
  },

  doctorAvatar: { fontSize: '28px' },

  doctorName: { fontWeight: '600' },

  doctorMeta: { fontSize: '12px', color: '#777' },

  cancelBtn: {
    backgroundColor: '#ffe4e6',
    color: '#be123c',
    padding: '10px',
    border: 'none',
    borderRadius: '10px',
    width: '100%',
    cursor: 'pointer',
  },

  approvedBadge: {
    backgroundColor: '#dcfce7',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    marginBottom: '10px',
    display: 'inline-block',
  },

  avatarWrap: {
    margin: '10px auto',
  },

  approvedName: {
    fontSize: '20px',
    fontWeight: '700',
  },

  approvedSpec: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '15px',
  },

  contactRow: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '15px',
  },

  emailBtn: {
    backgroundColor: '#831843',
    color: '#fff',
    padding: '10px 15px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '13px',
  },

  whatsappBtn: {
    backgroundColor: '#16a34a',
    color: '#fff',
    padding: '10px 15px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '13px',
  },

  removeBtn: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    margin: '20px 0',
  },

  doctorCard: {
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #eee',
    cursor: 'pointer',
  },

  selectedCard: {
    border: '2px solid #831843',
    backgroundColor: '#faf5ff',
  },

  confirmBtn: {
    width: '100%',
    padding: '10px',
    borderRadius: '10px',
    backgroundColor: '#831843',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
};