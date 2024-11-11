// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create Context
export const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    user: null,
  });

  useEffect(() => {
    if (auth.token) {
      // Optionally, fetch user data
      axios
        .get("http://localhost:5000/api/protected", {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        .then((response) => {
          setAuth((prev) => ({ ...prev, user: response.data.message }));
        })
        .catch((error) => {
          console.error("Error fetching protected data:", error);
          setAuth({ token: null, user: null });
          localStorage.removeItem("token");
        });
    }
  }, [auth.token]);

  const login = (token) => {
    localStorage.setItem("token", token);
    setAuth({ token, user: null });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
