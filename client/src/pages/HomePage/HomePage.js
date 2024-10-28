import React from 'react';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <header className="hero-section">
        <h1>Welcome to Evently</h1>
        <p>Your one-stop platform to organize, manage, and track your events effortlessly.</p>
        <button className="cta-button">Create an Event</button>
      </header>

      {/* Feature Cards */}
      <section className="features">
        <h2>What We Offer</h2>
        <div className="feature-cards">
          <div className="card">
            <h3>Create Events</h3>
            <p>Set up and manage your events in a few clicks. Customize details and send invitations with ease.</p>
            <button className="card-button">Start Now</button>
          </div>
          <div className="card">
            <h3>Track RSVPs</h3>
            <p>Monitor responses in real-time, and keep track of attendee confirmations and changes.</p>
            <button className="card-button">Track RSVPs</button>
          </div>
          <div className="card">
            <h3>Connect with Attendees</h3>
            <p>Engage with your guests, share updates, and keep everyone informed on event details.</p>
            <button className="card-button">Connect Now</button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <h2>About Evently</h2>
        <p>Evently is designed to simplify your event management. From planning to tracking RSVPs, our platform offers all the tools you need for a seamless experience.</p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 Evently. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
