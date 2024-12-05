import React, { useState, useRef } from "react";
import "./EventsPage.css";
import { Link } from "react-router-dom";
import noImageIcon from "./Images/no-image.png";
import beachimage from "./Images/beach-cleanup-image.png";

const events = [
  {
    id: 1,
    title: "BEACH CLEAN UP FOR FAMILY",
    date: "Mon, November 13, 2023",
    location: "Public Beach Beirut",
    tags: ["Activity"],
    buttonText: "Get Tickets",
    buttonLink: "/tickets/1",
    image: beachimage,
  },
  {
    id: 2,
    title: "Birthday Party Package - Beirut Cultural Tour",
    date: "Available every day",
    location: "",
    tags: ["Activity", "Birthday in Beirut", "Cultural Tour"],
    buttonText: "Get Tickets",
    buttonLink: "/tickets/2",
    image: "",
  },
  {
    id: 3,
    title: "Birthday Party Package to the Chocolate Museum",
    date: "Available every day",
    location: "",
    tags: ["Activity", "Chocolate Workshop", "Choco Fun"],
    buttonText: "Get Tickets",
    buttonLink: "/tickets/3",
    image: noImageIcon,
  },
  {
    id: 4,
    title: "BOARD GAMES ACTIVITIES FOR KIDS",
    date: "Sat, November 30, 2024",
    location: "+5 dates",
    tags: ["Activity"],
    buttonText: "Get Tickets",
    buttonLink: "/tickets/4",
    image: "",
  },
  {
    id: 5,
    title: "BEACH CLEAN UP FOR FAMILY",
    date: "Mon, November 13, 2023",
    location: "Public Beach Beirut",
    tags: ["Activity"],
    buttonText: "Get Tickets",
    buttonLink: "/tickets/5",
    image: beachimage,
  },
  {
    id: 6,
    title: "Birthday Party Package - Beirut Cultural Tour",
    date: "Available every day",
    location: "",
    tags: ["Activity", "Birthday in Beirut", "Cultural Tour"],
    buttonText: "Get Tickets",
    buttonLink: "/tickets/6",
    image: "",
  },
  {
    id: 7,
    title: "Birthday Party Package to the Chocolate Museum",
    date: "Available every day",
    location: "",
    tags: ["Activity", "Chocolate Workshop", "Choco Fun"],
    buttonText: "Get Tickets",
    buttonLink: "/tickets/7",
    image: noImageIcon,
  },
  {
    id: 8,
    title: "BOARD GAMES ACTIVITIES FOR KIDS",
    date: "Sat, November 30, 2024",
    location: "+5 dates",
    tags: ["Activity"],
    buttonText: "Get Tickets",
    buttonLink: "/tickets/8",
    image: "",
  },
  {
    id: 9,
    title: "BEACH CLEAN UP FOR FAMILY",
    date: "Mon, November 13, 2023",
    location: "Public Beach Beirut",
    tags: ["Activity"],
    buttonText: "Get Tickets",
    buttonLink: "/tickets/9",
    image: beachimage,
  },
  {
    id: 10,
    title: "Birthday Party Package - Beirut Cultural Tour",
    date: "Available every day",
    location: "",
    tags: ["Activity", "Birthday in Beirut", "Cultural Tour"],
    buttonText: "Get Tickets",
    buttonLink: "/tickets/10",
    image: "",
  },
];

const EventsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const upcomingEventsRef = useRef(null);

  const handleScrollToSection = () => {
    if (upcomingEventsRef.current) {
      upcomingEventsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };


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
                {event.tags.map((tag, index) => (
                  <span className="event-tag" key={`${event.id}-${index}`}>
                    {tag}
                  </span>
                ))}
              </div>
              <button
                className="event-button"
                onClick={() => {
                  window.location.href = event.buttonLink || "#";
                }}
              >
                {event.buttonText}
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
