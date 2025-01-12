import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "../Alert/Alert";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message: "Password reset link has been sent to your email",
        });
      } else {
        throw new Error(data.message || "Failed to send reset email");
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="text-center">
          <h2>Reset Password</h2>
          <p className="subtitle">
            Enter your email address to receive a password reset link
          </p>
        </div>

        {/* Show the alert if there is a message */}
        <Alert type={status.type} message={status.message} />

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setStatus({
        type: "error",
        message: "Passwords do not match",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message: "Password successfully reset",
        });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        throw new Error(data.message || "Failed to reset password");
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="text-center">
          <h2>Set New Password</h2>
        </div>

        {/* Show the alert if there is a message */}
        <Alert type={status.type} message={status.message} />

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              minLength={8}
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export { ForgotPassword, ResetPassword };
