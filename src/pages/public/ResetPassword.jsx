import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import authService from "../../services/authService";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    code: "",
    new_password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.code || !form.new_password || !form.confirm_password) {
      setError("All fields are required");
      return;
    }

    if (form.new_password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await authService.resetPassword(
        form.code,
        form.new_password,
        form.confirm_password
      );

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      setError("");

      await authService.resendResetCode();

      alert("New code sent!");
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Password Reset Successful 🎉</h2>
          <Button onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Password</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Input
            name="code"
            placeholder="6-digit code"
            value={form.code}
            onChange={handleChange}
          />

          <Input
            type="password"
            name="new_password"
            placeholder="New password"
            value={form.new_password}
            onChange={handleChange}
          />

          <Input
            type="password"
            name="confirm_password"
            placeholder="Confirm password"
            value={form.confirm_password}
            onChange={handleChange}
          />

          {error && <p style={styles.error}>{error}</p>}

          <Button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <Button
          onClick={handleResend}
          disabled={resendLoading}
          variant="outline"
          style={styles.resend}
        >
          {resendLoading ? "Sending..." : "Resend Code"}
        </Button>
      </div>
    </div>
  );
};

export default ResetPassword;

/* ================= styles ================= */

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FCE7F3",
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
  },

  title: {
    marginBottom: "20px",
    color: "#831843",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  btn: {
    marginTop: "10px",
  },

  resend: {
    marginTop: "15px",
    width: "100%",
  },

  error: {
    color: "red",
    fontSize: "14px",
  },
};