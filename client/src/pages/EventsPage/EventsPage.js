import React, { useState, useEffect, useRef } from "react";
import "./EventsPage.css";
import { Link } from "react-router-dom";
import noImageIcon from "./Images/no-image.png";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const upcomingEventsRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleScrollToSection = () => {
    if (upcomingEventsRef.current) {
      upcomingEventsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="events-page">
      {/* Hero Section */}
      <div className="hero-section">
        <h1>Welcome to Evently</h1>
        <p>Your backstage pass to the world of events!</p>

        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search events..."
            className="search-input"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Call to Action */}
        <button className="cta-button" onClick={handleScrollToSection}>
          View Events
        </button>
      </div>

      {/* Top Right Buttons */}
      <div className="top-right-buttons">
        <button className="cta-button">
          <Link to="/sign-up">Sign up</Link>
        </button>
        <button className="cta-button">
          <Link to="/login">Login</Link>
        </button>
      </div>

      {/* Upcoming Events Section */}
      <section id="upcoming-events" ref={upcomingEventsRef}>
        <h1 id="upcoming-events" className="events-title">
          Upcoming Events
        </h1>
        <div className="events-container">
          {filteredEvents.map((event) => (
            <div className="event-card" key={event.id}>
              <div className="image-container">
                <img
                  src={event.image || noImageIcon}
                  alt={event.title}
                  className="event-image"
                />
              </div>
              <div className="event-details">
                <h2 className="event-title">{event.title}</h2>
                <p className="event-date">{event.date}</p>
                {event.location && (
                  <p className="event-location">{event.location}</p>
                )}
                <div className="event-tags">
                  {event.tags?.map((tag, index) => (
                    <span className="event-tag" key={`${event.id}-${index}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  className="event-button"
                  onClick={() => {
                    window.location.href = `/tickets/${event.id}`;
                  }}
                >
                  Get Tickets
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 Evently. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default EventsPage;
