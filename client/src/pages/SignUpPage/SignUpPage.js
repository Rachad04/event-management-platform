import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./SignUpPage.css";

function SignUpPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignUp = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      navigate(`/users/user:${userId}`);
    } else {
      console.error("User ID is undefined");
    }
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "",
    password2: "",
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { email, userType, password, password2 } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/signup",
        formData
      );
      login(res.data.token);
      handleSignUp();
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(
          error.response.data.errors || [{ msg: error.response.data.message }]
        );
      } else {
        setErrors([{ msg: "Server error" }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sign-up-page">
      <h2>Sign Up</h2>
      {errors.length > 0 &&
        errors.map((error, index) => (
          <p key={index} style={{ color: "red" }}>
            {error.msg}
          </p>
        ))}
      <form className="sign-up-form" autoComplete="off" onSubmit={onSubmit}>
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
        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            name="password2"
            value={password2}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label htmlFor="userType">User Type:</label>
          <select value={userType} onChange={onChange} name="userType">
            <option value="">Select Type</option>
            <option value="user">Person</option>
            <option value="company">Company</option>
            <option value="sponsor">Sponsor</option>
          </select>
        </div>
        <button className="sign-up-button" type="submit" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default SignUpPage;
