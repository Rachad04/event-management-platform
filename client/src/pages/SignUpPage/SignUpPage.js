// pages/SignUpPage/SignUpPage.js
import React from 'react';
import './SignUpPage.css';

const SignUpPage = () => {
  return (
    <div className="sign-up-page">
      <h1>Create an Account</h1>
      <form className="sign-up-form">
        <label>Username:</label>
        <input type="text" placeholder="Enter your username" required />

        <label>Email:</label>
        <input type="email" placeholder="Enter your email" required />

        <label>Password:</label>
        <input type="password" placeholder="Enter your password" required />

        <label>Confirm Password:</label>
        <input type="password" placeholder="Confirm your password" required />

        <button type="submit" className="sign-up-button">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUpPage;
