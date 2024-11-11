// src/components/Login.js
import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const { login } = useContext(AuthContext);
  const history = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState([]);

  const { email, password } = formData;
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/user");
  };

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    try {
      const res = await axios.post("http://localhost:5000/api/login", formData);
      login(res.data.token);
      handleLogin();
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(
          error.response.data.errors || [{ msg: error.response.data.message }]
        );
      } else {
        setErrors([{ msg: "Server error" }]);
      }
    }
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      {errors.length > 0 &&
        errors.map((error, index) => (
          <p key={index} style={{ color: "red" }}>
            {error.msg}
          </p>
        ))}
      <form className="login-form" onSubmit={onSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
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
          />
        </div>
        <button className="login-button" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
