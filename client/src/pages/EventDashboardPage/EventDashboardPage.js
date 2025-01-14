import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
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

const USERS_PER_PAGE = 10;

const EventDashboardPage = () => {
  // Core state
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userType, setUserType] = useState(null);

  // Users state
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Search and filter state
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const searchTimeoutRef = useRef(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // UI state
  const [loading, setLoading] = useState({
    initial: true,
    users: false,
    search: false,
  });
  const [error, setError] = useState("");
  const [addUserError, setAddUserError] = useState("");
  const [removeUserError, setRemoveUserError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userResponse = await axiosInstance.get("/api/user");
        setUserType(userResponse.data.userType);

        const companiesResponse = await axiosInstance.get(
          userResponse.data.userType === "admin"
            ? "/api/companies"
            : "/api/companies/managed"
        );
        setCompanies(companiesResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load initial data");
      } finally {
        setLoading((prev) => ({ ...prev, initial: false }));
      }
    };

    fetchInitialData();
  }, []);

  // Fetch company events
  const fetchCompanyEvents = useCallback(async (companyId) => {
    if (!companyId) return;

    try {
      const response = await axiosInstance.get(
        `/api/companies/${companyId}/events`
      );
      setEvents(response.data);
      setSelectedEvent(null);
      setUsers([]);
      setCurrentPage(1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load company events");
    }
  }, []);

  // Fetch event users
  const fetchEventUsers = useCallback(async () => {
    if (!selectedEvent) return;

    setLoading((prev) => ({ ...prev, users: true }));
    try {
      const response = await axiosInstance.get(
        `/api/events/${selectedEvent}/users`
      );
      const fetchedUsers = response.data || [];
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
      setTotalUsers(fetchedUsers.length);
      setTotalPages(Math.ceil(fetchedUsers.length / USERS_PER_PAGE));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventUsers();
    }
  }, [selectedEvent, fetchEventUsers]);

  // Search users effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (attendeeSearch.trim()) {
        const searchTerm = attendeeSearch.toLowerCase();
        const filtered = users.filter(
          (user) =>
            user.first_name?.toLowerCase().includes(searchTerm) ||
            user.last_name?.toLowerCase().includes(searchTerm) ||
            user.email_address?.toLowerCase().includes(searchTerm) ||
            user.phone_number?.toLowerCase().includes(searchTerm)
        );
        setFilteredUsers(filtered);
        setCurrentPage(1);
      } else {
        setFilteredUsers(users);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [attendeeSearch, users]);

  // Search new user
  const searchNewUser = useCallback(
    async (email) => {
      if (!email.trim()) {
        setSearchResults([]);
        setAddUserError(""); // Clear error when search is empty
        return;
      }

      setLoading((prev) => ({ ...prev, search: true }));
      try {
        const response = await axiosInstance.get(
          `/api/users/search?email=${encodeURIComponent(email.trim())}`
        );
        if (response.data) {
          const isUserAlreadyAdded = users.some(
            (user) => user.user_id === response.data.user_id
          );
          setSearchResults(isUserAlreadyAdded ? [] : [response.data]);
          if (isUserAlreadyAdded) {
            setAddUserError("User already added to event");
          }
        }
      } catch (err) {
        setAddUserError(err.response?.data?.message || "User not found");
        setSearchResults([]);
      } finally {
        setLoading((prev) => ({ ...prev, search: false }));
      }
    },
    [users]
  );

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchNewUser(searchEmail);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchEmail, searchNewUser]);

  // Event handlers
  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    setSelectedCompany(companyId);
    fetchCompanyEvents(companyId);
  };

  const handleEventChange = (e) => {
    setSelectedEvent(e.target.value);
    setCurrentPage(1);
    setAttendeeSearch("");
    setFilteredUsers([]);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleAddUser = async (user) => {
    try {
      await axiosInstance.post(`/api/events/${selectedEvent}/users`, {
        userId: user.user_id,
      });

      setUsers((prev) => [...prev, user]);
      setFilteredUsers((prev) => [...prev, user]);
      setTotalUsers((prev) => prev + 1);
      setSearchEmail("");
      setSearchResults([]);
      setAddUserError(""); // Clear error after successful addition
      setSuccessMessage("User added successfully");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setAddUserError(err.response?.data?.message || "Failed to add user");
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await axiosInstance.delete(
        `/api/events/${selectedEvent}/users/${userId}`
      );

      setUsers((prev) => prev.filter((user) => user.user_id !== userId));
      setFilteredUsers((prev) =>
        prev.filter((user) => user.user_id !== userId)
      );
      setTotalUsers((prev) => prev - 1);
      setRemoveUserError("User removed successfully");

      setTimeout(() => setRemoveUserError(""), 3000);
    } catch (err) {
      setRemoveUserError(
        err.response?.data?.message || "Failed to remove user"
      );
    }
  };

  // UI Components
  const MessageAlert = ({ message, type }) => (
    <div className={`message-alert ${type}`}>{message}</div>
  );

  // Pagination calculations
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = Math.min(startIndex + USERS_PER_PAGE, filteredUsers.length);
  const currentPageUsers = filteredUsers.slice(startIndex, endIndex);

  const PaginationControls = () => (
    <div className="pagination-controls">
      <div className="pagination-info">
        <span>
          Showing {startIndex + 1} to {endIndex} of {filteredUsers.length} users
        </span>
      </div>
      <div className="pagination-buttons">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="pagination-page-info">
          Page {currentPage} of{" "}
          {Math.ceil(filteredUsers.length / USERS_PER_PAGE)}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={
            currentPage === Math.ceil(filteredUsers.length / USERS_PER_PAGE)
          }
          className="pagination-button"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  if (loading.initial)
    return <div className="loading-container">Loading...</div>;
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
                  {event.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedEvent && (
          <>
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
                <button className="search-button" disabled={loading.search}>
                  <Search size={18} />
                  Search
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="search-result">
                  {searchResults.map((user) => (
                    <div key={user.user_id} className="search-result-item">
                      <p>
                        {user.first_name} {user.last_name} ({user.email_address}
                        )
                      </p>
                      <button
                        onClick={() => handleAddUser(user)}
                        className="add-button"
                      >
                        Add to Event
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {addUserError && (
                <MessageAlert message={addUserError} type="error" />
              )}
              {successMessage && (
                <MessageAlert message={successMessage} type="success" />
              )}
            </div>

            <div className="users-card">
              <div className="users-header">
                <h2>Event Attendees</h2>
                {removeUserError && ( // Add error message for user removal at the top
                  <MessageAlert message={removeUserError} type="error" />
                )}
                <div className="search-container">
                  <input
                    type="text"
                    value={attendeeSearch}
                    onChange={(e) => setAttendeeSearch(e.target.value)}
                    placeholder="Search attendees..."
                    className="search-input"
                  />
                </div>
              </div>

              {loading.users ? (
                <div className="loading-container">Loading users...</div>
              ) : (
                <>
                  {currentPageUsers.length > 0 ? (
                    <div className="users-content">
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentPageUsers.map((user) => (
                              <tr key={user.user_id}>
                                <td>
                                  {user.first_name} {user.last_name}
                                </td>
                                <td>{user.email_address}</td>
                                <td>{user.phone_number || "N/A"}</td>
                                <td>
                                  <button
                                    onClick={() =>
                                      handleRemoveUser(user.user_id)
                                    }
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
                      <PaginationControls />
                    </div>
                  ) : (
                    <p className="no-users">No users found.</p>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventDashboardPage;
