import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManagerPage.css";
import EventForm from "../../Components/EventForm/EventForm";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000",

  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const ManagerPage = () => {
  const [isCompany, setIsCompany] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const decodedToken = JSON.parse(atob(token.split(".")[1]));

        const userId = decodedToken.id;

        const response = await axiosInstance.get(`/api/users/${userId}`);

        if (response.data.user_type === "company") {
          setIsCompany(true);
        } else {
          throw new Error(
            "Unauthorized access. Only companies can manage events."
          );
        }
      } catch (err) {
        setError(err.message || "Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleCreateEvent = async (eventData) => {
    try {
      const response = await axiosInstance.post("/api/events", eventData);

      setSuccess("Event created successfully!");

      setError("");

      setEventData(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <h2>Event Management</h2>

        {error && <div className="error-message">{error}</div>}

        {success && <div className="success-message">{success}</div>}

        {isCompany ? (
          <EventForm onSubmit={handleCreateEvent} initialData={eventData} />
        ) : (
          <div className="no-access-message">
            You are not authorized to create events.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerPage;
