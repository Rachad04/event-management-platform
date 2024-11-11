import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";

function ProtectedRoute({ children }) {
  const { auth } = useContext(AuthContext);

  // If user is authenticated, render children; otherwise, redirect to login.
  return auth.token ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
