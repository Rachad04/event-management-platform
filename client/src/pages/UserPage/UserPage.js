// UserPage.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./UserPage.css";

const UserPage = () => {
  const { user_id } = useParams(); // Get user ID from URL
  const [activeTab, setActiveTab] = useState("Details");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data based on user ID
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/users/${user_id}`
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user_id]);

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
            <button className="modify-button">Modify details</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
