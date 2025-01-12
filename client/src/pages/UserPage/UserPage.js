import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import axios from "axios";
import { AuthContext } from "./../../Contexts/AuthContext";
import "./UserPage.css";

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

const UserPage = () => {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("Details");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA"); // Returns YYYY-MM-DD format in local timezone
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const loggedInUserId = localStorage.getItem("userId");
        if (loggedInUserId !== user_id) {
          setError("Unauthorized access");
          setTimeout(() => {
            setError("");
          }, 3000);

          setLoading(false);
          return;
        }

        const response = await axiosInstance.get(`/api/users/${user_id}`);
        console.log("Received user data:", response.data);
        setUserData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load user data");

        setTimeout(() => {
          setError("");
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    if (user_id) fetchUserData();
  }, [user_id]);

  // When userData changes and we want to start editing, set formData
  useEffect(() => {
    if (isEditing && userData) {
      const formattedData = {
        ...userData,
        firstName:
          userData.firstName || userData.first_name || userData.firstname,
        lastName: userData.lastName || userData.last_name || userData.lastname,
      };
      console.log("Setting form data:", formattedData);
      setFormData(formattedData);
    }
  }, [isEditing, userData]);

  if (error) {
    return <div>{error}</div>;
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    setError(""); // Clear any previous errors
    setSuccess(""); // Clear any previous success messages

    try {
      const response = await axiosInstance.put(
        `/api/users/${user_id}`,
        formData
      );

      // Update the `userData` state with the latest changes
      setUserData(response.data);

      // Reset formData and editing state
      setFormData(null);
      setIsEditing(false);

      // Display success message
      setSuccess("Profile updated successfully!");

      //Hide the success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");

      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>User not found</div>;

  const EditForm = (
    <form onSubmit={handleSubmit} className="edit-form">
      <div className="form-group">
        <label htmlFor="firstName">First Name:</label>
        <input
          id="firstName"
          type="text"
          name="firstName"
          value={formData?.firstName || ""}
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
          value={formData?.lastName || ""}
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
          value={formData?.phone || ""}
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
          value={formData?.location || ""}
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
          value={
            formData?.birthday ? formatDateForInput(formData.birthday) : ""
          }
          onChange={handleInputChange}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="gender">Gender:</label>
        <select
          id="gender"
          name="gender"
          value={formData?.gender || ""}
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
            setIsEditing(false);
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div
      className="page-container"
      style={{
        width: "100vw",
        height: "calc(100vh - 8vh)", // Adjust height to account for the nav bar
        marginTop: "8vh", // Push the container below the nav bar
        backgroundImage: "url('/images/background.jpeg')", // Uncomment and set the background image if needed
        position: "absolute",
        overflow: "hidden",
      }}
    >
      <div className="content-wrapper">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-picture"></div>
            <h2>{userData.username || "Username"}</h2>
          </div>
          <div className="profile-info">
            <p>
              First Name:{" "}
              {userData.firstName ||
                userData.first_name ||
                userData.firstname ||
                "N/A"}
            </p>
            <p>
              Last Name:{" "}
              {userData.lastName ||
                userData.last_name ||
                userData.lastname ||
                "N/A"}
            </p>
            <p>Email: {userData.email || "N/A"}</p>
          </div>
        </div>

        <div
          className="details-card"
          style={{
            backgroundColor: "var(--neutral-1)", // You can replace this with a color value if needed
            borderRadius: "0.5rem",
            width: "60vw", // Adjust width for proportional scaling
            height: "86%",
            display: "flex",
            flexDirection: "column",
            padding: "2rem",
          }}
        >
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
              EditForm
            ) : (
              <>
                {[
                  [
                    "First Name:",
                    userData.firstName ||
                      userData.first_name ||
                      userData.firstname,
                  ],
                  [
                    "Last Name:",
                    userData.lastName ||
                      userData.last_name ||
                      userData.lastname,
                  ],
                  ["Email:", userData.email],
                  ["Phone #:", userData.phone],
                  ["Location:", userData.location],
                  ["Birthday:", formatDate(userData.birthday)],
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
                    setFormData({ ...userData }); // Populate formData with userData
                    setIsEditing(true);
                  }}
                >
                  Modify details
                </button>
                <button
                  onClick={handleLogout}
                  className="logout-button"
                  aria-label="Logout"
                >
                  <LogOut className="logout-icon" />
                  <span>Logout</span>
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
