import React from "react";
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
    image: beachimage,
  },
  {
    id: 2,
    title: "Birthday Party Package - Beirut Cultural Tour",
    date: "Available every day",
    location: "",
    tags: ["Activity", "Birthday in Beirut", "Cultural Tour"],
    buttonText: "Get Tickets",
    image: "", // No image for this event
  },
  {
    id: 3,
    title: "Birthday Party Package to the Chocolate Museum",
    date: "Available every day",
    location: "",
    tags: ["Activity", "Chocolate Workshop", "Choco Fun"],
    buttonText: "Get Tickets",
    image: "path/to/chocolate-museum-image.jpg",
  },
  {
    id: 4,
    title: "BOARD GAMES ACTIVITIES FOR KIDS",
    date: "Sat, November 30, 2024",
    location: "+5 dates",
    tags: ["Activity"],
    buttonText: "Get Tickets",
    image: "", // No image for this event
  },
  {
    id: 1,
    title: "BEACH CLEAN UP FOR FAMILY",
    date: "Mon, November 13, 2023",
    location: "Public Beach Beirut",
    tags: ["Activity"],
    buttonText: "Get Tickets",
    image: beachimage,
  },
  {
    id: 2,
    title: "Birthday Party Package - Beirut Cultural Tour",
    date: "Available every day",
    location: "",
    tags: ["Activity", "Birthday in Beirut", "Cultural Tour"],
    buttonText: "Get Tickets",
    image: "", // No image for this event
  },
  {
    id: 3,
    title: "Birthday Party Package to the Chocolate Museum",
    date: "Available every day",
    location: "",
    tags: ["Activity", "Chocolate Workshop", "Choco Fun"],
    buttonText: "Get Tickets",
    image: "path/to/chocolate-museum-image.jpg",
  },
  {
    id: 4,
    title: "BOARD GAMES ACTIVITIES FOR KIDS",
    date: "Sat, November 30, 2024",
    location: "+5 dates",
    tags: ["Activity"],
    buttonText: "Get Tickets",
    image: "", // No image for this event
  },
];

const EventsPage = () => {
  return (
    <div className="events-page">
      {/* Hero Section */}
      <div className="hero-section">
        <h1>Welcome to Evently</h1>
        <p>Your backstage pass to the world of events!</p>

        {/* Call to action button for scrolling to events */}
        <button
          className="cta-button"
          onClick={() => {
            const section = document.getElementById("upcoming-events");
            if (section) {
              section.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          View Events
        </button>
      </div>

      {/* Top-right buttons for login and sign-up */}
      <div className="top-right-buttons">
        <button className="cta-button">
          <Link to="/sign-up" relative="path">
            Sign up
          </Link>
        </button>
        <button className="cta-button">
          <Link to="/login" relative="path">
            Login
          </Link>
        </button>
      </div>

      {/* Upcoming Events */}
      <h1 id="upcoming-events" className="events-title">Upcoming Events</h1>
      <div className="events-container">
        {events.map((event) => (
          <div className="event-card" key={event.id}>
            <div className="image-container">
              <img
                src={event.image || noImageIcon} // Use event image or fallback to placeholder
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
                  <span className="event-tag" key={index}>
                    {tag}
                  </span>
                ))}
              </div>
              <button className="event-button">{event.buttonText}</button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 Evently. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default EventsPage;
