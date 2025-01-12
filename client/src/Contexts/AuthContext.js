// AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

// Create axios instance with default config
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

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    user: null,
    loading: true,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axiosInstance.get("/api/user");
          const userData = {
            ...response.data,
            id: response.data.id,
            userType: response.data.userType,
            isAdmin: response.data.isAdmin,
            profile_picture: response.data.profile_picture,
          };

          setAuth({
            token,
            user: userData,
            loading: false,
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          handleLogout();
        }
      } else {
        setAuth((prev) => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userType");
    localStorage.removeItem("isAdmin");
    setAuth({ token: null, user: null, loading: false });
  };

  const login = async (token) => {
    try {
      localStorage.setItem("token", token);
      const payload = JSON.parse(atob(token.split(".")[1]));

      const response = await axiosInstance.get("/api/user");

      const userData = {
        ...response.data,
        id: payload.id || response.data.id,
        userType: payload.userType,
        isAdmin: payload.isAdmin,
        profile_picture: response.data.profile_picture,
      };

      localStorage.setItem("userId", userData.id);
      localStorage.setItem("userType", userData.userType);
      localStorage.setItem("isAdmin", userData.isAdmin);

      setAuth({
        token,
        user: userData,
        loading: false,
      });

      return userData;
    } catch (error) {
      console.error("Error in login:", error);
      handleLogout();
      throw error;
    }
  };

  const updateProfilePicture = async (profilePicture) => {
    try {
      setAuth((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          profile_picture: profilePicture,
        },
      }));
    } catch (error) {
      console.error("Error updating profile picture in context:", error);
      throw error;
    }
  };

  const updateUserData = async (userData) => {
    try {
      setAuth((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          ...userData,
        },
      }));
    } catch (error) {
      console.error("Error updating user data in context:", error);
      throw error;
    }
  };

  const contextValue = {
    auth,
    login,
    logout: handleLogout,
    updateProfilePicture,
    updateUserData,
    isAuthenticated: !!auth.token && !auth.loading,
    isAdmin: auth.user?.isAdmin || false,
    userType: auth.user?.userType || null,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
