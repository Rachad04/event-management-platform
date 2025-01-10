import React, { useState, useEffect } from "react";
import axios from "axios";
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

  return (
    <div className="management-container">
      <div className="header-section">
        <h1>Company Users Management</h1>
        <p className="user-type">
          {userType === "admin" ? "Admin Access" : "Manager Access"}
        </p>
      </div>

      <div className="content-section">
        {/* Company Selection */}
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

        {/* Event Selection */}
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

        {/* Users List */}
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
