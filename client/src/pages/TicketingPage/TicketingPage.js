import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./TicketingPage.css";  // Ensure this file is updated
import noImageIcon from "./Images/logo-colors.png";
import beachimage from "./Images/beach-cleanup-image.png";

// Full list of events with description and price
const events = [
  {
    id: 1,
    title: "BEACH CLEAN UP FOR FAMILY",
    date: "Mon, November 13, 2023",
    location: "Public Beach Beirut",
    tags: ["Activity"],
    description: "Join us for a fun family event to clean up the beach.",
    price: {
      adult: 10,
      child: 5,
      vip: 20,
    },
    image: beachimage,
  },
  {
    id: 2,
    title: "Birthday Party Package - Beirut Cultural Tour",
    date: "Available every day",
    location: "Beirut, Lebanon",
    tags: ["Activity", "Birthday in Beirut", "Cultural Tour"],
    description: "Celebrate your birthday with a cultural tour of Beirut.",
    price: {
      adult: 25,
      child: 10,
      vip: 40,
    },
    image: noImageIcon,
  },
  {
    id: 3,
    title: "Birthday Party Package to the Chocolate Museum",
    date: "Available every day",
    location: "Chocolate Museum, Beirut",
    tags: ["Activity", "Chocolate Workshop", "Choco Fun"],
    description: "An exciting chocolate workshop and museum visit.",
    price: {
      adult: 20,
      child: 10,
      vip: 35,
    },
    image: noImageIcon,
  },
  {
    id: 4,
    title: "BOARD GAMES ACTIVITIES FOR KIDS",
    date: "Sat, November 30, 2024",
    location: "+5 dates",
    tags: ["Activity"],
    description: "A fun-filled day of board games for children.",
    price: {
      adult: 0,
      child: 0,
      vip: 0,
    },
    image: noImageIcon,
  },
  {
    id: 5,
    title: "BEACH CLEAN UP FOR FAMILY",
    date: "Mon, November 13, 2023",
    location: "Public Beach Beirut",
    tags: ["Activity"],
    description: "Join us for a fun family event to clean up the beach.",
    price: {
      adult: 60,
      child: 30,
      vip: 80,
    },
    image: beachimage,
  },
  {
    id: 6,
    title: "Birthday Party Package - Beirut Cultural Tour",
    date: "Available every day",
    location: "Beirut, Lebanon",
    tags: ["Activity", "Birthday in Beirut", "Cultural Tour"],
    description: "Celebrate your birthday with a cultural tour of Beirut.",
    price: {
      adult: 50,
      child: 25,
      vip: 60,
    },
    image: noImageIcon,
  },
  {
    id: 7,
    title: "Birthday Party Package to the Chocolate Museum",
    date: "Available every day",
    location: "Chocolate Museum, Beirut",
    tags: ["Activity", "Chocolate Workshop", "Choco Fun"],
    description: "An exciting chocolate workshop and museum visit.",
    price: {
      adult: 5,
      child: 3,
      vip: 10,
    },
    image: noImageIcon,
  },
  {
    id: 8,
    title: "BOARD GAMES ACTIVITIES FOR KIDS",
    date: "Sat, November 30, 2024",
    location: "+5 dates",
    tags: ["Activity"],
    description: "A fun-filled day of board games for children.",
    price: {
      adult: 0,
      child: 0,
      vip: 0,
    },
    image: noImageIcon,
  },
  {
    id: 9,
    title: "BEACH CLEAN UP FOR FAMILY",
    date: "Mon, November 13, 2023",
    location: "Public Beach Beirut",
    tags: ["Activity"],
    description: "Join us for a fun family event to clean up the beach.",
    price: {
      adult: 20,
      child: 10,
      vip: 30,
    },
    image: beachimage,
  },
  {
    id: 10,
    title: "Birthday Party Package - Beirut Cultural Tour",
    date: "Available every day",
    location: "Beirut, Lebanon",
    tags: ["Activity", "Birthday in Beirut", "Cultural Tour"],
    description: "Celebrate your birthday with a cultural tour of Beirut.",
    price: {
      adult: 50,
      child: 20,
      vip: 60,
    },
    image: noImageIcon,
  },
];

const TicketingPage = () => {
  const { eventId } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [adultTickets, setAdultTickets] = useState(0);
  const [childTickets, setChildTickets] = useState(0);
  const [vipTickets, setVipTickets] = useState(0);

  useEffect(() => {
    const event = events.find((event) => event.id === parseInt(eventId));
    setEventDetails(event);
  }, [eventId]);

  const calculateTotalFees = () => {
    if (!eventDetails) return 0;
    const adultTotal = adultTickets * eventDetails.price.adult;
    const childTotal = childTickets * eventDetails.price.child || 0;
    const vipTotal = vipTickets * eventDetails.price.vip;
    return adultTotal + childTotal + vipTotal;
  };

  if (!eventDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="ticketing-page">
      <h1>{eventDetails.title}</h1>
      <div className="ticket-info">
        <img
          src={eventDetails.image || noImageIcon}
          alt={eventDetails.title}
          className="event-image"
        />
        <div>
          <p><strong>Date:</strong> {eventDetails.date}</p>
          <p><strong>Location:</strong> {eventDetails.location}</p>
          <p><strong>Description:</strong> {eventDetails.description}</p>
        </div>
      </div>

      {/* Ticket Details Section */}
      <div className="ticket-details">
        <h2>Ticket Information</h2>
        <div className="ticket-fee">
          <p><strong>Adult Ticket:</strong> ${eventDetails.price.adult}</p>
          <p><strong>Child Ticket:</strong> ${eventDetails.price.child}</p>
          <p><strong>VIP Ticket:</strong> ${eventDetails.price.vip}</p>
        </div>
      </div>

      {/* Ticket Selection */}
      <div className="ticket-selection">
        <h2>Select Tickets</h2>
        <div className="ticket-option">
          <label htmlFor="adult-tickets">Adult Tickets</label>
          <input
            type="number"
            id="adult-tickets"
            min="0"
            value={adultTickets}
            onChange={(e) => setAdultTickets(parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="ticket-option">
          <label htmlFor="child-tickets">Child Tickets</label>
          <input
            type="number"
            id="child-tickets"
            min="0"
            value={childTickets}
            onChange={(e) => setChildTickets(parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="ticket-option">
          <label htmlFor="vip-tickets">VIP Tickets</label>
          <input
            type="number"
            id="vip-tickets"
            min="0"
            value={vipTickets}
            onChange={(e) => setVipTickets(parseInt(e.target.value) || 0)}
          />
        </div>

        {/* Total Fees */}
        <div className="total-fees">
          <p><strong>Total Fees: </strong>${calculateTotalFees()}</p>
        </div>

        <button className="checkout-button">Proceed to Checkout</button>
      </div>
    </div>
  );
};

export default TicketingPage;