import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage'; // Make sure to import your LoginPage
import SignUpPage from './pages/SignUpPage/SignUpPage'; // Make sure to import your SignUpPage
import "./App.css"; // Import your stylesheets
import "./variables.css"; // Import your additional stylesheets

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </Router>
  );
}

export default App;

