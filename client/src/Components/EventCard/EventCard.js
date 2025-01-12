import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import "./EventCard.css";

const EventCard = ({ event }) => {
  const eventDate = new Date(event.date);

  return (
    <div className="event-card">
      <div className="event-header">
        <h3 className="event-title">{event.title}</h3>
        <div className="event-date">
          <Calendar className="calendar-icon" />
          {eventDate.toLocaleDateString()}
        </div>
      </div>
      <p className="event-description">{event.description}</p>
      <div className="event-footer">
        <span className="event-location">Location: {event.location}</span>
        <span className="event-price">Price: ${event.price}</span>
      </div>
    </div>
  );
};

const EventsTab = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  useEffect(() => {
    const getEvents = async () => {
      const allEvents = await fetchEvents();
      setEvents(allEvents);
      setLoading(false);
    };
    getEvents();
  }, []);

  if (loading) {
    return <div className="loading-message">Loading events...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const currentDate = new Date();
  const currentEvents = events.filter(
    (event) => new Date(event.date) >= currentDate
  );
  const previousEvents = events.filter(
    (event) => new Date(event.date) < currentDate
  );

  const CurrentEventsContent = () => (
    <div className="events-section">
      <h2 className="section-title">Current Events</h2>
      {currentEvents.length === 0 ? (
        <p className="no-events-message">No current events found.</p>
      ) : (
        currentEvents.map((event) => (
          <EventCard key={event.event_id} event={event} />
        ))
      )}
    </div>
  );

  const PreviousEventsContent = () => (
    <div className="events-section">
      <h2 className="section-title">Previous Events</h2>
      {previousEvents.length === 0 ? (
        <p className="no-events-message">No previous events found.</p>
      ) : (
        previousEvents.map((event) => (
          <EventCard key={event.event_id} event={event} />
        ))
      )}
    </div>
  );

  return { CurrentEventsContent, PreviousEventsContent };
};

export default EventsTab;
