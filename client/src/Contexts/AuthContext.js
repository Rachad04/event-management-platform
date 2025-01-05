// AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    user: null,
    loading: true, // Add loading state
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get("http://localhost:5000/api/user", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAuth({
            token,
            user: response.data,
            loading: false,
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          setAuth({ token: null, user: null, loading: false });
        }
      } else {
        setAuth((prev) => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = async (token) => {
    try {
      localStorage.setItem("token", token);

      // Decode token to get initial user data
      const payload = JSON.parse(atob(token.split(".")[1]));

      // Fetch full user data
      const response = await axios.get("http://localhost:5000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = {
        ...response.data,
        id: payload.id || response.data.id,
      };

      setAuth({
        token,
        user: userData,
        loading: false,
      });

      return userData; // Return user data for immediate use
    } catch (error) {
      console.error("Error in login:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setAuth({ token: null, user: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
