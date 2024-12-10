import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create Context
export const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    user: null, // Initially null, will be set after login
  });

  // Fetch user data if a valid token exists
  useEffect(() => {
    if (auth.token) {
      // If there's a token, fetch user data
      axios
        .get("http://localhost:5000/api/user", {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        .then((response) => {
          console.log("User data fetched:", response.data); // Debugging line to see response
          setAuth((prev) => ({
            ...prev,
            user: { ...prev.user, username: response.data.message }, // Example of setting user
          }));
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setAuth({ token: null, user: null });
          localStorage.removeItem("token"); // If there's an error, remove token
        });
    }
  }, [auth.token]); // Only run if `auth.token` changes

  // Login function: store token and extract user ID
  const login = (token) => {
    localStorage.setItem("token", token); // Store token in localStorage
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode the JWT payload
      console.log("Decoded JWT Payload:", payload); // Debugging line to ensure payload is correct

      const userId = payload.id; // Extract userId from the decoded payload
      const username = payload.username; // You might also want to extract username or other details

      setAuth((prev) => ({
        ...prev,
        user: { ...prev.user, id: userId, username: username }, // Update user info in context
      }));

      localStorage.setItem("userId", userId); // Store userId in localStorage as well
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
