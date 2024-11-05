import React, { useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './EventsPage.css';

const events = [
  { id: 1, title: "Annual Tech Conference", date: "Nov 10, 2024", location: "TechHub Auditorium", flyer: null },
  { id: 2, title: "Startup Pitch Night", date: "Nov 15, 2024", location: "City Center Plaza", flyer: null },
  { id: 3, title: "Music Fest 2024", date: "Dec 1, 2024", location: "Greenfield Park", flyer: null },
  { id: 4, title: "Food Carnival", date: "Dec 5, 2024", location: "Downtown Square", flyer: null },
  { id: 5, title: "Charity Run", date: "Dec 12, 2024", location: "City Stadium", flyer: null },
  { id: 6, title: "Art Expo", date: "Dec 18, 2024", location: "Art Museum", flyer: null },
  // Add more events as needed
];

const EventsPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const eventsContainerRef = useRef(null);

  // Automatic scrolling interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex < events.length - 4 ? prevIndex + 1 : 0));
    }, 3000); // Change slides every 3 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (eventsContainerRef.current) {
      eventsContainerRef.current.scrollTo({
        left: (currentIndex * 250), // Adjust based on card width
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);

  const scrollLeft = () => {
    setCurrentIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : events.length - 4));
  };

  const scrollRight = () => {
    setCurrentIndex(prevIndex => (prevIndex < events.length - 4 ? prevIndex + 1 : 0));
  };

  return (
    <div className="events-page">
      <h1>Upcoming Events</h1>
      <div className="scroll-container" ref={eventsContainerRef}>
        {events.slice(currentIndex, currentIndex + 4).map(event => (
          <div className="event-card" key={event.id}>
            <img src={event.flyer || 'path/to/no-image-placeholder.png'} alt={`${event.title} flyer`} className="event-flyer" />
            <div className="event-details">
              <h3>{event.title}</h3>
              <p>{event.date}</p>
              <p>{event.location}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="nav-arrow left" onClick={scrollLeft}><FaChevronLeft /></button>
      <button className="nav-arrow right" onClick={scrollRight}><FaChevronRight /></button>
    </div>
  );
};

export default EventsPage;
