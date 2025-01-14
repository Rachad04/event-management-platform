import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import axios from "axios";
import { AuthContext } from "./../../Contexts/AuthContext";
import EventsTab from "../../Components/EventCard/EventCard";
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
  const [activeTab, setActiveTab] = useState("Details");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { CurrentEventsContent, PreviousEventsContent } = EventsTab();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  // Keep track of which input is currently focused
  const [focusedInput, setFocusedInput] = useState(null);

  const { auth, logout } = useContext(AuthContext);

  const profilePictureUrl = useMemo(() => {
    if (!userData?.profile_picture) {
      return "/images/user-icon-2-secondary.png";
    }
    // Handle both absolute and relative URLs
    return userData.profile_picture.startsWith("http")
      ? userData.profile_picture
      : `http://localhost:5000${userData.profile_picture}`;
  }, [userData?.profile_picture]);

  // refs for each input field
  const inputRefs = {
    firstName: useRef(null),
    lastName: useRef(null),
    username: useRef(null),
    email: useRef(null),
    phone: useRef(null),
    location: useRef(null),
    birthday: useRef(null),
    gender: useRef(null),
  };
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (focusedInput && inputRefs[focusedInput]?.current) {
      const input = inputRefs[focusedInput].current;
      const cursorPosition = input.selectionStart;
      input.focus();
      // Restore cursor position
      input.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [formData, focusedInput]);

  // helper functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFocusedInput(name);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
    return date.toLocaleDateString("en-CA");
  };

  // Fetch user data effect...
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const loggedInUserId = localStorage.getItem("userId");

        // check for undefined/null user_id
        if (!user_id) {
          setError("Invalid user ID");
          setLoading(false);
          return;
        }

        // Add check for auth state
        if (!auth?.token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        if (loggedInUserId !== user_id) {
          setError("Unauthorized access");
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get(`/api/users/${user_id}`);
        setUserData(response.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.response?.data?.message || "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user_id, auth]);

  useEffect(() => {
    console.log("Token:", localStorage.getItem("token"));
    console.log("User ID:", localStorage.getItem("userId"));
    console.log("Auth state:", auth);
  }, [auth]);

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("API Error:", error.response?.data || error.message);
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    if (isEditing && userData) {
      const formattedData = {
        ...userData,
        firstName:
          userData.firstName || userData.first_name || userData.firstname,
        lastName: userData.lastName || userData.last_name || userData.lastname,
      };
      setFormData(formattedData);
    } else {
      // Reset selected image and file input when closing edit mode
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isEditing, userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axiosInstance.put(
        `/api/users/${user_id}`,
        formData
      );
      setUserData(response.data);
      setFormData(null);
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
  };

  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>User not found</div>;
  if (error) return <div>{error}</div>;

  const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { user_id } = useParams();

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setSuccess("");

      try {
        // First, update user data
        const response = await axiosInstance.put(
          `/api/users/${user_id}`,
          formData
        );

        // If there's a selected image, upload it
        if (selectedImage) {
          const imageFormData = new FormData();
          imageFormData.append("profilePicture", selectedImage);

          await axiosInstance.post(
            `/api/users/${user_id}/profile-picture`,
            imageFormData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }

        // Update local state
        const updatedUserResponse = await axiosInstance.get(
          `/api/users/${user_id}`
        );
        setUserData(updatedUserResponse.data);
        setFormData(null);
        setSelectedImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setIsEditing(false);
        setSuccess("Profile updated successfully!");
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

    if (!isOpen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Change Password</h3>
            <button className="modal-close" onClick={onClose}>
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password:</label>
              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password:</label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="form-input"
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password:</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="modal-buttons">
              <button type="submit" className="save-button">
                Change Password
              </button>
              <button type="button" className="cancel-button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const UserDetailsContent = () => (
    <>
      {isEditing ? (
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor="firstName">First Name:</label>
            <input
              id="firstName"
              ref={inputRefs.firstName}
              type="text"
              name="firstName"
              value={formData?.firstName || ""}
              onChange={handleInputChange}
              className="form-input"
              onFocus={() => setFocusedInput("firstName")}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name:</label>
            <input
              id="lastName"
              ref={inputRefs.lastName}
              type="text"
              name="lastName"
              value={formData?.lastName || ""}
              onChange={handleInputChange}
              className="form-input"
              onFocus={() => setFocusedInput("lastName")}
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              ref={inputRefs.username}
              type="text"
              name="username"
              value={formData?.username || ""}
              onChange={handleInputChange}
              className="form-input"
              onFocus={() => setFocusedInput("username")}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              ref={inputRefs.email}
              type="email"
              name="email"
              value={formData?.email || ""}
              onChange={handleInputChange}
              className="form-input"
              onFocus={() => setFocusedInput("email")}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone:</label>
            <input
              id="phone"
              ref={inputRefs.phone}
              type="tel"
              name="phone"
              value={formData?.phone || ""}
              onChange={handleInputChange}
              className="form-input"
              onFocus={() => setFocusedInput("phone")}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location:</label>
            <input
              id="location"
              ref={inputRefs.location}
              type="text"
              name="location"
              value={formData?.location || ""}
              onChange={handleInputChange}
              className="form-input"
              onFocus={() => setFocusedInput("location")}
            />
          </div>

          <div className="form-group">
            <label htmlFor="birthday">Birthday:</label>
            <input
              id="birthday"
              ref={inputRefs.birthday}
              type="date"
              name="birthday"
              value={
                formData?.birthday ? formatDateForInput(formData.birthday) : ""
              }
              onChange={handleInputChange}
              className="form-input"
              onFocus={() => setFocusedInput("birthday")}
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender:</label>
            <select
              id="gender"
              ref={inputRefs.gender}
              name="gender"
              value={formData?.gender || ""}
              onChange={handleInputChange}
              className="form-input"
              onFocus={() => setFocusedInput("gender")}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="profilePicture">Profile Picture:</label>
            <input
              id="profilePicture"
              ref={fileInputRef}
              type="file"
              name="profilePicture"
              accept="image/*"
              onChange={handleImageChange}
              className="form-input"
            />
            {selectedImage && (
              <span className="selected-file">
                Selected: {selectedImage.name}
              </span>
            )}
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
      ) : (
        <>
          {[
            [
              "First Name:",
              userData.firstName || userData.first_name || userData.firstname,
            ],
            [
              "Last Name:",
              userData.lastName || userData.last_name || userData.lastname,
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
            className="change-password-button"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            Change Password
          </button>

          <ChangePasswordModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
          />
          <button
            className="modify-button"
            onClick={() => {
              setFormData({ ...userData });
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
    </>
  );

  return (
    <div
      className="page-container"
      style={{
        width: "100vw",
        height: "calc(100vh - 8vh)",
        paddingTop: "8vh",
        backgroundImage: "url('/images/background.jpeg')",
        position: "absolute",
        overflow: "hidden",
      }}
    >
      <div className="content-wrapper">
        <div className="profile-card">
          <div className="profile-header">
            <div
              className="profile-picture"
              style={{
                backgroundImage: `url(${profilePictureUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "#f0f0f0", // Fallback color
                border: "1px solid #ddd",
                width: "150px", // Explicit dimensions
                height: "150px",
                borderRadius: "50%",
              }}
            />
            <h2>
              {userData.username ||
                userData.userName ||
                userData.user_name ||
                userData.Username ||
                "Username"}
            </h2>
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
            backgroundColor: "var(--neutral-1)",
            borderRadius: "0.5rem",
            width: "60vw",
            height: "76%",
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

            {activeTab === "Details" && <UserDetailsContent />}
            {activeTab === "Current events" && <CurrentEventsContent />}
            {activeTab === "Previous events" && <PreviousEventsContent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
