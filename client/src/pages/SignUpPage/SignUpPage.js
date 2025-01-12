import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./SignUpPage.css";

function SignUpPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "",
    password2: "",
  });
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { email, userType, password, password2 } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    // Validate passwords match
    if (password !== password2) {
      setErrors([{ msg: "Passwords do not match" }]);
      setIsLoading(false);
      return;
    }

    // Validate user type is selected
    if (!userType) {
      setErrors([{ msg: "Please select a user type" }]);
      setIsLoading(false);
      return;
    }

    try {
      // Sign up request
      const res = await axios.post(
        "http://localhost:5000/api/signup",
        formData
      );

      // Wait for login to complete and get user data
      const userData = await login(res.data.token);

      if (userData?.id) {
        localStorage.setItem("userId", userData.id);
        navigate(`/users/user/${userData.id}`, { replace: true });
      } else {
        throw new Error("User ID not found in response");
      }
    } catch (error) {
      console.error("Signup error:", error);
      if (error.response?.data) {
        setErrors(
          error.response.data.errors || [{ msg: error.response.data.message }]
        );
      } else {
        setErrors([{ msg: "Server error. Please try again." }]);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="sign-up-page">
      <h2>Sign Up</h2>
      {errors.length > 0 &&
        errors.map((error, index) => (
          <p key={index} className="error-message">
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
            minLength="6"
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
            disabled={isLoading}
            minLength="6"
          />
        </div>
        <div>
          <label htmlFor="userType">User Type:</label>
          <select
            value={userType}
            onChange={onChange}
            name="userType"
            required
            disabled={isLoading}
          >
            <option value="">Select Type</option>
            <option value="user">Person</option>
            <option value="company">Company</option>
            <option value="sponsor">Sponsor</option>
          </select>
        </div>
        <button
          className={`sign-up-button ${isLoading ? "loading" : ""}`}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default SignUpPage;
