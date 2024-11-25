import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./UserPage.css";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

// Interceptor for setting Authorization header dynamically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const UserPage = () => {
  const { user_id } = useParams();
  const [activeTab, setActiveTab] = useState("Details");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({}); // Single source of truth for form data
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const loggedInUserId = localStorage.getItem("userId");
        if (loggedInUserId !== user_id) {
          setError("Unauthorized access");
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get(`/api/users/${user_id}`);
        setUserData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    if (user_id) fetchUserData();
  }, [user_id]);

  if (error) {
    return <div>{error}</div>;
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(
        `/api/users/${user_id}`,
        formData
      );
      setUserData(response.data);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>User not found</div>;

  const EditForm = () => (
    <form onSubmit={handleSubmit} className="edit-form">
      <div className="form-group">
        <label htmlFor="firstName">First Name:</label>
        <input
          id="firstName"
          type="text"
          name="firstName"
          value={formData.firstName || ""}
          onChange={handleInputChange}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="lastName">Last Name:</label>
        <input
          id="lastName"
          type="text"
          name="lastName"
          value={formData.lastName || ""}
          onChange={handleInputChange}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone:</label>
        <input
          id="phone"
          type="tel"
          name="phone"
          value={formData.phone || ""}
          onChange={handleInputChange}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Location:</label>
        <input
          id="location"
          type="text"
          name="location"
          value={formData.location || ""}
          onChange={handleInputChange}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="birthday">Birthday:</label>
        <input
          id="birthday"
          type="date"
          name="birthday"
          value={formData.birthday || ""}
          onChange={handleInputChange}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="gender">Gender:</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender || ""}
          onChange={handleInputChange}
          className="form-input"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div className="button-group">
        <button type="submit" className="save-button">
          Save Changes
        </button>
        <button
          type="button"
          className="cancel-button"
          onClick={() => {
            setFormData(userData);
            setIsEditing(false);
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-picture"></div>
            <h2>{userData.username || "Username"}</h2>
          </div>
          <div className="profile-info">
            <p>First Name: {userData.firstName || "N/A"}</p>
            <p>Last Name: {userData.lastName || "N/A"}</p>
            <p>Email: {userData.email || "N/A"}</p>
          </div>
        </div>

        <div className="details-card">
          <div className="tabs">
            {["Details", "Current events", "Previous events"].map((tab) => (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="details-content">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {isEditing ? (
              <EditForm />
            ) : (
              <>
                {[
                  ["First Name:", userData.firstName],
                  ["Last Name:", userData.lastName],
                  ["Email:", userData.email],
                  ["Phone #:", userData.phone],
                  ["Location:", userData.location],
                  ["Birthday:", userData.birthday],
                  ["Gender:", userData.gender],
                ].map(([label, value]) => (
                  <div key={label} className="detail-row">
                    <span className="detail-label">{label}</span>
                    <span className="detail-value">{value || "N/A"}</span>
                  </div>
                ))}
                <button
                  className="modify-button"
                  onClick={() => {
                    setFormData(userData);
                    setIsEditing(true);
                  }}
                >
                  Modify details
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
