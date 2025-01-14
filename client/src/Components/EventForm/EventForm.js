import React, { useState, useEffect } from "react";
import "./EventForm.css";

const EventForm = ({ onSubmit, initialData = null }) => {
  const [eventData, setEventData] = useState(
    initialData || {
      title: "",
      description: "",
      date: "",
      floor: "",
      building: "",
      street: "",
      city: "",
      country: "",
      image_url: "",
      price: "",
      quantity: "",
    }
  );

  useEffect(() => {
    if (initialData) {
      setEventData(initialData);
    }
  }, [initialData]);

  const [isLocationExpanded, setIsLocationExpanded] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fullLocation = [
      eventData.floor,
      eventData.building,
      eventData.street,
      eventData.city,
      eventData.country,
    ]
      .filter((field) => field)
      .join(", ");

    const finalEventData = { ...eventData, location: fullLocation };

    if (
      !finalEventData.title ||
      !finalEventData.date ||
      !eventData.city ||
      !eventData.country
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (isNaN(finalEventData.quantity) || finalEventData.quantity < 0) {
      alert("Event capacity must be a valid non-negative number.");
      return;
    }

    onSubmit(finalEventData);

    setEventData({
      title: "",
      description: "",
      date: "",
      floor: "",
      building: "",
      street: "",
      city: "",
      country: "",
      image_url: "",
      price: "",
      quantity: "",
    });
    setIsLocationExpanded(true);
  };

  return (
    <form onSubmit={handleSubmit} className="event-form">
      <div className="form-groups-container">
        <div className="form-group">
          <label htmlFor="title">Event Title:</label>
          <input
            type="text"
            name="title"
            value={eventData.title}
            onChange={handleInputChange}
            placeholder="Enter event title"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            name="description"
            value={eventData.description}
            onChange={handleInputChange}
            placeholder="Enter event description"
          />
        </div>
        <div className="form-group">
          <label htmlFor="date">Event Date:</label>
          <input
            type="date"
            name="date"
            value={eventData.date}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="location">Location:</label>
          {isLocationExpanded && (
            <div className="collapsible-content">
              <input
                type="text"
                name="floor"
                value={eventData.floor}
                onChange={handleInputChange}
                placeholder="Floor (optional)"
              />
              <input
                type="text"
                name="building"
                value={eventData.building}
                onChange={handleInputChange}
                placeholder="Building (optional)"
              />
              <input
                type="text"
                name="street"
                value={eventData.street}
                onChange={handleInputChange}
                placeholder="Street (optional)"
              />
              <input
                type="text"
                name="city"
                value={eventData.city}
                onChange={handleInputChange}
                placeholder="City"
                required
              />
              <input
                type="text"
                name="country"
                value={eventData.country}
                onChange={handleInputChange}
                placeholder="Country"
                required
              />
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="image_url">Image URL:</label>
          <input
            type="text"
            name="image_url"
            value={eventData.image_url}
            onChange={handleInputChange}
            placeholder="Enter image URL (optional)"
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Event Price:</label>
          <input
            type="number"
            name="price"
            value={eventData.price}
            onChange={handleInputChange}
            placeholder="Enter price"
          />
        </div>
        <div className="form-group">
          <label htmlFor="quantity">Event Capacity:</label>
          <input
            type="number"
            name="quantity"
            value={eventData.quantity}
            onChange={handleInputChange}
            placeholder="Enter capacity"
            min="0"
          />
        </div>
      </div>
      <div className="button-group">
        <button type="submit">
          {initialData ? "Update Event" : "Create Event"}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
