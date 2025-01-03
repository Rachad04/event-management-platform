import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManagerPage.css";

// Setup axios instance
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
  const [eventData, setEventData] = useState({
    name: "",
    date: "",
    time: "",
    location: "",
    price: "",
  });

  // Check if the user has the "Company" role
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get("/api/users/me");
        if (response.data.role === "Company") {
          setIsCompany(true);
        }
      } catch (err) {
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Handle input changes for event creation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle event creation
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/api/events", eventData);
      setSuccess("Event created successfully!");
      setEventData({ name: "", date: "", time: "", location: "", price: "" });
    } catch (err) {
      setError("Failed to create event.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="details-card">
          <h2>Event Management</h2>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {isCompany ? (
            <form onSubmit={handleCreateEvent} className="event-form">
              <div className="form-group">
                <label htmlFor="name">Event Name:</label>
                <input
                  type="text"
                  name="name"
                  value={eventData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter event name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="date">Event Date:</label>
                <input
                  type="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="time">Event Time:</label>
                <input
                  type="time"
                  name="time"
                  value={eventData.time}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Event Location:</label>
                <input
                  type="text"
                  name="location"
                  value={eventData.location}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter event location"
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Event Price:</label>
                <input
                  type="number"
                  name="price"
                  value={eventData.price}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter ticket price"
                />
              </div>
              <div className="button-group">
                <button type="submit" className="save-button">
                  Create Event
                </button>
              </div>
            </form>
          ) : (
            <div className="no-access-message">
              You are not authorized to create events.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerPage;
