import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../Contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { email, password } = formData;
  const navigate = useNavigate();

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    try {
      // Login request
      const res = await axios.post("http://localhost:5000/api/login", formData);

      // Save token and user details in localStorage
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect to user dashboard
      navigate(`/events`, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      if (error.response?.data) {
        setErrors(
          error.response.data.errors || [{ msg: error.response.data.message }]
        );
      } else {
        setErrors([{ msg: "Server error. Please try again." }]);
      }
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={onSubmit}>
        <h2>Login</h2>
        {errors.length > 0 &&
          errors.map((error, index) => (
            <p key={index} className="error-message">
              {error.msg}
            </p>
          ))}
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
            disabled={isLoading}
          />
        </div>
        <button
          className={`login-button ${isLoading ? "loading" : ""}`}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
        <Link to="/forgot-password" className="forgot-password-link">
          Forgot your password?
        </Link>
      </form>
    </div>
  );
}

export default LoginPage;
