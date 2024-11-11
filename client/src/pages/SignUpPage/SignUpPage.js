// src/components/SignUp.js
import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./SignUpPage.css";

function SignUpPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate("/user");
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    location: "",
    birthday: "",
    gender: "",
    username: "",
    password: "",
    password2: "",
  });

  const [errors, setErrors] = useState([]);

  const {
    firstName,
    lastName,
    phoneNumber,
    email,
    location,
    birthday,
    gender,
    username,
    password,
    password2,
  } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

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
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={firstName}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={lastName}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label>Phone Number:</label>
          <input
            type="text"
            name="phoneNumber"
            value={phoneNumber}
            onChange={onChange}
            required
          />
        </div>
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
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={location}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label>Birthday:</label>
          <input
            type="date"
            name="birthday"
            value={birthday}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label htmlFor="gender">Gender:</label>
          <select value={gender} onChange={onChange} name="gender">
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={username}
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
        <button className="sign-up-button" type="submit">
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default SignUpPage;
