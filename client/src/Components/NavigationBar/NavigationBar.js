import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../Contexts/AuthContext";
import "./NavigationBar.css";

function NavigationBar() {
  const { auth } = useContext(AuthContext);
  const isLoggedIn = !!auth.token && !auth.loading;
  const isManagerOrAdmin =
    auth.user?.isAdmin || auth.user?.userType === "company";

  // Get profile picture URL with proper base URL and null check
  const profilePicture = useMemo(() => {
    return auth.user?.profile_picture
      ? `http://localhost:5000${auth.user.profile_picture}`
      : "/images/user-icon-2-secondary.png";
  }, [auth.user?.profile_picture]);

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
                src={profilePicture}
                alt="User Profile"
                className="user-image"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
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
