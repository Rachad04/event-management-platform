import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import "./EventDashboardPage.css";

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

const EventDashboardPage = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [addUserError, setAddUserError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch user type and managed companies on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userResponse = await axiosInstance.get("/api/user");
        setUserType(userResponse.data.userType);

        if (userResponse.data.is_admin === true) {
          // Fetch all companies for admin
          const companiesResponse = await axiosInstance.get("/api/companies");
          setCompanies(companiesResponse.data);
        } else {
          // Fetch companies where user is manager
          const managedCompaniesResponse = await axiosInstance.get(
            "/api/companies/managed"
          );
          setCompanies(managedCompaniesResponse.data);
        }
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load initial data");
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch events when company is selected
  useEffect(() => {
    const fetchCompanyEvents = async () => {
      if (!selectedCompany) return;

      try {
        const response = await axiosInstance.get(
          `/api/companies/${selectedCompany}/events`
        );
        setEvents(response.data);
        setSelectedEvent(null); // Reset selected event
        setUsers([]); // Reset users list
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load company events"
        );
      }
    };

    fetchCompanyEvents();
  }, [selectedCompany]);

  // Fetch users when event is selected
  useEffect(() => {
    const fetchEventUsers = async () => {
      if (!selectedEvent) return;

      try {
        const response = await axiosInstance.get(
          `/api/events/${selectedEvent}/users`
        );
        setUsers(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load event users");
      }
    };

    fetchEventUsers();
  }, [selectedEvent]);

  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value);
  };

  const handleEventChange = (e) => {
    setSelectedEvent(e.target.value);
  };

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const handleRemoveUser = async (userId) => {
    try {
      const response = await axiosInstance.delete(
        `/api/events/${selectedEvent}/users/${userId}`
      );
      if (response.status === 200) {
        setUsers(users.filter((user) => user.user_id !== userId));
        setSuccessMessage("User removed successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove user");
    }
  };

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      setAddUserError("Please enter an email address");
      return;
    }

    setLoading(true);
    setAddUserError("");
    setSearchResult(null);

    try {
      const response = await axiosInstance.get(
        `/api/users/search?email=${encodeURIComponent(searchEmail.trim())}`
      );

      if (response.data) {
        // Check if user is already in the event
        const isUserAlreadyAdded = users.some(
          (user) => user.user_id === response.data.user_id
        );

        if (isUserAlreadyAdded) {
          setAddUserError("This user is already added to the event");
        } else {
          setSearchResult(response.data);
        }
      }
    } catch (err) {
      console.error("Search error:", err);
      setAddUserError(
        err.response?.data?.message ||
          "User not found. Please check the email address."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!searchResult) return;

    try {
      const response = await axiosInstance.post(
        `/api/events/${selectedEvent}/users`,
        {
          userId: searchResult.user_id,
        }
      );

      if (response.status === 200) {
        // Check if user is already in the list
        if (!users.find((u) => u.user_id === searchResult.user_id)) {
          setUsers([...users, searchResult]);
        }
        setSuccessMessage("User added successfully");
        setSearchEmail("");
        setSearchResult(null);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setAddUserError(err.response?.data?.message || "Failed to add user");
    }
  };

  const MessageAlert = ({ message, type }) => (
    <div className={`message-alert ${type}`}>{message}</div>
  );

  return (
    <div className="management-container">
      <div className="header-section">
        <h1>Company Users Management</h1>
        <p className="user-type">
          {userType === "admin" ? "Admin Access" : "Manager Access"}
        </p>
      </div>

      <div className="content-section">
        <div className="selection-card">
          <label>Select Company:</label>
          <select value={selectedCompany || ""} onChange={handleCompanyChange}>
            <option value="">Choose a company</option>
            {companies.map((company) => (
              <option
                key={company.managing_company_id}
                value={company.managing_company_id}
              >
                {company.company_name}
              </option>
            ))}
          </select>
        </div>

        {selectedCompany && (
          <div className="selection-card">
            <label>Select Event:</label>
            <select value={selectedEvent || ""} onChange={handleEventChange}>
              <option value="">Choose an event</option>
              {events.map((event) => (
                <option key={event.event_id} value={event.event_id}>
                  {event.event_type}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedEvent && (
          <div className="add-user-section">
            <h3>Add User to Event</h3>
            <div className="search-container">
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Search user by email"
                className="search-input"
              />
              <button onClick={handleSearchUser} className="search-button">
                <Search size={18} />
                Search
              </button>
            </div>

            {searchResult && (
              <div className="search-result">
                <p>
                  Found: {searchResult.first_name} {searchResult.last_name} (
                  {searchResult.email_address})
                </p>
                <button onClick={handleAddUser} className="add-button">
                  Add to Event
                </button>
              </div>
            )}

            {addUserError && (
              <MessageAlert message={addUserError} type="error" />
            )}
            {successMessage && (
              <MessageAlert message={successMessage} type="success" />
            )}
          </div>
        )}

        {selectedEvent && (
          <div className="users-card">
            <h2>Event Attendees</h2>
            {users.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Purchase Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.user_id}>
                        <td>{`${user.first_name} ${user.last_name}`}</td>
                        <td>{user.email_address}</td>
                        <td>{user.phone_number || "N/A"}</td>
                        <td>
                          {new Date(user.purchase_date).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            onClick={() => handleRemoveUser(user.user_id)}
                            className="remove-button"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-users">No users found for this event.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default EventDashboardPage;
