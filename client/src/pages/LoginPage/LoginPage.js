// pages/LoginPage/LoginPage.js
import React from 'react';
import './LoginPage.css';

const LoginPage = () => {
  return (
    <div className="login-page">
      <h1>Login to Evently</h1>
      <form className="login-form">
        <label>Email:</label>
        <input type="email" placeholder="Enter your email" required />

        <label>Password:</label>
        <input type="password" placeholder="Enter your password" required />

        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
