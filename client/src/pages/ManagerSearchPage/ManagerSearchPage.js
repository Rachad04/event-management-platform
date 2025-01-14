import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Contexts/AuthContext";
import axios from "axios";
import "./ManagerSearchPage.css";

const ManagerSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and has userType data
    if (!auth.user || !auth.user.userType) {
      console.log("No user type found:", auth.user);
      navigate("/");
      return;
    }

    // Case-insensitive comparison of user type
    if (auth.user.userType.toLowerCase() !== "company") {
      console.log("User type mismatch:", auth.user.userType);
      navigate("/");
      return;
    }

    // Fetch company details
    const fetchCompanyDetails = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/companies/managed",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.data.length > 0) {
          setCompanyDetails(response.data[0]);
        }
      } catch (err) {
        console.error("Error fetching company details:", err);
      }
    };

    fetchCompanyDetails();
  }, [auth.user, navigate]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/search?email=${searchTerm}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setSearchResults([response.data]);
    } catch (err) {
      setError(err.response?.data?.message || "Error searching for users");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignManager = async (userId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/companies/managers",
        {
          managerId: userId,
          companyId: companyDetails.managing_company_id,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      alert("Manager assigned successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Error assigning manager");
    }
  };

  return (
    <div className="manager-search-container">
      <h2>Assign Company Manager</h2>
      {companyDetails && (
        <div className="company-info">
          <h3>Company: {companyDetails.company_name}</h3>
        </div>
      )}

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by email"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="search-results">
        {searchResults.map((user) => (
          <div key={user.user_id} className="user-card">
            <div className="user-info">
              <p>
                <strong>Name:</strong> {user.first_name} {user.last_name}
              </p>
              <p>
                <strong>Email:</strong> {user.email_address}
              </p>
              <p>
                <strong>Phone:</strong> {user.phone_number}
              </p>
            </div>
            <button
              onClick={() => handleAssignManager(user.user_id)}
              className="assign-button"
            >
              Assign as Manager
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerSearchPage;
