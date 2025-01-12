import React from "react";
import "./Alert.css";

const Alert = ({ type, message }) => {
  if (!message) return null;

  return (
    <div className={`alert ${type}`}>
      <span>{message}</span>
    </div>
  );
};

export default Alert;
