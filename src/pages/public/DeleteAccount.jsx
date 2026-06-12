import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import authService from "../../services/authService";

const DeleteAccount = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const handleDelete = async () => {
    if (!password) { setError("Password is required."); return; }

    try {
      setLoading(true);
      setError("");
      await authService.deleteAccount(password);
      logout();
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Icon */}
        <div style={styles.iconWrap}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"
            stroke="#BE123C" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </div>

        <h2 style={styles.title}>Delete Account</h2>
        <p style={styles.subtitle}>
          This will permanently delete your account and all associated data.
          This action <strong>cannot be undone</strong>.
        </p>

        {/* Step 1 — checkbox confirmation */}
        {!confirmed ? (
          <>
            <div style={styles.checkRow}>
              <input
                id="confirm-check"
                type="checkbox"
                onChange={e => setConfirmed(e.target.checked)}
                style={{ accentColor: "#BE123C", width: "16px", height: "16px", flexShrink: 0 }}
              />
              <label htmlFor="confirm-check" style={styles.checkLabel}>
                I understand this action is permanent and irreversible.
              </label>
            </div>

            <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              style={{ width: "100%", marginTop: "16px" }}
            >
              Go Back
            </Button>
          </>
        ) : (
          /* Step 2 — password + delete button */
          <>
            <div style={{ marginTop: "20px", textAlign: "left" }}>
              <Input
                label="Confirm Your Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                error={error}
              />
            </div>

            <div style={styles.btnRow}>
              {/* Cancel */}
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>

              {/* Delete — round trash icon button */}
              <Button
                variant="primary"
                onClick={handleDelete}
                disabled={loading || !password}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {loading ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                      <animateTransform attributeName="transform" type="rotate"
                        from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                    </path>
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
                    stroke="#ffffff" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                )}
              </Button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default DeleteAccount;

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FCE7F3",
    padding: "20px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px 36px",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(190,18,60,0.12)",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
  },
  iconWrap: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    backgroundColor: "#FFF1F2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#BE123C",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6B7280",
    lineHeight: "1.6",
    marginBottom: "24px",
  },
  checkRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    backgroundColor: "#FFF1F2",
    border: "1px solid #FECDD3",
    borderRadius: "10px",
    padding: "14px",
    textAlign: "left",
  },
  checkLabel: {
    fontSize: "13px",
    color: "#9F1239",
    lineHeight: "1.5",
    cursor: "pointer",
  },
  btnRow: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    alignItems: "center",
  },
};