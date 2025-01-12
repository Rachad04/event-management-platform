import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./TicketingPage.css";
import noImageIcon from "./Images/logo-colors.png";

const TicketingPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [eventDetails, setEventDetails] = useState(null);
  const [tickets, setTickets] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event details");
        }
        const data = await response.json();
        setEventDetails(data);
      } catch (error) {
        console.error("Error fetching event details:", error);
        navigate("/error"); // Redirect to an error page if needed
      }
    };

    fetchEventDetails();
  }, [eventId, navigate]);

  const calculateTotalFees = () => {
    if (!eventDetails) return 0;
    return tickets * eventDetails.price;
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = (e) => {
    e.preventDefault();

    // Input validation for payment details
    if (
      !paymentDetails.cardNumber ||
      !paymentDetails.cardHolder ||
      !paymentDetails.expiryDate ||
      !paymentDetails.cvv
    ) {
      alert("Please fill in all payment details.");
      return;
    }

    console.log("Payment Details:", paymentDetails);
    console.log("Tickets Count:", tickets);
    alert("Payment Successful! Thank you for your purchase.");
  };

  if (!eventDetails) {
    return <div>Loading event details...</div>;
  }

  return (
    <div className="ticketing-page">
      {/* Title Section */}
      <div className="title-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          &#x3C;
        </button>
        <h1>{eventDetails.title}</h1>
      </div>

      {/* Event Details */}
      <div className="ticket-info">
        <img
          src={eventDetails.image_url || noImageIcon}
          alt={eventDetails.title}
          className="event-image"
        />
        <div>
          <p>
            <strong>Date:</strong> {eventDetails.date}
          </p>
          <p>
            <strong>Location:</strong> {eventDetails.location}
          </p>
          <p>
            <strong>Description:</strong> {eventDetails.description}
          </p>
        </div>
      </div>

      {/* Ticket Selection */}
      <div className="ticket-selection">
        <h2>Select Tickets</h2>
        <div className="ticket-option">
          <label htmlFor="tickets">Tickets</label>
          <input
            type="number"
            id="tickets"
            min="0"
            value={tickets}
            onChange={(e) => setTickets(parseInt(e.target.value) || 0)}
          />
        </div>

        {/* Total Fees */}
        <div className="total-fees">
          <p>
            <strong>Total Fees: </strong>${calculateTotalFees()}
          </p>
        </div>
      </div>

      {/* Payment Section */}
      <div className="payment-section">
        <h2>Payment Details</h2>
        <form onSubmit={handleCheckout}>
          <div className="payment-field">
            <label htmlFor="cardNumber">Card Number</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={paymentDetails.cardNumber}
              onChange={handlePaymentChange}
              required
            />
          </div>
          <div className="payment-field">
            <label htmlFor="cardHolder">Card Holder Name</label>
            <input
              type="text"
              id="cardHolder"
              name="cardHolder"
              value={paymentDetails.cardHolder}
              onChange={handlePaymentChange}
              required
            />
          </div>
          <div className="payment-row">
            <div className="payment-field">
              <label htmlFor="expiryDate">Expiry Date</label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                placeholder="MM/YY"
                value={paymentDetails.expiryDate}
                onChange={handlePaymentChange}
                required
              />
            </div>
            <div className="payment-field">
              <label htmlFor="cvv">CVV</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={paymentDetails.cvv}
                onChange={handlePaymentChange}
                required
              />
            </div>
          </div>
          <button className="checkout-button" type="submit">
            Proceed to Checkout
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketingPage;
