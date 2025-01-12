import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../Contexts/AuthContext";
import "./NavigationBar.css";

function NavigationBar() {
  const { auth } = useContext(AuthContext);
  const isLoggedIn = !!auth.token && !auth.loading;
  const isManagerOrAdmin =
    auth.user?.isAdmin || auth.user?.userType === "company";

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src="/logo-icon.png" alt="Logo" />
        </Link>
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
              <Link to="/company-management">Dashboard</Link>
            </li>
          </>
        )}
        {isLoggedIn ? (
          <div>
            <Link to={`/users/user/${auth.user?.id}`} className="user-icon">
              <img
                src="/images/user-icon-2-secondary.png"
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
