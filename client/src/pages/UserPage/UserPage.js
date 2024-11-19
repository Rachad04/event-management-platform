import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./UserPage.css";

const UserPage = () => {
  const { user_id } = useParams();
  const [activeTab, setActiveTab] = useState("Details");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    birthday: "",
    gender: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create axios instance with default config
  const axiosInstance = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(`/api/users/${user_id}`);
        setUserData(response.data);
        setEditFormData({
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          phone: response.data.phone || "",
          location: response.data.location || "",
          birthday: response.data.birthday || "",
          gender: response.data.gender || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error.response?.data?.message || "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    if (user_id) {
      fetchUserData();
    }
  }, [user_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Log the current state before submission
      console.log("Submitting update for user:", user_id);
      console.log("Form data:", editFormData);
      console.log("Token:", localStorage.getItem("token"));

      const response = await axiosInstance.put(
        `/api/users/${user_id}`,
        editFormData
      );

      console.log("Update response:", response.data);
      setUserData(response.data);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user data:", error);
      setError(
        error.response?.data?.message ||
          "Failed to update profile. Please check your authentication."
      );
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>User not found</div>;

  const {
    username,
    firstName,
    lastName,
    email,
    phone,
    location,
    birthday,
    gender,
  } = userData;

  const EditForm = () => (
    <form onSubmit={handleSubmit} className="edit-form">
      <div className="form-group">
        <label>First Name:</label>
        <input
          type="text"
          name="firstName"
          value={editFormData.firstName}
          onChange={handleInputChange}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Last Name:</label>
        <input
          type="text"
          name="lastName"
          value={editFormData.lastName}
          onChange={handleInputChange}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Phone:</label>
        <input
          type="tel"
          name="phone"
          value={editFormData.phone}
          onChange={handleInputChange}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Location:</label>
        <input
          type="text"
          name="location"
          value={editFormData.location}
          onChange={handleInputChange}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Birthday:</label>
        <input
          type="date"
          name="birthday"
          value={editFormData.birthday}
          onChange={handleInputChange}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Gender:</label>
        <select
          name="gender"
          value={editFormData.gender}
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
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Left Section */}
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-picture"></div>
            <h2>{username || "Username"}</h2>
          </div>
          <div className="profile-info">
            <p>First Name: {firstName || "N/A"}</p>
            <p>Last Name: {lastName || "N/A"}</p>
            <p>Email: {email || "N/A"}</p>
          </div>
        </div>
        {/* Right Section */}
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
                  ["First Name:", firstName || "N/A"],
                  ["Last Name:", lastName || "N/A"],
                  ["Email:", email || "N/A"],
                  ["Phone #:", phone || "N/A"],
                  ["Location:", location || "N/A"],
                  ["Birthday:", birthday || "N/A"],
                  ["Gender:", gender || "N/A"],
                ].map(([label, value]) => (
                  <div key={label} className="detail-row">
                    <span className="detail-label">{label}</span>
                    <span className="detail-value">{value}</span>
                  </div>
                ))}
                <button
                  className="modify-button"
                  onClick={() => setIsEditing(true)}
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
