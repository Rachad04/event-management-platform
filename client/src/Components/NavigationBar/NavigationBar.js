import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./NavigationBar.css";

function NavigationBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const userType = localStorage.getItem("userType");
    setIsLoggedIn(!!token);
    setUserId(userId);
    setUserType(userType);
  }, []);

  const isManagerOrAdmin = userType === "admin" || userType === "company";

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/logo-icon.png" alt="Logo" />
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/events">Events</Link>
        </li>
        {isManagerOrAdmin && (
          <>
            <li>
              <Link to="/manager">Manager</Link>
            </li>
            <li>
              <Link to="/company-users">Company Users</Link>
            </li>
          </>
        )}
        {isLoggedIn ? (
          <div>
            <Link to={`/users/user/${userId}`} className="user-icon">
              <img
                src="/images/user-icon-2.png"
                alt="User Icon"
                className="user-image"
              />
            </Link>
          </div>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/sign-up">Sign Up</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavigationBar;
