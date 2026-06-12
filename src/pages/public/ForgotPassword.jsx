import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import authService from "../../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await authService.forgotPassword(email);

      // backend sets cookie (reset_session)
      navigate("/reset-password");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f9fafb",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: "750px",
        backgroundColor: "#f9e2e9",
        padding: "70px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Forgot Password</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px", textAlign: "left" }}>
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && (
          <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
        )}

        <Button
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "10px",
          }}
        >
          {loading ? "Sending..." : "Send Code"}
        </Button>
      </form>
    </div>
  </div>
);
};

export default ForgotPassword;