import React, { useEffect, useState, useCallback } from "react";
import {
  getDoctorPendingRequests,
  acceptAssignmentRequest,
  rejectAssignmentRequest,
} from "../../services/assignmentService";
import "./PatientRequests.css";

// ── Icons (inline SVG, no extra deps) ──────────────────────
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const InboxIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

// ── Helpers ─────────────────────────────────────────────────
const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};
const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

// ── Toast component ─────────────────────────────────────────
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`pr-toast pr-toast--${toast.type}`}>
      {toast.type === "success" ? <CheckIcon /> : <XIcon />}
      <span>{toast.message}</span>
    </div>
  );
};

// ── Patient Card ─────────────────────────────────────────────
const PatientCard = ({ request, onAccept, onReject, loadingId }) => {
  const { assignment_id, created_at, patient } = request;
  const isBusy = loadingId === assignment_id;

  return (
    <div className="pr-card" style={{ "--delay": `${Math.random() * 0.2}s` }}>
      {/* Avatar */}
      <div className="pr-card__avatar">
        <span>{getInitials(patient.full_name)}</span>
      </div>

      {/* Info */}
      <div className="pr-card__body">
        <h3 className="pr-card__name">{patient.full_name}</h3>

        <div className="pr-card__meta">
          {patient.email && (
            <span className="pr-card__meta-item">
              <MailIcon /> {patient.email}
            </span>
          )}
          {patient.phone_number && (
            <span className="pr-card__meta-item">
              <PhoneIcon /> {patient.phone_number}
            </span>
          )}
          {patient.gender && (
            <span className="pr-card__badge">{patient.gender}</span>
          )}
        </div>

        <div className="pr-card__date">
          <ClockIcon />
          Requested {formatDate(created_at)} at {formatTime(created_at)}
        </div>
      </div>

      {/* Actions */}
      <div className="pr-card__actions">
        <button
          className="pr-btn pr-btn--accept"
          onClick={() => onAccept(assignment_id, patient.full_name)}
          disabled={isBusy}
          aria-label={`Accept ${patient.full_name}`}
        >
          {isBusy ? <span className="pr-spinner" /> : <CheckIcon />}
          Accept
        </button>
        <button
          className="pr-btn pr-btn--reject"
          onClick={() => onReject(assignment_id, patient.full_name)}
          disabled={isBusy}
          aria-label={`Reject ${patient.full_name}`}
        >
          {isBusy ? <span className="pr-spinner" /> : <XIcon />}
          Reject
        </button>
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────
const PatientRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingId, setLoadingId] = useState(null);  // which card is in-flight
  const [toast, setToast] = useState(null);

  // Show a toast for 3 s then clear
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch pending requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDoctorPendingRequests();
      if (data.success) {
        setRequests(data.requests || []);
      } else {
        setError(data.message || "Failed to load requests.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Unable to reach the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Accept handler
  const handleAccept = async (assignmentId, patientName) => {
    setLoadingId(assignmentId);
    try {
      const data = await acceptAssignmentRequest(assignmentId);
      if (data.success) {
        setRequests((prev) => prev.filter((r) => r.assignment_id !== assignmentId));
        showToast(`${patientName} has been accepted as your patient.`, "success");
      } else {
        showToast(data.message || "Could not accept request.", "error");
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Something went wrong.",
        "error"
      );
    } finally {
      setLoadingId(null);
    }
  };

  // Reject handler
  const handleReject = async (assignmentId, patientName) => {
    setLoadingId(assignmentId);
    try {
      const data = await rejectAssignmentRequest(assignmentId);
      if (data.success) {
        setRequests((prev) => prev.filter((r) => r.assignment_id !== assignmentId));
        showToast(`${patientName}'s request has been declined.`, "success");
      } else {
        showToast(data.message || "Could not reject request.", "error");
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Something went wrong.",
        "error"
      );
    } finally {
      setLoadingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="pr-page">
      <Toast toast={toast} />

      {/* Header */}
      <div className="pr-header">
        <div className="pr-header__left">
          <h1 className="pr-header__title">Patient Requests</h1>
          <p className="pr-header__sub">
            Review and manage incoming assignment requests from patients.
          </p>
        </div>
        {!loading && !error && (
          <div className="pr-header__badge">
            <UserIcon />
            {requests.length} pending
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="pr-skeleton-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="pr-skeleton-card">
              <div className="pr-skeleton pr-skeleton--avatar" />
              <div className="pr-skeleton-lines">
                <div className="pr-skeleton pr-skeleton--line pr-skeleton--lg" />
                <div className="pr-skeleton pr-skeleton--line pr-skeleton--md" />
                <div className="pr-skeleton pr-skeleton--line pr-skeleton--sm" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="pr-error">
          <p>{error}</p>
          <button className="pr-btn pr-btn--retry" onClick={fetchRequests}>
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && requests.length === 0 && (
        <div className="pr-empty">
          <InboxIcon />
          <h3>No pending requests</h3>
          <p>New patient requests will appear here when patients reach out.</p>
        </div>
      )}

      {/* Request cards */}
      {!loading && !error && requests.length > 0 && (
        <div className="pr-list">
          {requests.map((req) => (
            <PatientCard
              key={req.assignment_id}
              request={req}
              onAccept={handleAccept}
              onReject={handleReject}
              loadingId={loadingId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientRequests;