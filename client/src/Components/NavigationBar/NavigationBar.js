import React, { useContext, useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../Contexts/AuthContext";
import axios from "axios";
import "./NavigationBar.css";

// Create axios instance with default config and interceptor
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

// Add interceptor to handle token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function NavigationBar() {
  const { auth } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const isLoggedIn = !!auth.token && !auth.loading;
  const isManagerOrAdmin =
    auth.user?.isAdmin || auth.user?.userType === "company";
  const isCompany = auth.user?.userType === "company";

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.user?.id && auth.token) {
        // Check for both id and token
        try {
          const response = await axiosInstance.get(
            `/api/users/${auth.user.id}`
          );
          setUserData(response.data);
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Handle 401 errors specifically
          if (error.response?.status === 401) {
            // You might want to trigger a logout here or refresh the token
            console.log("Authentication error - you may need to log in again");
          }
        }
      }
    };

    if (isLoggedIn) {
      fetchUserData();
    }
  }, [auth.user?.id, auth.token, isLoggedIn]); // Added auth.token to dependencies

  const profilePictureUrl = useMemo(() => {
    const profilePicture =
      userData?.profile_picture || auth.user?.profile_picture;

    if (!profilePicture) {
      return "/images/user-icon-2-secondary.png";
    }

    return profilePicture.startsWith("http")
      ? profilePicture
      : `http://localhost:5000${profilePicture}`;
  }, [userData?.profile_picture, auth.user?.profile_picture]);

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
        {isCompany && (
          <>
            <li>
              <Link to="/manage-company">Access</Link>
            </li>
          </>
        )}
        {isLoggedIn ? (
          <div className="profile-container">
            <Link to={`/users/user/${auth.user?.id}`}>
              <img
                src={profilePictureUrl}
                alt="User Profile"
                className="user-image"
                onError={(e) => {
                  e.target.src = "/images/user-icon-2-secondary.png";
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
