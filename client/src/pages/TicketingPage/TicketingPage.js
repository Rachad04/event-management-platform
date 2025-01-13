import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./TicketingPage.css";
import noImageIcon from "./Images/logo-colors.png";

const TicketingPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [eventDetails, setEventDetails] = useState(null);
  const [tickets, setTickets] = useState(0);
  const [totalFees, setTotalFees] = useState(0); // Track total fees in state
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch event details from the backend
  useEffect(() => {
    if (!eventId) {
      console.error("No valid eventId provided. Redirecting home...");
      navigate("/");
      return;
    }

    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/events/${eventId}`
        );

        if (response.data) {
          setEventDetails(response.data);
        } else {
          console.error("No event found for the given eventId.");
          alert("Event not found. Redirecting to homepage.");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        alert("Failed to load event details. Redirecting to homepage.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, navigate]);

  // Update total fees when tickets or eventDetails change
  useEffect(() => {
    if (eventDetails) {
      setTotalFees(tickets * eventDetails.price || 0);
    }
  }, [tickets, eventDetails]);

  // Handle changes in ticket input
  const handleTicketChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setTickets(value >= 0 ? value : 0); // Ensure no negative values
  };

  // Handle changes in payment input fields
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Handle the checkout process
  const handleCheckout = async (e) => {
    e.preventDefault();

    if (
      !paymentDetails.cardNumber ||
      !paymentDetails.cardHolder ||
      !paymentDetails.expiryDate ||
      !paymentDetails.cvv
    ) {
      alert("Please fill in all payment details.");
      return;
    }

    try {
      const paymentResponse = await axios.post(
        "http://localhost:5000/api/pay",
        {
          ticketId: eventId,
          paymentMethod: "Credit Card",
          tickets,
        }
      );

      console.log("Payment successful:", paymentResponse.data);
      alert("Payment Successful! Thank you for your purchase.");
      navigate("/");
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading event details...</div>;
  }

  if (!eventDetails) {
    return <div>No event found!</div>;
  }

  return (
    <div className="ticketing-page">
      <div className="title-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          &#x3C;
        </button>
        <h1>{eventDetails.title}</h1>
      </div>

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

      <div className="ticket-selection">
        <h2>Select Tickets</h2>
        <div className="ticket-option">
          <label htmlFor="tickets">Tickets</label>
          <input
            type="number"
            id="tickets"
            min="0"
            value={tickets}
            onChange={handleTicketChange}
          />
        </div>
        <div className="total-fees">
          <p>
            <strong>Total Fees:</strong> ${totalFees.toFixed(2)}
          </p>
        </div>
      </div>

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
