import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const { auth, login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState([]);
  const { email, password } = formData;
  const navigate = useNavigate();

  // Handle form input changes
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    try {
      const res = await axios.post("http://localhost:5000/api/login", formData);
      login(res.data.token); // Log the user in and store the token
      localStorage.setItem("userId", res.data.user.id);
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

  // Use useEffect to watch the auth state and navigate when user is set
  useEffect(() => {
    if (auth.user && auth.user.id) {
      navigate(`/users/user/${auth.user.id}`);
    } else {
      console.log("User ID is undefined");
    }
  }, [auth.user, navigate]);

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
