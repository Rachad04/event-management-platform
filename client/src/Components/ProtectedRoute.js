import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { auth } = useContext(AuthContext);

  if (!auth.token) {
    // If no token, redirect to login
    return <Navigate to="/login" />;
  }

  return children; // Otherwise, render the children components (UserPage)
};

export default ProtectedRoute;
