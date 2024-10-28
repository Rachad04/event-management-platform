// UserPage.js
import React, { useState } from "react";
import "./UserPage.css";

const UserPage = () => {
  const [activeTab, setActiveTab] = useState("Details");

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Left Section */}
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-picture"></div>
            <h2>Username</h2>
          </div>
          <div className="profile-info">
            <p>first name: name</p>
            <p>last name: lastname</p>
            <p>email: email@email.com</p>
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
              ["first name:", "name"],
              ["last name:", "lastname"],
              ["email:", "email@email.com"],
              ["Phone #:", "01111111"],
              ["Location:", "Beirut, Lebanon"],
              ["Birthday:", "01/01/01"],
              ["Gender:", "Male"],
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
